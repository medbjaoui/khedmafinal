-- =====================================================
-- SCRIPT DE CORRECTION COMPLÈTE DES VULNÉRABILITÉS RLS
-- =====================================================
-- Version 2.0 - Correction de TOUTES les vulnérabilités critiques
-- ⚠️  EXÉCUTION URGENTE REQUISE EN PRODUCTION
-- =====================================================

BEGIN;

-- =====================================================
-- PHASE 1: SUPPRIMER TOUTES LES POLITIQUES DANGEREUSES
-- =====================================================

-- Politiques "to public" CRITIQUES (permettent accès non-authentifié)
DROP POLICY IF EXISTS "Admins can access admin settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Admins can access system alerts" ON public.system_alerts;  
DROP POLICY IF EXISTS "Admins can access system logs" ON public.system_logs;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;

-- Politiques temporaires permissives (using true)
DROP POLICY IF EXISTS "Temporary admin access - admin_settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Temporary admin access - jobs" ON public.jobs;
DROP POLICY IF EXISTS "Temporary admin access - system_alerts" ON public.system_alerts;
DROP POLICY IF EXISTS "Temporary admin access - system_logs" ON public.system_logs;
DROP POLICY IF EXISTS "Temporary admin access - transactions" ON public.transactions;
DROP POLICY IF EXISTS "Temporary admin access - user_profiles" ON public.user_profiles;

-- Politique notifications dangereuse (with check true)
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- =====================================================
-- PHASE 2: RENFORCER LA FONCTION is_admin()
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Vérifications de sécurité renforcées
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Vérifier que l'utilisateur est confirmé, actif et a le rôle Admin
  RETURN (
    SELECT COALESCE(raw_user_meta_data->>'role', '') = 'Admin'
    FROM auth.users
    WHERE id = auth.uid()
    AND email_confirmed_at IS NOT NULL
    AND banned_until IS NULL
    AND deleted_at IS NULL
  );
END;
$function$;

-- =====================================================
-- PHASE 3: CRÉER DES POLITIQUES SÉCURISÉES
-- =====================================================

-- =====================================================
-- ADMIN_SETTINGS - Seulement pour admins authentifiés
-- =====================================================

CREATE POLICY "Admins can access admin settings"
ON "public"."admin_settings"
AS PERMISSIVE
FOR ALL
TO authenticated  -- CORRIGÉ: était "to public"
USING (is_admin())
WITH CHECK (is_admin());

-- =====================================================
-- SYSTEM_ALERTS - Seulement pour admins authentifiés  
-- =====================================================

CREATE POLICY "Admins can access system alerts"
ON "public"."system_alerts"
AS PERMISSIVE
FOR ALL
TO authenticated  -- CORRIGÉ: était "to public" 
USING (is_admin())
WITH CHECK (is_admin());

-- Permettre l'insertion d'alertes par le système
CREATE POLICY "System can insert alerts"
ON "public"."system_alerts"
AS PERMISSIVE
FOR INSERT
TO service_role  -- Plus sécurisé que authenticated
WITH CHECK (true);

-- =====================================================
-- SYSTEM_LOGS - Seulement pour admins authentifiés
-- =====================================================

CREATE POLICY "Admins can access system logs"
ON "public"."system_logs"
AS PERMISSIVE
FOR ALL
TO authenticated  -- CORRIGÉ: était "to public"
USING (is_admin())
WITH CHECK (is_admin());

-- Permettre l'insertion de logs par le système
CREATE POLICY "System can insert logs"
ON "public"."system_logs"
AS PERMISSIVE
FOR INSERT
TO service_role  -- Plus sécurisé que authenticated
WITH CHECK (true);

-- =====================================================
-- USER_PROFILES - Accès granulaire et sécurisé
-- =====================================================

-- Admins peuvent voir tous les profils
CREATE POLICY "Admins can view all profiles"
ON "public"."user_profiles"
AS PERMISSIVE
FOR SELECT
TO authenticated  -- CORRIGÉ: était "to public"
USING (is_admin());

-- Admins peuvent modifier tous les profils
CREATE POLICY "Admins can modify all profiles"
ON "public"."user_profiles"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
ON "public"."user_profiles"
AS PERMISSIVE
FOR SELECT
TO authenticated  -- CORRIGÉ: était "to public"
USING (auth.uid() = id);

-- Utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile"
ON "public"."user_profiles"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Utilisateurs peuvent créer leur propre profil
CREATE POLICY "Users can create own profile"
ON "public"."user_profiles"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- =====================================================
-- TRANSACTIONS - Accès strictement contrôlé
-- =====================================================

-- Utilisateurs peuvent voir leurs propres transactions
CREATE POLICY "Users can view own transactions"
ON "public"."transactions"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Utilisateurs peuvent créer leurs propres transactions
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
-- JOBS - Accès public en lecture, admin en écriture
-- =====================================================

-- Lecture publique des jobs actifs pour utilisateurs authentifiés
CREATE POLICY "Authenticated users can view active jobs"
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
-- NOTIFICATIONS - Système sécurisé et contrôlé
-- =====================================================

-- Seulement le système peut insérer des notifications via les fonctions
CREATE POLICY "System functions can insert notifications"
ON "public"."notifications"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  -- Vérifier que l'insertion vient d'une fonction système autorisée
  current_setting('request.jwt.claims')::json->>'role' = 'service_role'
  OR (
    -- Ou permettre aux utilisateurs de créer des notifications pour eux-mêmes uniquement
    auth.uid() = user_id
    AND type IN ('user_action', 'self_reminder')
  )
);

-- =====================================================
-- FONCTIONS DE SÉCURITÉ AVANCÉES
-- =====================================================

-- Fonction pour créer des notifications de manière sécurisée
CREATE OR REPLACE FUNCTION public.create_secure_notification(
  target_user_id uuid,
  notification_type text,
  notification_title text,
  notification_message text,
  notification_priority text DEFAULT 'medium',
  notification_action_url text DEFAULT NULL,
  notification_metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  notification_id uuid;
  caller_id uuid;
BEGIN
  caller_id := auth.uid();
  
  -- Vérifications de sécurité
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Seuls les admins ou l'utilisateur lui-même peuvent créer des notifications
  IF NOT (is_admin() OR caller_id = target_user_id) THEN
    RAISE EXCEPTION 'Permission denied: cannot create notification for other users';
  END IF;
  
  -- Insérer la notification
  INSERT INTO public.notifications (
    user_id, type, title, message, priority, action_url, metadata
  ) VALUES (
    target_user_id, notification_type, notification_title, 
    notification_message, notification_priority, notification_action_url, notification_metadata
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$function$;

-- Fonction de vérification de l'intégrité des politiques
CREATE OR REPLACE FUNCTION public.verify_rls_security()
RETURNS TABLE(
  table_name text,
  has_rls boolean,
  total_policies integer,
  dangerous_policies integer,
  public_policies integer,
  security_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    t.schemaname || '.' || t.tablename as table_name,
    t.rowsecurity as has_rls,
    COUNT(p.policyname) as total_policies,
    COUNT(p.policyname) FILTER (
      WHERE p.qual = 'true'::text 
      AND p.policyname NOT LIKE '%System can insert%'
      AND p.policyname NOT LIKE '%service_role%'
    ) as dangerous_policies,
    COUNT(p.policyname) FILTER (
      WHERE p.roles = '{public}'::name[]
    ) as public_policies,
    CASE 
      WHEN NOT t.rowsecurity THEN 'NO RLS ENABLED'
      WHEN COUNT(p.policyname) FILTER (WHERE p.qual = 'true'::text AND p.policyname NOT LIKE '%System can insert%') > 0 
        THEN 'DANGEROUS POLICIES FOUND'
      WHEN COUNT(p.policyname) FILTER (WHERE p.roles = '{public}'::name[]) > 0 
        THEN 'PUBLIC ACCESS FOUND'
      ELSE 'SECURE'
    END as security_status
  FROM pg_tables t
  LEFT JOIN pg_policies p ON t.tablename = p.tablename AND p.schemaname = 'public'
  WHERE t.schemaname = 'public'
  GROUP BY t.schemaname, t.tablename, t.rowsecurity
  ORDER BY t.tablename;
END;
$function$;

-- =====================================================
-- AUDIT ET LOGGING RENFORCÉ
-- =====================================================

-- Fonction d'audit des accès critiques
CREATE OR REPLACE FUNCTION public.audit_critical_access()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Auditer les accès aux tables critiques
  IF TG_TABLE_NAME IN ('admin_settings', 'system_logs', 'system_alerts', 'transactions') THEN
    INSERT INTO system_logs (level, message, source, details, user_id)
    VALUES (
      'AUDIT',
      'Critical table access: ' || TG_OP || ' on ' || TG_TABLE_NAME,
      'security_audit',
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'user_id', auth.uid(),
        'timestamp', now()
      ),
      auth.uid()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Créer les triggers d'audit
CREATE TRIGGER audit_admin_settings_access
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.admin_settings
  FOR EACH STATEMENT EXECUTE FUNCTION audit_critical_access();

CREATE TRIGGER audit_system_logs_access
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.system_logs
  FOR EACH STATEMENT EXECUTE FUNCTION audit_critical_access();

-- =====================================================
-- VALIDATION FINALE
-- =====================================================

-- Vérifier que toutes les politiques dangereuses ont été supprimées
DO $$
DECLARE
  dangerous_count INTEGER;
  public_count INTEGER;
BEGIN
  -- Compter les politiques dangereuses restantes
  SELECT COUNT(*) INTO dangerous_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND (
    (qual = 'true'::text AND policyname NOT LIKE '%System can insert%' AND policyname NOT LIKE '%service_role%')
    OR policyname LIKE '%Temporary admin access%'
  );
  
  -- Compter les politiques publiques restantes  
  SELECT COUNT(*) INTO public_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND roles = '{public}'::name[];
  
  IF dangerous_count > 0 THEN
    RAISE NOTICE 'ATTENTION: % politiques dangereuses détectées!', dangerous_count;
  ELSE
    RAISE NOTICE 'SUCCÈS: Toutes les politiques dangereuses ont été supprimées';
  END IF;
  
  IF public_count > 0 THEN
    RAISE NOTICE 'ATTENTION: % politiques publiques détectées!', public_count;
  ELSE
    RAISE NOTICE 'SUCCÈS: Toutes les politiques publiques ont été sécurisées';
  END IF;
END;
$$;

COMMIT;

-- =====================================================
-- INSTRUCTIONS POST-EXÉCUTION
-- =====================================================

-- Vérifier l'état de sécurité final
-- SELECT * FROM public.verify_rls_security();

-- Tester l'accès admin
-- SELECT public.is_admin();

-- Vérifier les politiques restantes
-- SELECT schemaname, tablename, policyname, roles, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, policyname;

RAISE NOTICE '==========================================================';
RAISE NOTICE 'CORRECTION COMPLÈTE DES VULNÉRABILITÉS RLS TERMINÉE';
RAISE NOTICE '==========================================================';
RAISE NOTICE 'VULNÉRABILITÉS CORRIGÉES:';
RAISE NOTICE '1. ✅ Politiques "to public" supprimées et sécurisées';
RAISE NOTICE '2. ✅ Politiques temporaires "using (true)" supprimées';
RAISE NOTICE '3. ✅ Politique notifications dangereuse corrigée';
RAISE NOTICE '4. ✅ Fonction is_admin() renforcée';
RAISE NOTICE '5. ✅ Audit et logging mis en place';
RAISE NOTICE '==========================================================';
RAISE NOTICE 'ACTIONS REQUISES:';
RAISE NOTICE '1. Exécuter: SELECT * FROM public.verify_rls_security();';
RAISE NOTICE '2. Tester tous les types d''utilisateurs';
RAISE NOTICE '3. Vérifier les logs d''audit';
RAISE NOTICE '==========================================================';