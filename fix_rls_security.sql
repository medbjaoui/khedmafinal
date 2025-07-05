-- =====================================================
-- SCRIPT DE CORRECTION DES VULNÉRABILITÉS RLS
-- =====================================================
-- Ce script corrige les vulnérabilités de sécurité critiques
-- identifiées dans l'implémentation RLS de Supabase
-- 
-- ⚠️  ATTENTION: Exécuter ce script en production après tests
-- =====================================================

-- Phase 1: Supprimer toutes les politiques temporaires dangereuses
-- Ces politiques utilisent "using (true)" et permettent l'accès à tous les utilisateurs authentifiés

DROP POLICY IF EXISTS "Temporary admin access - admin_settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Temporary admin access - jobs" ON public.jobs;
DROP POLICY IF EXISTS "Temporary admin access - system_alerts" ON public.system_alerts;
DROP POLICY IF EXISTS "Temporary admin access - system_logs" ON public.system_logs;
DROP POLICY IF EXISTS "Temporary admin access - transactions" ON public.transactions;
DROP POLICY IF EXISTS "Temporary admin access - user_profiles" ON public.user_profiles;

-- Phase 2: Renforcer la fonction is_admin() avec des vérifications supplémentaires
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Vérification de base
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Vérification que l'utilisateur est confirmé et a le rôle Admin
  RETURN (
    SELECT COALESCE(raw_user_meta_data->>'role', '') = 'Admin'
    FROM auth.users
    WHERE id = auth.uid()
    AND email_confirmed_at IS NOT NULL
    AND banned_until IS NULL
  );
END;
$function$;

-- Phase 3: Créer des politiques appropriées pour chaque table

-- =====================================================
-- POLITIQUES POUR LA TABLE JOBS
-- =====================================================

-- Tous les utilisateurs authentifiés peuvent voir les jobs actifs
CREATE POLICY "Public can view active jobs"
ON "public"."jobs"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (is_active = true);

-- Seuls les admins peuvent gérer les jobs
CREATE POLICY "Admins can manage jobs"
ON "public"."jobs"
AS PERMISSIVE
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- =====================================================
-- POLITIQUES POUR LA TABLE TRANSACTIONS
-- =====================================================

-- Les utilisateurs peuvent voir leurs propres transactions
CREATE POLICY "Users can view own transactions"
ON "public"."transactions"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Les utilisateurs peuvent créer leurs propres transactions
CREATE POLICY "Users can create own transactions"
ON "public"."transactions"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Seuls les admins peuvent gérer toutes les transactions
CREATE POLICY "Admins can manage all transactions"
ON "public"."transactions"
AS PERMISSIVE
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- =====================================================
-- POLITIQUES POUR LA TABLE USER_PROFILES
-- =====================================================

-- Les utilisateurs peuvent voir leur propre profil (déjà existant)
-- CREATE POLICY "Users can view own profile" existe déjà

-- Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile"
ON "public"."user_profiles"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Les utilisateurs peuvent créer leur propre profil
CREATE POLICY "Users can create own profile"
ON "public"."user_profiles"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Politique existante "Admins can view all profiles" est conservée

-- =====================================================
-- POLITIQUES POUR LA TABLE SYSTEM_LOGS
-- =====================================================

-- Seuls les admins peuvent voir les logs système
-- La politique "Admins can access system logs" existe déjà et est correcte

-- Autoriser l'insertion de logs par le système
CREATE POLICY "System can insert logs"
ON "public"."system_logs"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);

-- =====================================================
-- POLITIQUES POUR LA TABLE SYSTEM_ALERTS
-- =====================================================

-- Seuls les admins peuvent voir les alertes système
-- La politique "Admins can access system alerts" existe déjà et est correcte

-- Autoriser l'insertion d'alertes par le système
CREATE POLICY "System can insert alerts"
ON "public"."system_alerts"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);

-- =====================================================
-- POLITIQUES POUR LA TABLE ADMIN_SETTINGS
-- =====================================================

-- Seuls les admins peuvent accéder aux paramètres admin
-- La politique "Admins can access admin settings" existe déjà et est correcte

-- =====================================================
-- FONCTION D'AUDIT - Enregistrer les accès admin
-- =====================================================

CREATE OR REPLACE FUNCTION public.log_admin_access(
  action_type text,
  table_name text,
  record_id uuid DEFAULT NULL,
  details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  IF is_admin() THEN
    INSERT INTO system_logs (level, message, source, details, user_id)
    VALUES (
      'INFO',
      'Admin access: ' || action_type || ' on ' || table_name,
      'admin_audit',
      jsonb_build_object(
        'action', action_type,
        'table', table_name,
        'record_id', record_id,
        'details', details
      ),
      auth.uid()
    );
  END IF;
END;
$function$;

-- =====================================================
-- TRIGGERS D'AUDIT POUR LES ACCÈS ADMIN
-- =====================================================

-- Trigger pour auditer les accès aux paramètres admin
CREATE OR REPLACE FUNCTION public.audit_admin_settings()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'SELECT' THEN
    PERFORM log_admin_access('SELECT', 'admin_settings', NULL, jsonb_build_object('key', NEW.key));
  ELSIF TG_OP = 'INSERT' THEN
    PERFORM log_admin_access('INSERT', 'admin_settings', NULL, jsonb_build_object('key', NEW.key));
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM log_admin_access('UPDATE', 'admin_settings', NULL, jsonb_build_object('key', NEW.key));
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_admin_access('DELETE', 'admin_settings', NULL, jsonb_build_object('key', OLD.key));
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- =====================================================
-- VÉRIFICATIONS DE SÉCURITÉ SUPPLÉMENTAIRES
-- =====================================================

-- Fonction pour vérifier l'intégrité des politiques RLS
CREATE OR REPLACE FUNCTION public.verify_rls_integrity()
RETURNS TABLE(
  table_name text,
  has_rls boolean,
  policy_count integer,
  has_dangerous_policies boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    t.schemaname || '.' || t.tablename as table_name,
    t.rowsecurity as has_rls,
    COUNT(p.policyname) as policy_count,
    bool_or(p.qual IS NULL OR p.qual = 'true'::text) as has_dangerous_policies
  FROM pg_tables t
  LEFT JOIN pg_policies p ON t.tablename = p.tablename
  WHERE t.schemaname = 'public'
  GROUP BY t.schemaname, t.tablename, t.rowsecurity
  ORDER BY t.tablename;
END;
$function$;

-- =====================================================
-- SCRIPT DE VALIDATION
-- =====================================================

-- Vérifier que toutes les politiques dangereuses ont été supprimées
DO $$
DECLARE
  dangerous_policies_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO dangerous_policies_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND (
    policyname LIKE '%Temporary admin access%'
    OR (qual = 'true'::text AND policyname NOT LIKE '%System can%')
  );
  
  IF dangerous_policies_count > 0 THEN
    RAISE NOTICE 'ATTENTION: Il reste % politiques potentiellement dangereuses', dangerous_policies_count;
  ELSE
    RAISE NOTICE 'SUCCÈS: Toutes les politiques dangereuses ont été supprimées';
  END IF;
END;
$$;

-- =====================================================
-- COMMENTAIRES DE DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION public.is_admin() IS 'Fonction renforcée pour vérifier les privilèges administrateur avec vérifications de sécurité supplémentaires';
COMMENT ON FUNCTION public.log_admin_access(text, text, uuid, jsonb) IS 'Fonction d''audit pour enregistrer tous les accès administrateur';
COMMENT ON FUNCTION public.verify_rls_integrity() IS 'Fonction de vérification de l''intégrité des politiques RLS';

-- =====================================================
-- INSTRUCTIONS POST-EXÉCUTION
-- =====================================================

-- Exécuter cette requête pour vérifier l'état final des politiques
-- SELECT * FROM public.verify_rls_integrity();

-- Vérifier que les admins peuvent toujours accéder aux ressources nécessaires
-- SELECT public.is_admin();

-- Tester l'accès avec un utilisateur normal pour s'assurer qu'il ne peut pas
-- accéder aux ressources administratives

RAISE NOTICE '=================================================';
RAISE NOTICE 'SCRIPT DE CORRECTION RLS TERMINÉ';
RAISE NOTICE '=================================================';
RAISE NOTICE 'Actions effectuées:';
RAISE NOTICE '1. Suppression des politiques temporaires dangereuses';
RAISE NOTICE '2. Renforcement de la fonction is_admin()';
RAISE NOTICE '3. Création de politiques appropriées pour chaque table';
RAISE NOTICE '4. Ajout de fonctions d''audit et de vérification';
RAISE NOTICE '=================================================';
RAISE NOTICE 'PROCHAINES ÉTAPES:';
RAISE NOTICE '1. Exécuter: SELECT * FROM public.verify_rls_integrity();';
RAISE NOTICE '2. Tester l''accès avec différents types d''utilisateurs';
RAISE NOTICE '3. Valider que les admins conservent leurs privilèges';
RAISE NOTICE '=================================================';