-- =================================================================
-- SCHÉMA SQL COMPLET POUR NOUVEAU PROJET SUPABASE - KHEDMAFINAL
-- =================================================================
-- Version: 1.0.0
-- Date: 2025-01-04
-- Description: Schéma complet optimisé pour plateforme de recherche d'emploi
-- Auteur: KhedmaFinal Team

-- =================================================================
-- CONFIGURATION INITIALE
-- =================================================================

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Créer les types énumérés personnalisés
CREATE TYPE user_role AS ENUM ('User', 'Admin', 'Recruiter', 'Premium');
CREATE TYPE job_type AS ENUM ('CDI', 'CDD', 'Stage', 'Freelance', 'Interim');
CREATE TYPE application_status AS ENUM ('draft', 'sent', 'viewed', 'interview', 'rejected', 'accepted');
CREATE TYPE notification_type AS ENUM ('application', 'job', 'interview', 'reminder', 'system');
CREATE TYPE priority_level AS ENUM ('low', 'normal', 'medium', 'high', 'urgent');
CREATE TYPE skill_level AS ENUM ('Débutant', 'Intermédiaire', 'Avancé', 'Expert');
CREATE TYPE language_level AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Natif');
CREATE TYPE skill_category AS ENUM ('Technique', 'Soft Skills', 'Outils', 'Linguistique');
CREATE TYPE email_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'bounced');
CREATE TYPE response_type AS ENUM ('positive', 'negative', 'neutral', 'interview_request', 'rejection', 'unknown');
CREATE TYPE work_arrangement AS ENUM ('remote', 'hybrid', 'onsite', 'flexible');
CREATE TYPE payment_method AS ENUM ('card', 'paypal', 'bank_transfer');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- =================================================================
-- TABLES PRINCIPALES
-- =================================================================

-- Table des profils utilisateurs
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE,
    title TEXT,
    summary TEXT,
    phone TEXT,
    location TEXT,
    date_of_birth DATE,
    linkedin TEXT,
    github TEXT,
    website TEXT,
    portfolio TEXT,
    cv_file_path TEXT,
    profile_picture_url TEXT,
    completion_score INTEGER DEFAULT 0 CHECK (completion_score >= 0 AND completion_score <= 100),
    is_verified BOOLEAN DEFAULT FALSE,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'enterprise')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    
    -- Contraintes
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~* '^\+?[1-9]\d{1,14}$')
);

-- Table des compétences
CREATE TABLE public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    level skill_level NOT NULL,
    category skill_category NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    years_experience INTEGER DEFAULT 0 CHECK (years_experience >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    UNIQUE(user_id, name)
);

-- Table des expériences professionnelles
CREATE TABLE public.experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company TEXT NOT NULL,
    position TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    current BOOLEAN DEFAULT FALSE,
    description TEXT,
    location TEXT,
    achievements TEXT[] DEFAULT '{}',
    skills_used TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT current_job_logic CHECK (NOT current OR end_date IS NULL)
);

-- Table de l'éducation
CREATE TABLE public.education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    institution TEXT NOT NULL,
    degree TEXT NOT NULL,
    field TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    current BOOLEAN DEFAULT FALSE,
    grade TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT valid_education_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Table des langues
CREATE TABLE public.languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    level language_level NOT NULL,
    certified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    UNIQUE(user_id, name)
);

-- Table des certifications
CREATE TABLE public.certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    issuer TEXT NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    credential_id TEXT,
    url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT valid_cert_dates CHECK (expiry_date IS NULL OR expiry_date >= issue_date)
);

-- Table des emplois
CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    type job_type NOT NULL,
    salary_min INTEGER,
    salary_max INTEGER,
    currency TEXT DEFAULT 'EUR',
    description TEXT NOT NULL,
    requirements TEXT[] DEFAULT '{}',
    benefits TEXT[] DEFAULT '{}',
    skills_required TEXT[] DEFAULT '{}',
    experience_required INTEGER DEFAULT 0,
    education_required TEXT,
    remote_work BOOLEAN DEFAULT FALSE,
    work_arrangement work_arrangement DEFAULT 'onsite',
    source TEXT NOT NULL DEFAULT 'manual',
    external_id TEXT,
    posted_date TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    application_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT valid_salary_range CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_max >= salary_min),
    CONSTRAINT valid_expiry CHECK (expires_at IS NULL OR expires_at > posted_date)
);

-- Table des candidatures
CREATE TABLE public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    status application_status NOT NULL DEFAULT 'draft',
    type TEXT NOT NULL DEFAULT 'manual' CHECK (type IN ('manual', 'automatic')),
    cover_letter TEXT,
    cover_letter_file_path TEXT,
    custom_message TEXT,
    company_email TEXT,
    email_sent BOOLEAN DEFAULT FALSE,
    email_id TEXT,
    read_receipt BOOLEAN DEFAULT FALSE,
    response TEXT,
    response_date TIMESTAMPTZ,
    response_type response_type,
    interview_date TIMESTAMPTZ,
    interview_location TEXT,
    interview_notes TEXT,
    notes TEXT,
    attachments TEXT[] DEFAULT '{}',
    applied_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Auto-application fields
    auto_mode BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMPTZ,
    mail_id TEXT,
    approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'auto_sent')),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id),
    auto_settings_used JSONB,
    
    -- Contraintes
    UNIQUE(user_id, job_id),
    CONSTRAINT valid_interview_date CHECK (interview_date IS NULL OR interview_date > applied_date)
);

-- Table des versions de CV
CREATE TABLE public.cv_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    original_file_name TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT CHECK (file_type IN ('pdf', 'doc', 'docx')),
    is_active BOOLEAN DEFAULT FALSE,
    description TEXT,
    analysis_data JSONB,
    quality_score INTEGER DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
    upload_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT one_active_cv_per_user EXCLUDE (user_id WITH =) WHERE (is_active = TRUE)
);

-- Table des emplois sauvegardés
CREATE TABLE public.saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    UNIQUE(user_id, job_id)
);

-- =================================================================
-- TABLES AVANCÉES
-- =================================================================

-- Table des correspondances emploi-candidat
CREATE TABLE public.job_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    overall_score DECIMAL(5,2) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    detailed_scores JSONB NOT NULL DEFAULT '{}',
    explanation TEXT,
    strengths TEXT[] DEFAULT '{}',
    weaknesses TEXT[] DEFAULT '{}',
    recommendations TEXT[] DEFAULT '{}',
    confidence_level DECIMAL(3,2) DEFAULT 0.5 CHECK (confidence_level >= 0 AND confidence_level <= 1),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    UNIQUE(user_id, job_id)
);

-- Table des notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    priority priority_level DEFAULT 'medium',
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT valid_expiry CHECK (expires_at IS NULL OR expires_at > created_at)
);

-- Table des recommandations
CREATE TABLE public.recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('missing_info', 'improvement', 'optimization', 'formatting')),
    priority priority_level NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    action TEXT NOT NULL,
    category TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des préférences utilisateur
CREATE TABLE public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    preferred_locations TEXT[] DEFAULT '{}',
    salary_range_min INTEGER,
    salary_range_max INTEGER,
    preferred_job_types job_type[] DEFAULT '{}',
    work_arrangement work_arrangement,
    notification_frequency TEXT DEFAULT 'daily' CHECK (notification_frequency IN ('immediate', 'daily', 'weekly', 'monthly')),
    auto_apply_enabled BOOLEAN DEFAULT FALSE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des paramètres de candidature automatique
CREATE TABLE public.auto_application_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT FALSE,
    max_applications_per_day INTEGER DEFAULT 10 CHECK (max_applications_per_day > 0),
    min_salary INTEGER,
    max_salary INTEGER,
    preferred_locations TEXT[] DEFAULT '{}',
    excluded_companies TEXT[] DEFAULT '{}',
    required_keywords TEXT[] DEFAULT '{}',
    excluded_keywords TEXT[] DEFAULT '{}',
    job_types job_type[] DEFAULT '{}',
    experience_level TEXT DEFAULT 'all' CHECK (experience_level IN ('junior', 'mid', 'senior', 'all')),
    auto_send BOOLEAN DEFAULT FALSE,
    require_approval BOOLEAN DEFAULT TRUE,
    notification_preferences JSONB DEFAULT '{"sms": false, "push": true, "email": true}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    UNIQUE(user_id)
);

-- Table des statistiques de candidature automatique
CREATE TABLE public.auto_application_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    applications_sent INTEGER DEFAULT 0,
    applications_approved INTEGER DEFAULT 0,
    applications_rejected INTEGER DEFAULT 0,
    responses_received INTEGER DEFAULT 0,
    positive_responses INTEGER DEFAULT 0,
    interview_requests INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    UNIQUE(user_id, date)
);

-- Table des templates de candidature
CREATE TABLE public.auto_application_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des templates d'application
CREATE TABLE public.application_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cover_letter', 'email', 'follow_up')),
    content TEXT NOT NULL,
    variables JSONB DEFAULT '{}',
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================
-- TABLES SYSTÈME ET LOGS
-- =================================================================

-- Table des logs d'emails
CREATE TABLE public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
    mail_id TEXT NOT NULL,
    to_email TEXT NOT NULL,
    from_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    attachments TEXT[] DEFAULT '{}',
    sent_status email_status NOT NULL DEFAULT 'pending',
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    retries INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des réponses des recruteurs
CREATE TABLE public.recruiter_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    email_log_id UUID REFERENCES public.email_logs(id) ON DELETE SET NULL,
    from_email TEXT NOT NULL,
    from_name TEXT,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    parsed BOOLEAN DEFAULT FALSE,
    response_type response_type DEFAULT 'unknown',
    sentiment TEXT,
    action_required BOOLEAN DEFAULT FALSE,
    priority priority_level DEFAULT 'normal',
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table de l'historique des connexions
CREATE TABLE public.login_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    location TEXT,
    device_type TEXT,
    login_successful BOOLEAN DEFAULT TRUE,
    failure_reason TEXT,
    session_duration INTERVAL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des logs système
CREATE TABLE public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warning', 'error')),
    message TEXT NOT NULL,
    source TEXT NOT NULL,
    details JSONB,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des alertes système
CREATE TABLE public.system_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level TEXT NOT NULL CHECK (level IN ('info', 'warning', 'error', 'success')),
    message TEXT NOT NULL,
    source TEXT NOT NULL,
    details JSONB,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id)
);

-- Table des paramètres d'administration
CREATE TABLE public.admin_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================
-- TABLES IA ET ANALYTICS
-- =================================================================

-- Table des paramètres IA
CREATE TABLE public.ai_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    groq_api_key TEXT,
    gemini_api_key TEXT,
    preferred_model TEXT DEFAULT 'local-mock' CHECK (preferred_model IN ('local-mock', 'groq-llama', 'gemini-2.0-flash')),
    temperature NUMERIC DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
    max_tokens INTEGER DEFAULT 2048 CHECK (max_tokens > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    UNIQUE(user_id)
);

-- Table d'utilisation de l'IA
CREATE TABLE public.ai_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    model TEXT NOT NULL,
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    request_type TEXT,
    cost DECIMAL(10,4) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des alias d'email utilisateur
CREATE TABLE public.user_email_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    alias TEXT NOT NULL UNIQUE,
    full_email TEXT NOT NULL,
    routing_status TEXT NOT NULL DEFAULT 'active' CHECK (routing_status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    UNIQUE(user_id)
);

-- Table des transactions
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status transaction_status NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('subscription', 'one-time')),
    description TEXT,
    payment_method payment_method NOT NULL,
    payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================
-- INDEX POUR PERFORMANCE
-- =================================================================

-- Index pour les recherches fréquentes
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_location ON public.user_profiles(location);
CREATE INDEX idx_user_profiles_completion_score ON public.user_profiles(completion_score DESC);
CREATE INDEX idx_user_profiles_created_at ON public.user_profiles(created_at DESC);

-- Index pour les compétences
CREATE INDEX idx_skills_user_id ON public.skills(user_id);
CREATE INDEX idx_skills_name ON public.skills(name);
CREATE INDEX idx_skills_category ON public.skills(category);
CREATE INDEX idx_skills_name_trgm ON public.skills USING gin(name gin_trgm_ops);

-- Index pour les expériences
CREATE INDEX idx_experiences_user_id ON public.experiences(user_id);
CREATE INDEX idx_experiences_company ON public.experiences(company);
CREATE INDEX idx_experiences_position ON public.experiences(position);
CREATE INDEX idx_experiences_dates ON public.experiences(start_date, end_date);

-- Index pour les jobs
CREATE INDEX idx_jobs_active ON public.jobs(is_active, posted_date DESC);
CREATE INDEX idx_jobs_location ON public.jobs(location);
CREATE INDEX idx_jobs_type ON public.jobs(type);
CREATE INDEX idx_jobs_salary ON public.jobs(salary_min, salary_max);
CREATE INDEX idx_jobs_title_trgm ON public.jobs USING gin(title gin_trgm_ops);
CREATE INDEX idx_jobs_company_trgm ON public.jobs USING gin(company gin_trgm_ops);
CREATE INDEX idx_jobs_skills_required ON public.jobs USING gin(skills_required);
CREATE INDEX idx_jobs_posted_date ON public.jobs(posted_date DESC);

-- Index pour les candidatures
CREATE INDEX idx_applications_user_id ON public.applications(user_id);
CREATE INDEX idx_applications_job_id ON public.applications(job_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_applications_created_at ON public.applications(created_at DESC);
CREATE INDEX idx_applications_applied_date ON public.applications(applied_date DESC);

-- Index pour les versions CV
CREATE INDEX idx_cv_versions_user_id ON public.cv_versions(user_id);
CREATE INDEX idx_cv_versions_active ON public.cv_versions(is_active);
CREATE INDEX idx_cv_versions_created_at ON public.cv_versions(created_at DESC);

-- Index pour les notifications
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_priority ON public.notifications(priority);

-- Index pour les correspondances
CREATE INDEX idx_job_matches_user_id ON public.job_matches(user_id);
CREATE INDEX idx_job_matches_job_id ON public.job_matches(job_id);
CREATE INDEX idx_job_matches_score ON public.job_matches(overall_score DESC);
CREATE INDEX idx_job_matches_created_at ON public.job_matches(created_at DESC);

-- Index pour les logs
CREATE INDEX idx_email_logs_user_id ON public.email_logs(user_id);
CREATE INDEX idx_email_logs_application_id ON public.email_logs(application_id);
CREATE INDEX idx_email_logs_sent_status ON public.email_logs(sent_status);
CREATE INDEX idx_email_logs_created_at ON public.email_logs(created_at DESC);

-- Index pour les statistiques
CREATE INDEX idx_auto_application_stats_user_id_date ON public.auto_application_stats(user_id, date DESC);
CREATE INDEX idx_ai_usage_user_id ON public.ai_usage(user_id);
CREATE INDEX idx_ai_usage_created_at ON public.ai_usage(created_at DESC);

-- Index pour l'historique des connexions
CREATE INDEX idx_login_history_user_id ON public.login_history(user_id);
CREATE INDEX idx_login_history_created_at ON public.login_history(created_at DESC);
CREATE INDEX idx_login_history_ip ON public.login_history(ip_address);

-- Index pour les logs système
CREATE INDEX idx_system_logs_level ON public.system_logs(level);
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at DESC);
CREATE INDEX idx_system_logs_source ON public.system_logs(source);

-- =================================================================
-- FONCTIONS UTILITAIRES
-- =================================================================

-- Fonction pour vérifier si l'utilisateur est admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN COALESCE(
        (SELECT raw_user_meta_data->>'role' = 'Admin' 
         FROM auth.users 
         WHERE id = auth.uid()), 
        FALSE
    );
END;
$$;

-- Fonction pour obtenir le rôle utilisateur
CREATE OR REPLACE FUNCTION public.get_user_role(target_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (
        SELECT COALESCE(raw_user_meta_data->>'role', 'User')
        FROM auth.users
        WHERE id = target_user_id
    );
END;
$$;

-- Fonction pour mettre à jour le rôle utilisateur
CREATE OR REPLACE FUNCTION public.update_user_role(target_user_id UUID, new_role TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Vérifier que l'utilisateur actuel est admin
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Access denied. Only admins can update user roles.';
    END IF;
    
    -- Vérifier que le nouveau rôle est valide
    IF new_role NOT IN ('User', 'Admin', 'Recruiter', 'Premium') THEN
        RAISE EXCEPTION 'Invalid role. Must be User, Admin, Recruiter, or Premium.';
    END IF;
    
    -- Mettre à jour le rôle
    UPDATE auth.users
    SET raw_user_meta_data = 
        CASE 
            WHEN raw_user_meta_data IS NULL THEN 
                jsonb_build_object('role', new_role)
            ELSE 
                raw_user_meta_data || jsonb_build_object('role', new_role)
        END
    WHERE id = target_user_id;
END;
$$;

-- Fonction pour vérifier les permissions admin
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Access denied. User is not an administrator.'
            USING HINT = 'Verify that the user has the Admin role in their metadata.',
                  ERRCODE = '42501';
    END IF;
END;
$$;

-- Fonction pour créer un alias email utilisateur
CREATE OR REPLACE FUNCTION public.create_user_email_alias(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    alias_name TEXT;
    full_email TEXT;
BEGIN
    -- Générer un alias unique
    alias_name := 'user_' || REPLACE(user_id::TEXT, '-', '') || '@khedma.local';
    full_email := user_id::TEXT || '@khedma-mail.com';
    
    -- Insérer l'alias
    INSERT INTO public.user_email_aliases (user_id, alias, full_email)
    VALUES (user_id, alias_name, full_email)
    ON CONFLICT (user_id) DO UPDATE SET
        alias = EXCLUDED.alias,
        full_email = EXCLUDED.full_email,
        updated_at = NOW();
    
    RETURN alias_name;
END;
$$;

-- Fonction pour obtenir les utilisateurs avec emails (admin seulement)
CREATE OR REPLACE FUNCTION public.get_users_with_emails()
RETURNS TABLE(
    id UUID,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    title TEXT,
    location TEXT,
    completion_score INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Vérifier que l'utilisateur actuel est admin
    PERFORM check_is_admin();
    
    RETURN QUERY
    SELECT 
        up.id,
        up.first_name,
        up.last_name,
        up.email,
        up.title,
        up.location,
        up.completion_score,
        up.created_at,
        up.updated_at
    FROM public.user_profiles up
    ORDER BY up.created_at DESC;
END;
$$;

-- Fonction pour créer une notification
CREATE OR REPLACE FUNCTION public.create_notification(
    target_user_id UUID,
    notification_type notification_type,
    notification_title TEXT,
    notification_message TEXT,
    notification_priority priority_level DEFAULT 'medium',
    notification_action_url TEXT DEFAULT NULL,
    notification_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        priority,
        action_url,
        metadata
    ) VALUES (
        target_user_id,
        notification_type,
        notification_title,
        notification_message,
        notification_priority,
        notification_action_url,
        notification_metadata
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;

-- Fonction pour nettoyer les anciennes notifications
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.notifications
    WHERE created_at < (NOW() - INTERVAL '30 days')
    AND read = TRUE;
END;
$$;

-- Fonction pour rechercher des emplois
CREATE OR REPLACE FUNCTION public.search_jobs(
    search_query TEXT DEFAULT NULL,
    job_location TEXT DEFAULT NULL,
    job_type job_type DEFAULT NULL,
    min_salary INTEGER DEFAULT NULL,
    max_salary INTEGER DEFAULT NULL,
    required_skills TEXT[] DEFAULT NULL,
    preferred_work_arrangement work_arrangement DEFAULT NULL,
    limit_results INTEGER DEFAULT 20,
    offset_results INTEGER DEFAULT 0
)
RETURNS TABLE(
    id UUID,
    title TEXT,
    company TEXT,
    location TEXT,
    type job_type,
    salary_min INTEGER,
    salary_max INTEGER,
    description TEXT,
    requirements TEXT[],
    skills_required TEXT[],
    work_arrangement work_arrangement,
    posted_date TIMESTAMPTZ,
    relevance_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.id,
        j.title,
        j.company,
        j.location,
        j.type,
        j.salary_min,
        j.salary_max,
        j.description,
        j.requirements,
        j.skills_required,
        j.work_arrangement,
        j.posted_date,
        -- Score de pertinence basé sur les critères
        (
            CASE WHEN search_query IS NULL THEN 0
                 WHEN j.title ILIKE '%' || search_query || '%' THEN 15
                 WHEN j.description ILIKE '%' || search_query || '%' THEN 10
                 WHEN j.company ILIKE '%' || search_query || '%' THEN 8
                 ELSE 0 END +
            CASE WHEN job_location IS NULL THEN 0
                 WHEN j.location ILIKE '%' || job_location || '%' THEN 12
                 ELSE 0 END +
            CASE WHEN required_skills IS NULL THEN 0
                 WHEN j.skills_required && required_skills THEN 20
                 ELSE 0 END +
            CASE WHEN preferred_work_arrangement IS NULL THEN 0
                 WHEN j.work_arrangement = preferred_work_arrangement THEN 5
                 ELSE 0 END +
            CASE WHEN min_salary IS NULL THEN 0
                 WHEN j.salary_min >= min_salary THEN 3
                 ELSE 0 END
        )::NUMERIC as relevance_score
    FROM public.jobs j
    WHERE j.is_active = TRUE
        AND (search_query IS NULL OR 
             j.title ILIKE '%' || search_query || '%' OR 
             j.description ILIKE '%' || search_query || '%' OR
             j.company ILIKE '%' || search_query || '%')
        AND (job_location IS NULL OR j.location ILIKE '%' || job_location || '%')
        AND (job_type IS NULL OR j.type = job_type)
        AND (min_salary IS NULL OR j.salary_max IS NULL OR j.salary_max >= min_salary)
        AND (max_salary IS NULL OR j.salary_min IS NULL OR j.salary_min <= max_salary)
        AND (required_skills IS NULL OR j.skills_required && required_skills)
        AND (preferred_work_arrangement IS NULL OR j.work_arrangement = preferred_work_arrangement)
        AND (j.expires_at IS NULL OR j.expires_at > NOW())
    ORDER BY relevance_score DESC, j.posted_date DESC
    LIMIT limit_results OFFSET offset_results;
END;
$$;

-- Fonction pour calculer le score de correspondance emploi
CREATE OR REPLACE FUNCTION public.calculate_job_match_score(
    target_user_id UUID,
    target_job_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_skills TEXT[];
    job_skills TEXT[];
    user_location TEXT;
    job_location TEXT;
    user_experience_years INTEGER;
    job_experience_required INTEGER;
    skill_match_score NUMERIC;
    location_match BOOLEAN;
    experience_match NUMERIC;
    education_match NUMERIC;
    overall_score NUMERIC;
    result JSONB;
BEGIN
    -- Récupérer les compétences utilisateur
    SELECT array_agg(name) INTO user_skills
    FROM public.skills WHERE user_id = target_user_id;

    -- Récupérer les informations utilisateur
    SELECT location INTO user_location
    FROM public.user_profiles WHERE id = target_user_id;

    -- Calculer les années d'expérience
    SELECT COALESCE(
        EXTRACT(YEAR FROM AGE(
            COALESCE(MAX(end_date), CURRENT_DATE),
            MIN(start_date)
        )), 0
    ) INTO user_experience_years
    FROM public.experiences 
    WHERE user_id = target_user_id;

    -- Récupérer les exigences du poste
    SELECT skills_required, location, experience_required 
    INTO job_skills, job_location, job_experience_required
    FROM public.jobs WHERE id = target_job_id;

    -- Calculer le score de correspondance des compétences
    SELECT 
        CASE 
            WHEN array_length(job_skills, 1) IS NULL THEN 70
            WHEN array_length(user_skills, 1) IS NULL THEN 0
            ELSE (
                (array_length(user_skills & job_skills, 1)::NUMERIC / 
                 array_length(job_skills, 1)) * 100
            )
        END INTO skill_match_score;

    -- Vérifier la correspondance géographique
    SELECT (
        user_location IS NOT NULL AND job_location IS NOT NULL AND
        (user_location ILIKE '%' || job_location || '%' OR 
         job_location ILIKE '%' || user_location || '%')
    ) INTO location_match;

    -- Calculer le score d'expérience
    SELECT 
        CASE 
            WHEN job_experience_required IS NULL THEN 80
            WHEN user_experience_years >= job_experience_required THEN 100
            WHEN user_experience_years >= (job_experience_required * 0.7) THEN 75
            WHEN user_experience_years >= (job_experience_required * 0.5) THEN 50
            ELSE 25
        END INTO experience_match;

    -- Calculer le score d'éducation (simplifié)
    SELECT 
        CASE 
            WHEN COUNT(*) = 0 THEN 50
            WHEN COUNT(*) >= 2 THEN 90
            ELSE 70
        END INTO education_match
    FROM public.education 
    WHERE user_id = target_user_id;

    -- Calculer le score global
    overall_score := (
        skill_match_score * 0.4 + 
        experience_match * 0.3 + 
        education_match * 0.2 + 
        CASE WHEN location_match THEN 10 ELSE 0 END
    );

    -- Construire le résultat
    SELECT jsonb_build_object(
        'overall_score', COALESCE(overall_score, 0),
        'detailed_scores', jsonb_build_object(
            'skills_score', COALESCE(skill_match_score, 0),
            'experience_score', COALESCE(experience_match, 0),
            'education_score', COALESCE(education_match, 0),
            'location_score', CASE WHEN location_match THEN 100 ELSE 0 END
        ),
        'location_match', COALESCE(location_match, false),
        'matched_skills', COALESCE(user_skills & job_skills, '{}'),
        'missing_skills', COALESCE(job_skills - user_skills, '{}'),
        'user_skills_count', COALESCE(array_length(user_skills, 1), 0),
        'required_skills_count', COALESCE(array_length(job_skills, 1), 0),
        'user_experience_years', COALESCE(user_experience_years, 0),
        'required_experience_years', COALESCE(job_experience_required, 0),
        'calculated_at', NOW()
    ) INTO result;

    RETURN result;
END;
$$;

-- Fonction pour obtenir les statistiques utilisateur
CREATE OR REPLACE FUNCTION public.get_user_stats(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    -- Vérifier les permissions
    IF auth.uid() != target_user_id AND NOT is_admin() THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    SELECT jsonb_build_object(
        'profile_completion', COALESCE(up.completion_score, 0),
        'total_applications', COALESCE(app_stats.total, 0),
        'applications_sent', COALESCE(app_stats.sent, 0),
        'applications_pending', COALESCE(app_stats.pending, 0),
        'interviews_scheduled', COALESCE(app_stats.interviews, 0),
        'response_rate', COALESCE(app_stats.response_rate, 0),
        'saved_jobs', COALESCE(saved_stats.total, 0),
        'cv_versions', COALESCE(cv_stats.total, 0),
        'skills_count', COALESCE(skills_stats.total, 0),
        'experience_years', COALESCE(exp_stats.years, 0),
        'certifications_count', COALESCE(cert_stats.total, 0),
        'languages_count', COALESCE(lang_stats.total, 0),
        'last_activity', COALESCE(up.updated_at, up.created_at),
        'subscription_tier', COALESCE(up.subscription_tier, 'free'),
        'is_verified', COALESCE(up.is_verified, false)
    ) INTO result
    FROM public.user_profiles up
    LEFT JOIN (
        SELECT 
            user_id,
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'sent') as sent,
            COUNT(*) FILTER (WHERE status = 'draft') as pending,
            COUNT(*) FILTER (WHERE status = 'interview') as interviews,
            CASE 
                WHEN COUNT(*) FILTER (WHERE status = 'sent') > 0 
                THEN (COUNT(*) FILTER (WHERE response IS NOT NULL)::NUMERIC / COUNT(*) FILTER (WHERE status = 'sent')) * 100
                ELSE 0 
            END as response_rate
        FROM public.applications 
        WHERE user_id = target_user_id
        GROUP BY user_id
    ) app_stats ON up.id = app_stats.user_id
    LEFT JOIN (
        SELECT user_id, COUNT(*) as total
        FROM public.saved_jobs 
        WHERE user_id = target_user_id
        GROUP BY user_id
    ) saved_stats ON up.id = saved_stats.user_id
    LEFT JOIN (
        SELECT user_id, COUNT(*) as total
        FROM public.cv_versions 
        WHERE user_id = target_user_id
        GROUP BY user_id
    ) cv_stats ON up.id = cv_stats.user_id
    LEFT JOIN (
        SELECT user_id, COUNT(*) as total
        FROM public.skills 
        WHERE user_id = target_user_id
        GROUP BY user_id
    ) skills_stats ON up.id = skills_stats.user_id
    LEFT JOIN (
        SELECT user_id, COUNT(*) as total
        FROM public.certifications 
        WHERE user_id = target_user_id
        GROUP BY user_id
    ) cert_stats ON up.id = cert_stats.user_id
    LEFT JOIN (
        SELECT user_id, COUNT(*) as total
        FROM public.languages 
        WHERE user_id = target_user_id
        GROUP BY user_id
    ) lang_stats ON up.id = lang_stats.user_id
    LEFT JOIN (
        SELECT 
            user_id,
            COALESCE(
                EXTRACT(YEAR FROM AGE(
                    COALESCE(MAX(end_date), CURRENT_DATE),
                    MIN(start_date)
                )), 0
            ) as years
        FROM public.experiences 
        WHERE user_id = target_user_id
        GROUP BY user_id
    ) exp_stats ON up.id = exp_stats.user_id
    WHERE up.id = target_user_id;

    RETURN result;
END;
$$;

-- Fonction pour obtenir les recommandations d'emplois
CREATE OR REPLACE FUNCTION public.get_job_recommendations(
    target_user_id UUID,
    limit_results INTEGER DEFAULT 10
)
RETURNS TABLE(
    job_id UUID,
    title TEXT,
    company TEXT,
    location TEXT,
    type job_type,
    salary_min INTEGER,
    salary_max INTEGER,
    work_arrangement work_arrangement,
    match_score NUMERIC,
    matched_skills TEXT[],
    missing_skills TEXT[],
    posted_date TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.id,
        j.title,
        j.company,
        j.location,
        j.type,
        j.salary_min,
        j.salary_max,
        j.work_arrangement,
        (calculate_job_match_score(target_user_id, j.id)->>'overall_score')::NUMERIC as match_score,
        (calculate_job_match_score(target_user_id, j.id)->>'matched_skills')::TEXT[] as matched_skills,
        (calculate_job_match_score(target_user_id, j.id)->>'missing_skills')::TEXT[] as missing_skills,
        j.posted_date
    FROM public.jobs j
    WHERE j.is_active = TRUE
        AND (j.expires_at IS NULL OR j.expires_at > NOW())
        AND NOT EXISTS (
            SELECT 1 FROM public.applications a 
            WHERE a.user_id = target_user_id AND a.job_id = j.id
        )
    ORDER BY match_score DESC, j.posted_date DESC
    LIMIT limit_results;
END;
$$;

-- Fonction pour mettre à jour les statistiques d'auto-candidature
CREATE OR REPLACE FUNCTION public.update_auto_application_stats(
    target_user_id UUID,
    stat_date DATE DEFAULT CURRENT_DATE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.auto_application_stats (
        user_id, 
        date, 
        applications_sent,
        applications_approved,
        applications_rejected,
        responses_received,
        positive_responses,
        interview_requests
    )
    SELECT 
        target_user_id,
        stat_date,
        COUNT(*) FILTER (WHERE status = 'sent' AND DATE(created_at) = stat_date),
        COUNT(*) FILTER (WHERE approval_status = 'approved' AND DATE(approved_at) = stat_date),
        COUNT(*) FILTER (WHERE approval_status = 'rejected' AND DATE(approved_at) = stat_date),
        COUNT(*) FILTER (WHERE response IS NOT NULL AND DATE(response_date) = stat_date),
        COUNT(*) FILTER (WHERE response_type = 'positive' AND DATE(response_date) = stat_date),
        COUNT(*) FILTER (WHERE response_type = 'interview_request' AND DATE(response_date) = stat_date)
    FROM public.applications a
    LEFT JOIN public.recruiter_responses rr ON a.id = rr.application_id
    WHERE a.user_id = target_user_id
    ON CONFLICT (user_id, date) DO UPDATE SET
        applications_sent = EXCLUDED.applications_sent,
        applications_approved = EXCLUDED.applications_approved,
        applications_rejected = EXCLUDED.applications_rejected,
        responses_received = EXCLUDED.responses_received,
        positive_responses = EXCLUDED.positive_responses,
        interview_requests = EXCLUDED.interview_requests;
END;
$$;

-- =================================================================
-- TRIGGERS
-- =================================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cv_versions_updated_at
    BEFORE UPDATE ON public.cv_versions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_matches_updated_at
    BEFORE UPDATE ON public.job_matches
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_auto_application_settings_updated_at
    BEFORE UPDATE ON public.auto_application_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_auto_application_templates_updated_at
    BEFORE UPDATE ON public.auto_application_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_application_templates_updated_at
    BEFORE UPDATE ON public.application_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at
    BEFORE UPDATE ON public.admin_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_settings_updated_at
    BEFORE UPDATE ON public.ai_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_email_aliases_updated_at
    BEFORE UPDATE ON public.user_email_aliases
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger pour mettre à jour le score de complétion du profil
CREATE OR REPLACE FUNCTION public.update_profile_completion_score()
RETURNS TRIGGER AS $$
DECLARE
    completion_score INTEGER := 0;
BEGIN
    -- Calcul du score de complétion (sur 100)
    IF NEW.first_name IS NOT NULL AND NEW.first_name != '' THEN
        completion_score := completion_score + 10;
    END IF;
    
    IF NEW.last_name IS NOT NULL AND NEW.last_name != '' THEN
        completion_score := completion_score + 10;
    END IF;
    
    IF NEW.email IS NOT NULL AND NEW.email != '' THEN
        completion_score := completion_score + 10;
    END IF;
    
    IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN
        completion_score := completion_score + 10;
    END IF;
    
    IF NEW.location IS NOT NULL AND NEW.location != '' THEN
        completion_score := completion_score + 10;
    END IF;
    
    IF NEW.title IS NOT NULL AND NEW.title != '' THEN
        completion_score := completion_score + 10;
    END IF;
    
    IF NEW.summary IS NOT NULL AND NEW.summary != '' THEN
        completion_score := completion_score + 15;
    END IF;
    
    IF NEW.cv_file_path IS NOT NULL AND NEW.cv_file_path != '' THEN
        completion_score := completion_score + 25;
    END IF;
    
    NEW.completion_score := completion_score;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_completion_score_trigger
    BEFORE INSERT OR UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_profile_completion_score();

-- Trigger pour créer un profil utilisateur lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, first_name, last_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        NEW.email
    );
    
    -- Créer les préférences par défaut
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);
    
    -- Créer les paramètres IA par défaut
    INSERT INTO public.ai_settings (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger pour logger les connexions
CREATE OR REPLACE FUNCTION public.log_user_login()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.login_history (user_id, login_successful)
    VALUES (NEW.id, TRUE);
    
    -- Mettre à jour last_login dans user_profiles
    UPDATE public.user_profiles
    SET last_login = NOW()
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_login
    AFTER UPDATE OF last_sign_in_at ON auth.users
    FOR EACH ROW 
    WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
    EXECUTE FUNCTION public.log_user_login();

-- =================================================================
-- POLITIQUES RLS (ROW LEVEL SECURITY)
-- =================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_application_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_application_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_application_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_email_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Politiques pour user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR ALL USING (is_admin());

-- Politiques pour skills
CREATE POLICY "Users can manage own skills" ON public.skills
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all skills" ON public.skills
    FOR SELECT USING (is_admin());

-- Politiques pour experiences
CREATE POLICY "Users can manage own experiences" ON public.experiences
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all experiences" ON public.experiences
    FOR SELECT USING (is_admin());

-- Politiques pour education
CREATE POLICY "Users can manage own education" ON public.education
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all education" ON public.education
    FOR SELECT USING (is_admin());

-- Politiques pour languages
CREATE POLICY "Users can manage own languages" ON public.languages
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all languages" ON public.languages
    FOR SELECT USING (is_admin());

-- Politiques pour certifications
CREATE POLICY "Users can manage own certifications" ON public.certifications
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all certifications" ON public.certifications
    FOR SELECT USING (is_admin());

-- Politiques pour jobs
CREATE POLICY "Everyone can view active jobs" ON public.jobs
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage jobs" ON public.jobs
    FOR ALL USING (is_admin());

CREATE POLICY "Recruiters can manage own jobs" ON public.jobs
    FOR ALL USING (get_user_role(auth.uid()) = 'Recruiter');

-- Politiques pour applications
CREATE POLICY "Users can manage own applications" ON public.applications
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications" ON public.applications
    FOR SELECT USING (is_admin());

CREATE POLICY "Recruiters can view applications for their jobs" ON public.applications
    FOR SELECT USING (
        get_user_role(auth.uid()) = 'Recruiter' AND
        EXISTS (
            SELECT 1 FROM public.jobs j 
            WHERE j.id = job_id AND j.source = 'recruiter'
        )
    );

-- Politiques pour cv_versions
CREATE POLICY "Users can manage own CV versions" ON public.cv_versions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all CV versions" ON public.cv_versions
    FOR SELECT USING (is_admin());

-- Politiques pour saved_jobs
CREATE POLICY "Users can manage own saved jobs" ON public.saved_jobs
    FOR ALL USING (auth.uid() = user_id);

-- Politiques pour job_matches
CREATE POLICY "Users can view own job matches" ON public.job_matches
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own job matches" ON public.job_matches
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all job matches" ON public.job_matches
    FOR SELECT USING (is_admin());

-- Politiques pour notifications
CREATE POLICY "Users can manage own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all notifications" ON public.notifications
    FOR SELECT USING (is_admin());

-- Politiques pour recommendations
CREATE POLICY "Users can manage own recommendations" ON public.recommendations
    FOR ALL USING (auth.uid() = user_id);

-- Politiques pour user_preferences
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Politiques pour auto_application_settings
CREATE POLICY "Users can manage own auto application settings" ON public.auto_application_settings
    FOR ALL USING (auth.uid() = user_id);

-- Politiques pour auto_application_stats
CREATE POLICY "Users can view own auto application stats" ON public.auto_application_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert auto application stats" ON public.auto_application_stats
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can view all auto application stats" ON public.auto_application_stats
    FOR SELECT USING (is_admin());

-- Politiques pour auto_application_templates
CREATE POLICY "Users can manage own auto application templates" ON public.auto_application_templates
    FOR ALL USING (auth.uid() = user_id);

-- Politiques pour application_templates
CREATE POLICY "Users can manage own application templates" ON public.application_templates
    FOR ALL USING (auth.uid() = user_id);

-- Politiques pour email_logs
CREATE POLICY "Users can view own email logs" ON public.email_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert email logs" ON public.email_logs
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can view all email logs" ON public.email_logs
    FOR SELECT USING (is_admin());

-- Politiques pour recruiter_responses
CREATE POLICY "Users can view responses to their applications" ON public.recruiter_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.applications a 
            WHERE a.id = application_id AND a.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert recruiter responses" ON public.recruiter_responses
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can view all recruiter responses" ON public.recruiter_responses
    FOR SELECT USING (is_admin());

-- Politiques pour login_history
CREATE POLICY "Users can view own login history" ON public.login_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert login history" ON public.login_history
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can view all login history" ON public.login_history
    FOR SELECT USING (is_admin());

-- Politiques pour system_logs
CREATE POLICY "Admins can view system logs" ON public.system_logs
    FOR SELECT USING (is_admin());

CREATE POLICY "System can insert system logs" ON public.system_logs
    FOR INSERT WITH CHECK (TRUE);

-- Politiques pour system_alerts
CREATE POLICY "Admins can manage system alerts" ON public.system_alerts
    FOR ALL USING (is_admin());

-- Politiques pour admin_settings
CREATE POLICY "Admins can manage admin settings" ON public.admin_settings
    FOR ALL USING (is_admin());

-- Politiques pour ai_settings
CREATE POLICY "Users can manage own AI settings" ON public.ai_settings
    FOR ALL USING (auth.uid() = user_id);

-- Politiques pour ai_usage
CREATE POLICY "Users can view own AI usage" ON public.ai_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert AI usage" ON public.ai_usage
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can view all AI usage" ON public.ai_usage
    FOR SELECT USING (is_admin());

-- Politiques pour user_email_aliases
CREATE POLICY "Users can manage own email aliases" ON public.user_email_aliases
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all email aliases" ON public.user_email_aliases
    FOR SELECT USING (is_admin());

-- Politiques pour transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions" ON public.transactions
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can view all transactions" ON public.transactions
    FOR SELECT USING (is_admin());

-- =================================================================
-- DONNÉES INITIALES
-- =================================================================

-- Insérer les paramètres d'administration par défaut
INSERT INTO public.admin_settings (key, value, description) VALUES
    ('site_name', 'KhedmaFinal', 'Nom du site'),
    ('site_url', 'https://khedmafinal.com', 'URL du site'),
    ('max_cv_size', '10485760', 'Taille maximale des CVs en bytes (10MB)'),
    ('allowed_cv_types', 'pdf,doc,docx', 'Types de fichiers CV autorisés'),
    ('max_applications_per_day', '50', 'Nombre maximum de candidatures par jour'),
    ('email_verification_required', 'true', 'Vérification email requise'),
    ('auto_application_enabled', 'true', 'Candidature automatique activée'),
    ('ai_analysis_enabled', 'true', 'Analyse IA activée'),
    ('notification_retention_days', '30', 'Durée de rétention des notifications'),
    ('system_maintenance_mode', 'false', 'Mode maintenance système')
ON CONFLICT (key) DO NOTHING;

-- =================================================================
-- COMMENTAIRES ET DOCUMENTATION
-- =================================================================

-- Commentaires sur les tables principales
COMMENT ON TABLE public.user_profiles IS 'Profils utilisateurs avec informations personnelles et professionnelles';
COMMENT ON TABLE public.skills IS 'Compétences des utilisateurs avec niveaux et catégories';
COMMENT ON TABLE public.experiences IS 'Expériences professionnelles des utilisateurs';
COMMENT ON TABLE public.education IS 'Formation et éducation des utilisateurs';
COMMENT ON TABLE public.languages IS 'Langues parlées par les utilisateurs';
COMMENT ON TABLE public.certifications IS 'Certifications et diplômes des utilisateurs';
COMMENT ON TABLE public.jobs IS 'Offres d''emploi disponibles sur la plateforme';
COMMENT ON TABLE public.applications IS 'Candidatures des utilisateurs aux offres d''emploi';
COMMENT ON TABLE public.cv_versions IS 'Versions des CVs uploadés par les utilisateurs';
COMMENT ON TABLE public.saved_jobs IS 'Emplois sauvegardés par les utilisateurs';
COMMENT ON TABLE public.job_matches IS 'Correspondances calculées entre utilisateurs et emplois';
COMMENT ON TABLE public.notifications IS 'Notifications système et utilisateur';
COMMENT ON TABLE public.recommendations IS 'Recommandations d''amélioration pour les utilisateurs';
COMMENT ON TABLE public.user_preferences IS 'Préférences utilisateur pour la recherche d''emploi';
COMMENT ON TABLE public.auto_application_settings IS 'Paramètres de candidature automatique';
COMMENT ON TABLE public.auto_application_stats IS 'Statistiques de candidature automatique';
COMMENT ON TABLE public.email_logs IS 'Logs des emails envoyés par le système';
COMMENT ON TABLE public.recruiter_responses IS 'Réponses des recruteurs aux candidatures';
COMMENT ON TABLE public.login_history IS 'Historique des connexions utilisateur';
COMMENT ON TABLE public.system_logs IS 'Logs système pour le monitoring';
COMMENT ON TABLE public.system_alerts IS 'Alertes système pour les administrateurs';
COMMENT ON TABLE public.admin_settings IS 'Paramètres d''administration du système';
COMMENT ON TABLE public.ai_settings IS 'Paramètres IA par utilisateur';
COMMENT ON TABLE public.ai_usage IS 'Utilisation des services IA par utilisateur';
COMMENT ON TABLE public.transactions IS 'Transactions financières et abonnements';

-- =================================================================
-- FINALISATION
-- =================================================================

-- Créer un utilisateur admin par défaut (à modifier en production)
DO $$
BEGIN
    -- Cette section sera exécutée après la création du premier utilisateur
    -- Elle peut être commentée ou supprimée selon les besoins
    RAISE NOTICE 'Schéma KhedmaFinal créé avec succès!';
    RAISE NOTICE 'Nombre de tables créées: %', (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public');
    RAISE NOTICE 'Nombre de fonctions créées: %', (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public');
    RAISE NOTICE 'Nombre d''index créés: %', (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public');
END $$;

-- =================================================================
-- FIN DU SCHÉMA
-- ================================================================= 