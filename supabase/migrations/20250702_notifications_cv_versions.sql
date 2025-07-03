
-- Migration pour les notifications et versions CV
-- Date: 2025-07-02

-- Table des notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    read boolean DEFAULT false,
    priority text DEFAULT 'medium'::text,
    action_url text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT notifications_pkey PRIMARY KEY (id),
    CONSTRAINT notifications_type_check CHECK (type = ANY (ARRAY['application'::text, 'job'::text, 'interview'::text, 'reminder'::text, 'system'::text])),
    CONSTRAINT notifications_priority_check CHECK (priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]))
);

-- Table des versions de CV
CREATE TABLE IF NOT EXISTS public.cv_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    file_path text NOT NULL,
    original_file_name text NOT NULL,
    file_size integer,
    file_type text,
    is_active boolean DEFAULT false,
    description text,
    analysis_data jsonb,
    upload_date timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT cv_versions_pkey PRIMARY KEY (id),
    CONSTRAINT cv_versions_file_type_check CHECK (file_type = ANY (ARRAY['pdf'::text, 'doc'::text, 'docx'::text]))
);

-- Indexes pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications USING btree (read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications USING btree (type);

CREATE INDEX IF NOT EXISTS idx_cv_versions_user_id ON public.cv_versions USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_cv_versions_active ON public.cv_versions USING btree (is_active);
CREATE INDEX IF NOT EXISTS idx_cv_versions_created_at ON public.cv_versions USING btree (created_at DESC);

-- Contraintes de clés étrangères
ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.cv_versions
    ADD CONSTRAINT cv_versions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Triggers pour mettre à jour updated_at automatiquement
CREATE OR REPLACE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_cv_versions_updated_at
    BEFORE UPDATE ON public.cv_versions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Politiques de sécurité RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_versions ENABLE ROW LEVEL SECURITY;

-- Politiques pour les notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can delete own notifications" ON public.notifications
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Politiques pour les versions CV
CREATE POLICY "Users can manage own CV versions" ON public.cv_versions
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Fonction pour créer une notification
CREATE OR REPLACE FUNCTION public.create_notification(
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
AS $$
DECLARE
    notification_id uuid;
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

-- Fonction pour marquer une notification comme lue
CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.notifications
    SET read = true, updated_at = now()
    WHERE id = notification_id AND user_id = auth.uid();
END;
$$;

-- Fonction pour définir un CV comme actif (et désactiver les autres)
CREATE OR REPLACE FUNCTION public.set_active_cv(cv_version_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_user_id uuid;
BEGIN
    -- Récupérer l'ID utilisateur du CV
    SELECT user_id INTO target_user_id
    FROM public.cv_versions
    WHERE id = cv_version_id AND user_id = auth.uid();
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'CV version not found or access denied';
    END IF;
    
    -- Désactiver tous les CV de l'utilisateur
    UPDATE public.cv_versions
    SET is_active = false, updated_at = now()
    WHERE user_id = target_user_id;
    
    -- Activer le CV sélectionné
    UPDATE public.cv_versions
    SET is_active = true, updated_at = now()
    WHERE id = cv_version_id;
END;
$$;

-- Fonction pour nettoyer les anciennes notifications (plus de 30 jours)
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.notifications
    WHERE created_at < (now() - INTERVAL '30 days')
    AND read = true;
END;
$$;

-- Données d'exemple pour les notifications (optionnel)
-- INSERT INTO public.notifications (user_id, type, title, message, priority) 
-- SELECT 
--     id as user_id,
--     'system' as type,
--     'Bienvenue sur KhedmaClair!' as title,
--     'Complétez votre profil pour améliorer vos chances de trouver un emploi.' as message,
--     'medium' as priority
-- FROM auth.users
-- WHERE NOT EXISTS (
--     SELECT 1 FROM public.notifications 
--     WHERE notifications.user_id = users.id AND type = 'system'
-- );

COMMENT ON TABLE public.notifications IS 'Table des notifications utilisateur avec support temps réel';
COMMENT ON TABLE public.cv_versions IS 'Gestion des versions multiples de CV pour chaque utilisateur';
