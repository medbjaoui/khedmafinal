-- =====================================================
-- SCRIPT POUR DÉSACTIVER COMPLÈTEMENT RLS
-- =====================================================
-- Ce script désactive Row Level Security sur toutes les tables
-- et supprime toutes les politiques RLS existantes
-- 
-- ⚠️  ATTENTION: Ce script supprime toute la sécurité au niveau ligne
-- Les données seront accessibles à tous les utilisateurs authentifiés
-- =====================================================

-- Phase 1: Supprimer toutes les politiques RLS existantes
-- =====================================================

-- Supprimer les politiques dangereuses temporaires
DROP POLICY IF EXISTS "Temporary admin access - admin_settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Temporary admin access - jobs" ON public.jobs;
DROP POLICY IF EXISTS "Temporary admin access - system_alerts" ON public.system_alerts;
DROP POLICY IF EXISTS "Temporary admin access - system_logs" ON public.system_logs;
DROP POLICY IF EXISTS "Temporary admin access - transactions" ON public.transactions;
DROP POLICY IF EXISTS "Temporary admin access - user_profiles" ON public.user_profiles;

-- Supprimer toutes les autres politiques sur admin_settings
DROP POLICY IF EXISTS "Admins can access admin settings" ON public.admin_settings;

-- Supprimer toutes les politiques sur ai_settings
DROP POLICY IF EXISTS "Users can manage own AI settings" ON public.ai_settings;

-- Supprimer toutes les politiques sur ai_usage
DROP POLICY IF EXISTS "System can insert AI usage" ON public.ai_usage;
DROP POLICY IF EXISTS "Users can view own AI usage" ON public.ai_usage;

-- Supprimer toutes les politiques sur applications
DROP POLICY IF EXISTS "Users can manage own applications" ON public.applications;

-- Supprimer toutes les politiques sur auto_application_settings
DROP POLICY IF EXISTS "Users can manage own auto application settings" ON public.auto_application_settings;

-- Supprimer toutes les politiques sur auto_application_stats
DROP POLICY IF EXISTS "Users can view own auto application stats" ON public.auto_application_stats;

-- Supprimer toutes les politiques sur auto_application_templates
DROP POLICY IF EXISTS "Users can manage own auto application templates" ON public.auto_application_templates;

-- Supprimer toutes les politiques sur certifications
DROP POLICY IF EXISTS "Users can manage own certifications" ON public.certifications;

-- Supprimer toutes les politiques sur cv_versions
DROP POLICY IF EXISTS "Users can manage own CV versions" ON public.cv_versions;

-- Supprimer toutes les politiques sur education
DROP POLICY IF EXISTS "Users can manage own education" ON public.education;

-- Supprimer toutes les politiques sur email_logs
DROP POLICY IF EXISTS "Users can view own email logs" ON public.email_logs;

-- Supprimer toutes les politiques sur experiences
DROP POLICY IF EXISTS "Users can manage own experiences" ON public.experiences;

-- Supprimer toutes les politiques sur jobs
DROP POLICY IF EXISTS "Public can view active jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can manage jobs" ON public.jobs;

-- Supprimer toutes les politiques sur languages
DROP POLICY IF EXISTS "Users can manage own languages" ON public.languages;

-- Supprimer toutes les politiques sur notifications
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;

-- Supprimer toutes les politiques sur recommendations
DROP POLICY IF EXISTS "Users can manage own recommendations" ON public.recommendations;

-- Supprimer toutes les politiques sur recruiter_responses
DROP POLICY IF EXISTS "Users can view own recruiter responses" ON public.recruiter_responses;

-- Supprimer toutes les politiques sur saved_jobs
DROP POLICY IF EXISTS "Users can manage own saved jobs" ON public.saved_jobs;

-- Supprimer toutes les politiques sur skills
DROP POLICY IF EXISTS "Users can manage own skills" ON public.skills;

-- Supprimer toutes les politiques sur system_alerts
DROP POLICY IF EXISTS "Admins can access system alerts" ON public.system_alerts;
DROP POLICY IF EXISTS "System can insert alerts" ON public.system_alerts;

-- Supprimer toutes les politiques sur system_logs
DROP POLICY IF EXISTS "Admins can access system logs" ON public.system_logs;
DROP POLICY IF EXISTS "System can insert logs" ON public.system_logs;

-- Supprimer toutes les politiques sur transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can manage all transactions" ON public.transactions;

-- Supprimer toutes les politiques sur user_email_aliases
DROP POLICY IF EXISTS "Users can manage own email aliases" ON public.user_email_aliases;

-- Supprimer toutes les politiques sur user_profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON public.user_profiles;

-- Supprimer les politiques de storage
DROP POLICY IF EXISTS "Allow authenticated select on cvs" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated insert on cvs" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update on cvs" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete on cvs" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete cover letters" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update cover letters" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload cover letters" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view cover letters" ON storage.objects;

-- Phase 2: Désactiver RLS sur toutes les tables
-- =====================================================

-- Désactiver RLS sur toutes les tables principales
ALTER TABLE public.admin_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_application_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_application_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_application_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.education DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_email_aliases DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Phase 3: Vérification et nettoyage
-- =====================================================

-- Fonction pour lister toutes les politiques restantes
CREATE OR REPLACE FUNCTION public.list_remaining_policies()
RETURNS TABLE(
  schemaname text,
  tablename text,
  policyname text,
  permissive text,
  roles text[],
  cmd text,
  qual text,
  with_check text
)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.schemaname,
    p.tablename,
    p.policyname,
    p.permissive,
    p.roles,
    p.cmd,
    p.qual,
    p.with_check
  FROM pg_policies p
  WHERE p.schemaname IN ('public', 'storage')
  ORDER BY p.schemaname, p.tablename, p.policyname;
END;
$function$;

-- Fonction pour vérifier l'état RLS des tables
CREATE OR REPLACE FUNCTION public.check_rls_status()
RETURNS TABLE(
  schemaname text,
  tablename text,
  row_security boolean,
  policies_count integer
)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    t.schemaname,
    t.tablename,
    t.rowsecurity,
    COUNT(p.policyname)::integer
  FROM pg_tables t
  LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
  WHERE t.schemaname = 'public'
  GROUP BY t.schemaname, t.tablename, t.rowsecurity
  ORDER BY t.tablename;
END;
$function$;

-- =====================================================
-- SCRIPT DE VALIDATION
-- =====================================================

DO $$
DECLARE
  rls_enabled_count INTEGER;
  policies_count INTEGER;
BEGIN
  -- Compter les tables avec RLS encore activé
  SELECT COUNT(*) INTO rls_enabled_count
  FROM pg_tables
  WHERE schemaname = 'public'
  AND rowsecurity = true;
  
  -- Compter les politiques restantes
  SELECT COUNT(*) INTO policies_count
  FROM pg_policies
  WHERE schemaname IN ('public', 'storage');
  
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'RÉSULTAT DE LA DÉSACTIVATION RLS';
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'Tables avec RLS encore activé: %', rls_enabled_count;
  RAISE NOTICE 'Politiques RLS restantes: %', policies_count;
  
  IF rls_enabled_count = 0 AND policies_count = 0 THEN
    RAISE NOTICE 'SUCCÈS: RLS complètement désactivé sur toutes les tables';
  ELSE
    RAISE NOTICE 'ATTENTION: RLS pas complètement désactivé';
  END IF;
  
  RAISE NOTICE '=================================================';
END;
$$;

-- =====================================================
-- INSTRUCTIONS POST-EXÉCUTION
-- =====================================================

-- Exécuter ces requêtes pour vérifier l'état final
-- SELECT * FROM public.check_rls_status();
-- SELECT * FROM public.list_remaining_policies();

-- =====================================================
-- SCRIPT DE RÉACTIVATION (optionnel)
-- =====================================================

-- Si vous voulez réactiver RLS plus tard, décommentez les lignes suivantes :
/*
-- Réactiver RLS sur toutes les tables
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_application_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_application_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_application_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_email_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
*/

RAISE NOTICE '=================================================';
RAISE NOTICE 'DÉSACTIVATION RLS TERMINÉE';
RAISE NOTICE '=================================================';
RAISE NOTICE 'ACTIONS EFFECTUÉES:';
RAISE NOTICE '1. Suppression de toutes les politiques RLS';
RAISE NOTICE '2. Désactivation RLS sur 24 tables';
RAISE NOTICE '3. Création des fonctions de vérification';
RAISE NOTICE '=================================================';
RAISE NOTICE 'PROCHAINES ÉTAPES:';
RAISE NOTICE '1. Exécuter: SELECT * FROM public.check_rls_status();';
RAISE NOTICE '2. Exécuter: SELECT * FROM public.list_remaining_policies();';
RAISE NOTICE '3. Tester l''accès aux données';
RAISE NOTICE '=================================================';
RAISE NOTICE '⚠️  ATTENTION: Toutes les données sont maintenant';
RAISE NOTICE '⚠️  accessibles à tous les utilisateurs authentifiés';
RAISE NOTICE '=================================================';