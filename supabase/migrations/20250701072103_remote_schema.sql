

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;




ALTER SCHEMA "public" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."check_is_admin"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. User is not an administrator.'
      USING HINT = 'Verify that the user has the Admin role in their metadata.',
            ERRCODE = '42501';
  END IF;
END;
$$;


ALTER FUNCTION "public"."check_is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."debug_admin_access"() RETURNS TABLE("current_user_id" "uuid", "has_admin_role" boolean, "user_metadata" "jsonb", "error_message" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_error_message TEXT;
BEGIN
  current_user_id := auth.uid();
  
  BEGIN
    has_admin_role := is_admin();
    v_error_message := NULL;
  EXCEPTION WHEN OTHERS THEN
    has_admin_role := FALSE;
    v_error_message := SQLERRM;
  END;
  
  SELECT raw_user_meta_data INTO user_metadata
  FROM auth.users
  WHERE id = current_user_id;
  
  RETURN QUERY
  SELECT 
    current_user_id,
    has_admin_role,
    user_metadata,
    v_error_message;
END;
$$;


ALTER FUNCTION "public"."debug_admin_access"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fix_admin_role"("admin_email" "text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_user_id UUID;
  v_current_role TEXT;
BEGIN
  -- Vérifie si l'email correspond à un utilisateur existant
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = admin_email;
  
  IF v_user_id IS NULL THEN
    RETURN 'Erreur: Utilisateur non trouvé';
  END IF;
  
  -- Récupère le rôle actuel
  SELECT COALESCE(raw_user_meta_data->>'role', 'User') INTO v_current_role
  FROM auth.users
  WHERE id = v_user_id;
  
  -- Met à jour le rôle si nécessaire
  IF v_current_role != 'Admin' THEN
    UPDATE auth.users
    SET raw_user_meta_data = 
      CASE 
        WHEN raw_user_meta_data IS NULL THEN 
          jsonb_build_object('role', 'Admin')
        ELSE 
          raw_user_meta_data || jsonb_build_object('role', 'Admin')
      END
    WHERE id = v_user_id;
    
    RETURN 'Succès: Rôle Admin ajouté';
  ELSE
    RETURN 'Info: L''utilisateur est déjà Admin';
  END IF;
END;
$$;


ALTER FUNCTION "public"."fix_admin_role"("admin_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_role"("target_user_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN (
    SELECT COALESCE(raw_user_meta_data->>'role', 'User')
    FROM auth.users
    WHERE id = target_user_id
  );
END;
$$;


ALTER FUNCTION "public"."get_user_role"("target_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_users_with_emails"() RETURNS TABLE("id" "uuid", "first_name" "text", "last_name" "text", "email" character varying, "title" "text", "location" "text", "completion_score" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Vérifie que l'utilisateur actuel est admin
  PERFORM check_is_admin();
  
  RETURN QUERY
  SELECT 
    up.id,
    up.first_name,
    up.last_name,
    au.email::VARCHAR(255),
    up.title,
    up.location,
    up.completion_score,
    up.created_at,
    up.updated_at
  FROM user_profiles up
  LEFT JOIN auth.users au ON up.id = au.id
  ORDER BY up.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_users_with_emails"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Vérifie si l'utilisateur actuel a le rôle Admin dans ses métadonnées
  RETURN (
    SELECT COALESCE(raw_user_meta_data->>'role', '') = 'Admin'
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_role"("target_user_id" "uuid", "new_role" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Vérifie que l'utilisateur actuel est admin
  PERFORM check_is_admin();
  
  -- Met à jour le rôle dans les métadonnées de l'utilisateur
  UPDATE auth.users
  SET raw_user_meta_data = 
    CASE 
      WHEN raw_user_meta_data IS NULL THEN 
        jsonb_build_object('role', new_role)
      ELSE 
        raw_user_meta_data || jsonb_build_object('role', new_role)
    END
  WHERE id = target_user_id;
  
  -- Log l'action
  INSERT INTO system_logs (level, message, metadata)
  VALUES (
    'INFO',
    'User role updated',
    jsonb_build_object(
      'admin_id', auth.uid(),
      'target_user_id', target_user_id,
      'new_role', new_role
    )
  );
END;
$$;


ALTER FUNCTION "public"."update_user_role"("target_user_id" "uuid", "new_role" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_settings" (
    "key" "text" NOT NULL,
    "value" "text" NOT NULL,
    "description" "text",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "groq_api_key" "text",
    "gemini_api_key" "text",
    "preferred_model" "text" DEFAULT 'local-mock'::"text",
    "temperature" numeric DEFAULT 0.7,
    "max_tokens" integer DEFAULT 2048,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "ai_settings_max_tokens_check" CHECK (("max_tokens" > 0)),
    CONSTRAINT "ai_settings_preferred_model_check" CHECK (("preferred_model" = ANY (ARRAY['local-mock'::"text", 'groq-llama'::"text", 'gemini-2.0-flash'::"text"]))),
    CONSTRAINT "ai_settings_temperature_check" CHECK ((("temperature" >= (0)::numeric) AND ("temperature" <= (2)::numeric)))
);


ALTER TABLE "public"."ai_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_usage" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "model" "text" NOT NULL,
    "prompt_tokens" integer DEFAULT 0,
    "completion_tokens" integer DEFAULT 0,
    "total_tokens" integer DEFAULT 0,
    "request_type" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ai_usage" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."applications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "job_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "type" "text" DEFAULT 'manual'::"text" NOT NULL,
    "cover_letter" "text",
    "cover_letter_file_path" "text",
    "custom_message" "text",
    "company_email" "text",
    "email_sent" boolean DEFAULT false,
    "email_id" "text",
    "read_receipt" boolean DEFAULT false,
    "response" "text",
    "response_date" timestamp with time zone,
    "interview_date" timestamp with time zone,
    "notes" "text",
    "attachments" "text"[] DEFAULT '{}'::"text"[],
    "applied_date" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "applications_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'sent'::"text", 'viewed'::"text", 'interview'::"text", 'rejected'::"text", 'accepted'::"text"]))),
    CONSTRAINT "applications_type_check" CHECK (("type" = ANY (ARRAY['manual'::"text", 'automatic'::"text"])))
);


ALTER TABLE "public"."applications" OWNER TO "postgres";


COMMENT ON COLUMN "public"."applications"."cover_letter_file_path" IS 'Chemin vers le fichier de la lettre de motivation dans le bucket ''cover_letters''';



CREATE TABLE IF NOT EXISTS "public"."certifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "issuer" "text" NOT NULL,
    "issue_date" "date" NOT NULL,
    "expiry_date" "date",
    "credential_id" "text",
    "url" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."certifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."education" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "institution" "text" NOT NULL,
    "degree" "text" NOT NULL,
    "field" "text" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date",
    "current" boolean DEFAULT false,
    "grade" "text",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."education" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."experiences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "company" "text" NOT NULL,
    "position" "text" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date",
    "current" boolean DEFAULT false,
    "description" "text",
    "location" "text",
    "achievements" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."experiences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "company" "text" NOT NULL,
    "location" "text" NOT NULL,
    "type" "text" NOT NULL,
    "salary" "text",
    "description" "text" NOT NULL,
    "requirements" "text"[] DEFAULT '{}'::"text"[],
    "benefits" "text"[] DEFAULT '{}'::"text"[],
    "source" "text" NOT NULL,
    "external_id" "text",
    "posted_date" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "jobs_type_check" CHECK (("type" = ANY (ARRAY['CDI'::"text", 'CDD'::"text", 'Stage'::"text", 'Freelance'::"text"])))
);


ALTER TABLE "public"."jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."languages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "level" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "languages_level_check" CHECK (("level" = ANY (ARRAY['A1'::"text", 'A2'::"text", 'B1'::"text", 'B2'::"text", 'C1'::"text", 'C2'::"text", 'Natif'::"text"])))
);


ALTER TABLE "public"."languages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recommendations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "priority" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "action" "text" NOT NULL,
    "category" "text" NOT NULL,
    "completed" boolean DEFAULT false,
    "dismissed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "recommendations_priority_check" CHECK (("priority" = ANY (ARRAY['high'::"text", 'medium'::"text", 'low'::"text"]))),
    CONSTRAINT "recommendations_type_check" CHECK (("type" = ANY (ARRAY['missing_info'::"text", 'improvement'::"text", 'optimization'::"text", 'formatting'::"text"])))
);


ALTER TABLE "public"."recommendations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "job_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."saved_jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."skills" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "level" "text" NOT NULL,
    "category" "text" NOT NULL,
    "verified" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "skills_category_check" CHECK (("category" = ANY (ARRAY['Technique'::"text", 'Soft Skills'::"text", 'Outils'::"text", 'Linguistique'::"text"]))),
    CONSTRAINT "skills_level_check" CHECK (("level" = ANY (ARRAY['Débutant'::"text", 'Intermédiaire'::"text", 'Avancé'::"text", 'Expert'::"text"])))
);


ALTER TABLE "public"."skills" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_alerts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "level" "text" NOT NULL,
    "message" "text" NOT NULL,
    "source" "text" NOT NULL,
    "details" "jsonb",
    "resolved" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "resolved_at" timestamp with time zone,
    "resolved_by" "uuid",
    CONSTRAINT "system_alerts_level_check" CHECK (("level" = ANY (ARRAY['info'::"text", 'warning'::"text", 'error'::"text", 'success'::"text"])))
);


ALTER TABLE "public"."system_alerts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "level" "text" NOT NULL,
    "message" "text" NOT NULL,
    "source" "text" NOT NULL,
    "details" "jsonb",
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "system_logs_level_check" CHECK (("level" = ANY (ARRAY['debug'::"text", 'info'::"text", 'warning'::"text", 'error'::"text"])))
);


ALTER TABLE "public"."system_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "status" "text" NOT NULL,
    "type" "text" NOT NULL,
    "description" "text",
    "payment_method" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "transactions_payment_method_check" CHECK (("payment_method" = ANY (ARRAY['card'::"text", 'paypal'::"text", 'bank_transfer'::"text"]))),
    CONSTRAINT "transactions_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'completed'::"text", 'failed'::"text", 'refunded'::"text"]))),
    CONSTRAINT "transactions_type_check" CHECK (("type" = ANY (ARRAY['subscription'::"text", 'one-time'::"text"])))
);


ALTER TABLE "public"."transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "title" "text",
    "summary" "text",
    "phone" "text",
    "location" "text",
    "date_of_birth" "date",
    "linkedin" "text",
    "github" "text",
    "website" "text",
    "portfolio" "text",
    "cv_file_path" "text",
    "completion_score" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."user_profiles"."cv_file_path" IS 'Chemin vers le fichier CV de l''utilisateur dans le bucket de stockage ''cvs''';



ALTER TABLE ONLY "public"."admin_settings"
    ADD CONSTRAINT "admin_settings_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."ai_settings"
    ADD CONSTRAINT "ai_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_settings"
    ADD CONSTRAINT "ai_settings_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."ai_usage"
    ADD CONSTRAINT "ai_usage_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."certifications"
    ADD CONSTRAINT "certifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."education"
    ADD CONSTRAINT "education_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."experiences"
    ADD CONSTRAINT "experiences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."languages"
    ADD CONSTRAINT "languages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."languages"
    ADD CONSTRAINT "languages_user_id_name_key" UNIQUE ("user_id", "name");



ALTER TABLE ONLY "public"."recommendations"
    ADD CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_jobs"
    ADD CONSTRAINT "saved_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_jobs"
    ADD CONSTRAINT "saved_jobs_user_id_job_id_key" UNIQUE ("user_id", "job_id");



ALTER TABLE ONLY "public"."skills"
    ADD CONSTRAINT "skills_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."skills"
    ADD CONSTRAINT "skills_user_id_name_key" UNIQUE ("user_id", "name");



ALTER TABLE ONLY "public"."system_alerts"
    ADD CONSTRAINT "system_alerts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_logs"
    ADD CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_ai_usage_user_id" ON "public"."ai_usage" USING "btree" ("user_id");



CREATE INDEX "idx_applications_job_id" ON "public"."applications" USING "btree" ("job_id");



CREATE INDEX "idx_applications_user_id" ON "public"."applications" USING "btree" ("user_id");



CREATE INDEX "idx_certifications_user_id" ON "public"."certifications" USING "btree" ("user_id");



CREATE INDEX "idx_education_user_id" ON "public"."education" USING "btree" ("user_id");



CREATE INDEX "idx_experiences_user_id" ON "public"."experiences" USING "btree" ("user_id");



CREATE INDEX "idx_jobs_active" ON "public"."jobs" USING "btree" ("is_active", "posted_date" DESC);



CREATE INDEX "idx_jobs_location" ON "public"."jobs" USING "btree" ("location");



CREATE INDEX "idx_jobs_type" ON "public"."jobs" USING "btree" ("type");



CREATE INDEX "idx_languages_user_id" ON "public"."languages" USING "btree" ("user_id");



CREATE INDEX "idx_recommendations_user_id" ON "public"."recommendations" USING "btree" ("user_id");



CREATE INDEX "idx_saved_jobs_user_id" ON "public"."saved_jobs" USING "btree" ("user_id");



CREATE INDEX "idx_skills_user_id" ON "public"."skills" USING "btree" ("user_id");



CREATE INDEX "idx_system_logs_created_at" ON "public"."system_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_transactions_user_id" ON "public"."transactions" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "update_admin_settings_updated_at" BEFORE UPDATE ON "public"."admin_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_ai_settings_updated_at" BEFORE UPDATE ON "public"."ai_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_transactions_updated_at" BEFORE UPDATE ON "public"."transactions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_profiles_updated_at" BEFORE UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."admin_settings"
    ADD CONSTRAINT "admin_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."ai_settings"
    ADD CONSTRAINT "ai_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_usage"
    ADD CONSTRAINT "ai_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."certifications"
    ADD CONSTRAINT "certifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."education"
    ADD CONSTRAINT "education_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."experiences"
    ADD CONSTRAINT "experiences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."languages"
    ADD CONSTRAINT "languages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recommendations"
    ADD CONSTRAINT "recommendations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_jobs"
    ADD CONSTRAINT "saved_jobs_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_jobs"
    ADD CONSTRAINT "saved_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."skills"
    ADD CONSTRAINT "skills_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."system_alerts"
    ADD CONSTRAINT "system_alerts_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."system_logs"
    ADD CONSTRAINT "system_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can access admin settings" ON "public"."admin_settings" USING ("public"."is_admin"());



CREATE POLICY "Admins can access system alerts" ON "public"."system_alerts" USING ("public"."is_admin"());



CREATE POLICY "Admins can access system logs" ON "public"."system_logs" USING ("public"."is_admin"());



CREATE POLICY "Admins can view all profiles" ON "public"."user_profiles" USING ("public"."is_admin"());



CREATE POLICY "System can insert AI usage" ON "public"."ai_usage" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Temporary admin access - admin_settings" ON "public"."admin_settings" TO "authenticated" USING (true);



CREATE POLICY "Temporary admin access - jobs" ON "public"."jobs" TO "authenticated" USING (true);



CREATE POLICY "Temporary admin access - system_alerts" ON "public"."system_alerts" TO "authenticated" USING (true);



CREATE POLICY "Temporary admin access - system_logs" ON "public"."system_logs" TO "authenticated" USING (true);



CREATE POLICY "Temporary admin access - transactions" ON "public"."transactions" TO "authenticated" USING (true);



CREATE POLICY "Temporary admin access - user_profiles" ON "public"."user_profiles" TO "authenticated" USING (true);



CREATE POLICY "Users can manage own AI settings" ON "public"."ai_settings" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own applications" ON "public"."applications" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own certifications" ON "public"."certifications" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own education" ON "public"."education" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own experiences" ON "public"."experiences" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own languages" ON "public"."languages" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own recommendations" ON "public"."recommendations" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own saved jobs" ON "public"."saved_jobs" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own skills" ON "public"."skills" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own AI usage" ON "public"."ai_usage" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own profile" ON "public"."user_profiles" FOR SELECT USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."admin_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_usage" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."applications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."certifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."education" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."experiences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."languages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recommendations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."skills" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_alerts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT ALL ON SCHEMA "public" TO PUBLIC;






































































































































































































RESET ALL;
