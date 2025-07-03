-- Migration pour le système de postulation automatique
-- Date: 2025-01-01

-- Table pour les alias emails des utilisateurs
CREATE TABLE IF NOT EXISTS "public"."user_email_aliases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "alias" "text" NOT NULL,
    "full_email" "text" NOT NULL,
    "routing_status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_email_aliases_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_email_aliases_user_id_key" UNIQUE ("user_id"),
    CONSTRAINT "user_email_aliases_alias_key" UNIQUE ("alias"),
    CONSTRAINT "user_email_aliases_routing_status_check" CHECK (("routing_status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'suspended'::"text"])))
);

-- Table pour les logs d'emails envoyés
CREATE TABLE IF NOT EXISTS "public"."email_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "application_id" "uuid",
    "mail_id" "text" NOT NULL,
    "to_email" "text" NOT NULL,
    "from_email" "text" NOT NULL,
    "subject" "text" NOT NULL,
    "body" "text" NOT NULL,
    "attachments" "text"[] DEFAULT '{}'::"text"[],
    "sent_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "sent_at" timestamp with time zone,
    "delivered_at" timestamp with time zone,
    "read_at" timestamp with time zone,
    "retries" integer DEFAULT 0,
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "email_logs_sent_status_check" CHECK (("sent_status" = ANY (ARRAY['pending'::"text", 'sent'::"text", 'delivered'::"text", 'failed'::"text", 'bounced'::"text"])))
);

-- Table pour les réponses des recruteurs
CREATE TABLE IF NOT EXISTS "public"."recruiter_responses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "application_id" "uuid" NOT NULL,
    "email_log_id" "uuid",
    "from_email" "text" NOT NULL,
    "from_name" "text",
    "subject" "text" NOT NULL,
    "body" "text" NOT NULL,
    "received_at" timestamp with time zone DEFAULT "now"(),
    "parsed" boolean DEFAULT false,
    "response_type" "text" DEFAULT 'unknown'::"text",
    "sentiment" "text",
    "action_required" boolean DEFAULT false,
    "priority" "text" DEFAULT 'normal'::"text",
    "processed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "recruiter_responses_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "recruiter_responses_response_type_check" CHECK (("response_type" = ANY (ARRAY['positive'::"text", 'negative'::"text", 'neutral'::"text", 'interview_request'::"text", 'rejection'::"text", 'unknown'::"text"]))),
    CONSTRAINT "recruiter_responses_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'normal'::"text", 'high'::"text", 'urgent'::"text"])))
);

-- Table pour les paramètres de postulation automatique
CREATE TABLE IF NOT EXISTS "public"."auto_application_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "enabled" boolean DEFAULT false,
    "max_applications_per_day" integer DEFAULT 10,
    "min_salary" integer,
    "max_salary" integer,
    "preferred_locations" "text"[] DEFAULT '{}'::"text"[],
    "excluded_companies" "text"[] DEFAULT '{}'::"text"[],
    "required_keywords" "text"[] DEFAULT '{}'::"text"[],
    "excluded_keywords" "text"[] DEFAULT '{}'::"text"[],
    "job_types" "text"[] DEFAULT '{}'::"text"[],
    "experience_level" "text" DEFAULT 'all'::"text",
    "auto_send" boolean DEFAULT false,
    "require_approval" boolean DEFAULT true,
    "notification_preferences" "jsonb" DEFAULT '{"email": true, "push": true, "sms": false}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "auto_application_settings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "auto_application_settings_user_id_key" UNIQUE ("user_id"),
    CONSTRAINT "auto_application_settings_experience_level_check" CHECK (("experience_level" = ANY (ARRAY['junior'::"text", 'mid'::"text", 'senior'::"text", 'all'::"text"])))
);

-- Table pour les templates de candidature automatique
CREATE TABLE IF NOT EXISTS "public"."auto_application_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "subject_template" "text" NOT NULL,
    "body_template" "text" NOT NULL,
    "is_default" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "auto_application_templates_pkey" PRIMARY KEY ("id")
);

-- Table pour les statistiques de postulation automatique
CREATE TABLE IF NOT EXISTS "public"."auto_application_stats" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "date" date NOT NULL,
    "applications_sent" integer DEFAULT 0,
    "applications_approved" integer DEFAULT 0,
    "applications_rejected" integer DEFAULT 0,
    "responses_received" integer DEFAULT 0,
    "positive_responses" integer DEFAULT 0,
    "interview_requests" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "auto_application_stats_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "auto_application_stats_user_id_date_key" UNIQUE ("user_id", "date")
);

-- Ajout de colonnes à la table applications existante
ALTER TABLE "public"."applications" 
ADD COLUMN IF NOT EXISTS "auto_mode" boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS "email_sent_at" timestamp with time zone,
ADD COLUMN IF NOT EXISTS "mail_id" "text",
ADD COLUMN IF NOT EXISTS "approval_status" "text" DEFAULT 'pending'::"text",
ADD COLUMN IF NOT EXISTS "approved_at" timestamp with time zone,
ADD COLUMN IF NOT EXISTS "approved_by" "uuid",
ADD COLUMN IF NOT EXISTS "auto_settings_used" "jsonb";

-- Contraintes pour les nouvelles colonnes
ALTER TABLE "public"."applications" 
ADD CONSTRAINT "applications_approval_status_check" 
CHECK (("approval_status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text", 'auto_sent'::"text"])));

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS "idx_user_email_aliases_user_id" ON "public"."user_email_aliases" USING "btree" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_email_logs_user_id" ON "public"."email_logs" USING "btree" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_email_logs_application_id" ON "public"."email_logs" USING "btree" ("application_id");
CREATE INDEX IF NOT EXISTS "idx_email_logs_sent_status" ON "public"."email_logs" USING "btree" ("sent_status");
CREATE INDEX IF NOT EXISTS "idx_recruiter_responses_application_id" ON "public"."recruiter_responses" USING "btree" ("application_id");
CREATE INDEX IF NOT EXISTS "idx_recruiter_responses_received_at" ON "public"."recruiter_responses" USING "btree" ("received_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_auto_application_settings_user_id" ON "public"."auto_application_settings" USING "btree" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_auto_application_templates_user_id" ON "public"."auto_application_templates" USING "btree" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_auto_application_stats_user_id_date" ON "public"."auto_application_stats" USING "btree" ("user_id", "date" DESC);

-- Clés étrangères
ALTER TABLE "public"."user_email_aliases" 
ADD CONSTRAINT "user_email_aliases_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE "public"."email_logs" 
ADD CONSTRAINT "email_logs_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE,
ADD CONSTRAINT "email_logs_application_id_fkey" 
FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE SET NULL;

ALTER TABLE "public"."recruiter_responses" 
ADD CONSTRAINT "recruiter_responses_application_id_fkey" 
FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE CASCADE,
ADD CONSTRAINT "recruiter_responses_email_log_id_fkey" 
FOREIGN KEY ("email_log_id") REFERENCES "public"."email_logs"("id") ON DELETE SET NULL;

ALTER TABLE "public"."auto_application_settings" 
ADD CONSTRAINT "auto_application_settings_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE "public"."auto_application_templates" 
ADD CONSTRAINT "auto_application_templates_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE "public"."auto_application_stats" 
ADD CONSTRAINT "auto_application_stats_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE "public"."applications" 
ADD CONSTRAINT "applications_approved_by_fkey" 
FOREIGN KEY ("approved_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;

-- Triggers pour updated_at
CREATE OR REPLACE TRIGGER "update_user_email_aliases_updated_at" 
BEFORE UPDATE ON "public"."user_email_aliases" 
FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE OR REPLACE TRIGGER "update_auto_application_settings_updated_at" 
BEFORE UPDATE ON "public"."auto_application_settings" 
FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE OR REPLACE TRIGGER "update_auto_application_templates_updated_at" 
BEFORE UPDATE ON "public"."auto_application_templates" 
FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

-- RLS Policies
ALTER TABLE "public"."user_email_aliases" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."email_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."recruiter_responses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."auto_application_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."auto_application_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."auto_application_stats" ENABLE ROW LEVEL SECURITY;

-- Policies pour user_email_aliases
CREATE POLICY "Users can manage own email aliases" ON "public"."user_email_aliases" 
TO "authenticated" USING ("auth"."uid"() = "user_id") 
WITH CHECK ("auth"."uid"() = "user_id");

-- Policies pour email_logs
CREATE POLICY "Users can view own email logs" ON "public"."email_logs" 
TO "authenticated" USING ("auth"."uid"() = "user_id");

-- Policies pour recruiter_responses
CREATE POLICY "Users can view own recruiter responses" ON "public"."recruiter_responses" 
TO "authenticated" USING (
  "application_id" IN (
    SELECT "id" FROM "public"."applications" WHERE "user_id" = "auth"."uid"()
  )
);

-- Policies pour auto_application_settings
CREATE POLICY "Users can manage own auto application settings" ON "public"."auto_application_settings" 
TO "authenticated" USING ("auth"."uid"() = "user_id") 
WITH CHECK ("auth"."uid"() = "user_id");

-- Policies pour auto_application_templates
CREATE POLICY "Users can manage own auto application templates" ON "public"."auto_application_templates" 
TO "authenticated" USING ("auth"."uid"() = "user_id") 
WITH CHECK ("auth"."uid"() = "user_id");

-- Policies pour auto_application_stats
CREATE POLICY "Users can view own auto application stats" ON "public"."auto_application_stats" 
TO "authenticated" USING ("auth"."uid"() = "user_id");

-- Fonction pour créer automatiquement un alias email pour un utilisateur
CREATE OR REPLACE FUNCTION "public"."create_user_email_alias"("user_id" "uuid")
RETURNS "text"
LANGUAGE "plpgsql"
SECURITY DEFINER
AS $$
DECLARE
  v_user_profile RECORD;
  v_alias TEXT;
  v_full_email TEXT;
BEGIN
  -- Récupérer les informations du profil utilisateur
  SELECT first_name, last_name INTO v_user_profile
  FROM user_profiles
  WHERE id = user_id;
  
  IF v_user_profile IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  -- Générer un alias unique
  v_alias := LOWER(
    REPLACE(
      REPLACE(
        v_user_profile.first_name || '.' || v_user_profile.last_name || '.' || 
        SUBSTRING(user_id::text, 1, 8),
        ' ', ''
      ),
      '-', ''
    )
  );
  
  v_full_email := v_alias || '@khedmaclair.com';
  
  -- Insérer l'alias email
  INSERT INTO user_email_aliases (user_id, alias, full_email)
  VALUES (user_id, v_alias, v_full_email)
  ON CONFLICT (user_id) DO UPDATE SET
    alias = EXCLUDED.alias,
    full_email = EXCLUDED.full_email,
    updated_at = NOW();
  
  RETURN v_full_email;
END;
$$;

-- Fonction pour mettre à jour les statistiques automatiquement
CREATE OR REPLACE FUNCTION "public"."update_auto_application_stats"("user_id" "uuid", "date" "date")
RETURNS "void"
LANGUAGE "plpgsql"
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO auto_application_stats (
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
    user_id,
    date,
    COUNT(*) FILTER (WHERE status = 'sent' AND DATE(created_at) = date),
    COUNT(*) FILTER (WHERE approval_status = 'approved' AND DATE(approved_at) = date),
    COUNT(*) FILTER (WHERE approval_status = 'rejected' AND DATE(approved_at) = date),
    COUNT(*) FILTER (WHERE response IS NOT NULL AND DATE(response_date) = date),
    COUNT(*) FILTER (WHERE response_type = 'positive' AND DATE(response_date) = date),
    COUNT(*) FILTER (WHERE response_type = 'interview_request' AND DATE(response_date) = date)
  FROM applications a
  LEFT JOIN recruiter_responses rr ON a.id = rr.application_id
  WHERE a.user_id = update_auto_application_stats.user_id
  GROUP BY user_id, date
  ON CONFLICT (user_id, date) DO UPDATE SET
    applications_sent = EXCLUDED.applications_sent,
    applications_approved = EXCLUDED.applications_approved,
    applications_rejected = EXCLUDED.applications_rejected,
    responses_received = EXCLUDED.responses_received,
    positive_responses = EXCLUDED.positive_responses,
    interview_requests = EXCLUDED.interview_requests;
END;
$$; 