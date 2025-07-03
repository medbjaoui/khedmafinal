-- Script de nettoyage complet pour Supabase
-- À exécuter dans le SQL Editor du dashboard Supabase

-- 1. Supprimer le schéma public et le recréer
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- 2. Nettoyer les tables auth (utilisateurs, sessions, etc.)
TRUNCATE TABLE auth.users CASCADE;
TRUNCATE TABLE auth.identities CASCADE;
TRUNCATE TABLE auth.sessions CASCADE;
TRUNCATE TABLE auth.refresh_tokens CASCADE;
TRUNCATE TABLE auth.mfa_factors CASCADE;
TRUNCATE TABLE auth.mfa_challenges CASCADE;
TRUNCATE TABLE auth.flow_state CASCADE;
TRUNCATE TABLE auth.audit_log_entries CASCADE;
TRUNCATE TABLE auth.instances CASCADE;
TRUNCATE TABLE auth.sso_providers CASCADE;
TRUNCATE TABLE auth.saml_providers CASCADE;
TRUNCATE TABLE auth.saml_relay_states CASCADE;
TRUNCATE TABLE auth.sso_domains CASCADE;
TRUNCATE TABLE auth.one_time_tokens CASCADE;

-- 3. Nettoyer les tables storage (fichiers)
TRUNCATE TABLE storage.objects CASCADE;
TRUNCATE TABLE storage.migrations CASCADE;
TRUNCATE TABLE storage.buckets CASCADE;

-- 4. Réinitialiser la table des migrations Supabase
TRUNCATE TABLE supabase_migrations.schema_migrations;

-- 5. Créer la fonction utilitaire update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql'; 