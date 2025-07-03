create table "public"."admin_settings" (
    "key" text not null,
    "value" text not null,
    "description" text,
    "updated_by" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."admin_settings" enable row level security;

create table "public"."ai_settings" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "groq_api_key" text,
    "gemini_api_key" text,
    "preferred_model" text default 'local-mock'::text,
    "temperature" numeric default 0.7,
    "max_tokens" integer default 2048,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."ai_settings" enable row level security;

create table "public"."ai_usage" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "model" text not null,
    "prompt_tokens" integer default 0,
    "completion_tokens" integer default 0,
    "total_tokens" integer default 0,
    "request_type" text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."ai_usage" enable row level security;

create table "public"."applications" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "job_id" uuid not null,
    "status" text not null default 'draft'::text,
    "type" text not null default 'manual'::text,
    "cover_letter" text,
    "cover_letter_file_path" text,
    "custom_message" text,
    "company_email" text,
    "email_sent" boolean default false,
    "email_id" text,
    "read_receipt" boolean default false,
    "response" text,
    "response_date" timestamp with time zone,
    "interview_date" timestamp with time zone,
    "notes" text,
    "attachments" text[] default '{}'::text[],
    "applied_date" timestamp with time zone default now(),
    "created_at" timestamp with time zone default now(),
    "auto_mode" boolean default false,
    "email_sent_at" timestamp with time zone,
    "mail_id" text,
    "approval_status" text default 'pending'::text,
    "approved_at" timestamp with time zone,
    "approved_by" uuid,
    "auto_settings_used" jsonb
);


alter table "public"."applications" enable row level security;

create table "public"."auto_application_settings" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "enabled" boolean default false,
    "max_applications_per_day" integer default 10,
    "min_salary" integer,
    "max_salary" integer,
    "preferred_locations" text[] default '{}'::text[],
    "excluded_companies" text[] default '{}'::text[],
    "required_keywords" text[] default '{}'::text[],
    "excluded_keywords" text[] default '{}'::text[],
    "job_types" text[] default '{}'::text[],
    "experience_level" text default 'all'::text,
    "auto_send" boolean default false,
    "require_approval" boolean default true,
    "notification_preferences" jsonb default '{"sms": false, "push": true, "email": true}'::jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."auto_application_settings" enable row level security;

create table "public"."auto_application_stats" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "date" date not null,
    "applications_sent" integer default 0,
    "applications_approved" integer default 0,
    "applications_rejected" integer default 0,
    "responses_received" integer default 0,
    "positive_responses" integer default 0,
    "interview_requests" integer default 0,
    "created_at" timestamp with time zone default now()
);


alter table "public"."auto_application_stats" enable row level security;

create table "public"."auto_application_templates" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "name" text not null,
    "subject_template" text not null,
    "body_template" text not null,
    "is_default" boolean default false,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."auto_application_templates" enable row level security;

create table "public"."certifications" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "name" text not null,
    "issuer" text not null,
    "issue_date" date not null,
    "expiry_date" date,
    "credential_id" text,
    "url" text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."certifications" enable row level security;

create table "public"."cv_versions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "name" text not null,
    "file_path" text not null,
    "original_file_name" text not null,
    "file_size" integer,
    "file_type" text,
    "is_active" boolean default false,
    "description" text,
    "analysis_data" jsonb,
    "upload_date" timestamp with time zone default now(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."cv_versions" enable row level security;

create table "public"."education" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "institution" text not null,
    "degree" text not null,
    "field" text not null,
    "start_date" date not null,
    "end_date" date,
    "current" boolean default false,
    "grade" text,
    "description" text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."education" enable row level security;

create table "public"."email_logs" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "application_id" uuid,
    "mail_id" text not null,
    "to_email" text not null,
    "from_email" text not null,
    "subject" text not null,
    "body" text not null,
    "attachments" text[] default '{}'::text[],
    "sent_status" text not null default 'pending'::text,
    "sent_at" timestamp with time zone,
    "delivered_at" timestamp with time zone,
    "read_at" timestamp with time zone,
    "retries" integer default 0,
    "error_message" text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."email_logs" enable row level security;

create table "public"."experiences" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "company" text not null,
    "position" text not null,
    "start_date" date not null,
    "end_date" date,
    "current" boolean default false,
    "description" text,
    "location" text,
    "achievements" text[] default '{}'::text[],
    "created_at" timestamp with time zone default now()
);


alter table "public"."experiences" enable row level security;

create table "public"."jobs" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "company" text not null,
    "location" text not null,
    "type" text not null,
    "salary" text,
    "description" text not null,
    "requirements" text[] default '{}'::text[],
    "benefits" text[] default '{}'::text[],
    "source" text not null,
    "external_id" text,
    "posted_date" timestamp with time zone default now(),
    "expires_at" timestamp with time zone,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now()
);


alter table "public"."jobs" enable row level security;

create table "public"."languages" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "name" text not null,
    "level" text not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."languages" enable row level security;

create table "public"."notifications" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "type" text not null,
    "title" text not null,
    "message" text not null,
    "read" boolean default false,
    "priority" text default 'medium'::text,
    "action_url" text,
    "metadata" jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."notifications" enable row level security;

create table "public"."recommendations" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "type" text not null,
    "priority" text not null,
    "title" text not null,
    "description" text not null,
    "action" text not null,
    "category" text not null,
    "completed" boolean default false,
    "dismissed" boolean default false,
    "created_at" timestamp with time zone default now()
);


alter table "public"."recommendations" enable row level security;

create table "public"."recruiter_responses" (
    "id" uuid not null default gen_random_uuid(),
    "application_id" uuid not null,
    "email_log_id" uuid,
    "from_email" text not null,
    "from_name" text,
    "subject" text not null,
    "body" text not null,
    "received_at" timestamp with time zone default now(),
    "parsed" boolean default false,
    "response_type" text default 'unknown'::text,
    "sentiment" text,
    "action_required" boolean default false,
    "priority" text default 'normal'::text,
    "processed" boolean default false,
    "created_at" timestamp with time zone default now()
);


alter table "public"."recruiter_responses" enable row level security;

create table "public"."saved_jobs" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "job_id" uuid not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."saved_jobs" enable row level security;

create table "public"."skills" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "name" text not null,
    "level" text not null,
    "category" text not null,
    "verified" boolean default false,
    "created_at" timestamp with time zone default now()
);


alter table "public"."skills" enable row level security;

create table "public"."system_alerts" (
    "id" uuid not null default gen_random_uuid(),
    "level" text not null,
    "message" text not null,
    "source" text not null,
    "details" jsonb,
    "resolved" boolean default false,
    "created_at" timestamp with time zone default now(),
    "resolved_at" timestamp with time zone,
    "resolved_by" uuid
);


alter table "public"."system_alerts" enable row level security;

create table "public"."system_logs" (
    "id" uuid not null default gen_random_uuid(),
    "level" text not null,
    "message" text not null,
    "source" text not null,
    "details" jsonb,
    "user_id" uuid,
    "created_at" timestamp with time zone default now()
);


alter table "public"."system_logs" enable row level security;

create table "public"."transactions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "amount" numeric(10,2) not null,
    "status" text not null,
    "type" text not null,
    "description" text,
    "payment_method" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."transactions" enable row level security;

create table "public"."user_email_aliases" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "alias" text not null,
    "full_email" text not null,
    "routing_status" text not null default 'active'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."user_email_aliases" enable row level security;

create table "public"."user_profiles" (
    "id" uuid not null,
    "first_name" text not null,
    "last_name" text not null,
    "title" text,
    "summary" text,
    "phone" text,
    "location" text,
    "date_of_birth" date,
    "linkedin" text,
    "github" text,
    "website" text,
    "portfolio" text,
    "cv_file_path" text,
    "completion_score" integer default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."user_profiles" enable row level security;

CREATE UNIQUE INDEX admin_settings_pkey ON public.admin_settings USING btree (key);

CREATE UNIQUE INDEX ai_settings_pkey ON public.ai_settings USING btree (id);

CREATE UNIQUE INDEX ai_settings_user_id_key ON public.ai_settings USING btree (user_id);

CREATE UNIQUE INDEX ai_usage_pkey ON public.ai_usage USING btree (id);

CREATE UNIQUE INDEX applications_pkey ON public.applications USING btree (id);

CREATE UNIQUE INDEX auto_application_settings_pkey ON public.auto_application_settings USING btree (id);

CREATE UNIQUE INDEX auto_application_settings_user_id_key ON public.auto_application_settings USING btree (user_id);

CREATE UNIQUE INDEX auto_application_stats_pkey ON public.auto_application_stats USING btree (id);

CREATE UNIQUE INDEX auto_application_stats_user_id_date_key ON public.auto_application_stats USING btree (user_id, date);

CREATE UNIQUE INDEX auto_application_templates_pkey ON public.auto_application_templates USING btree (id);

CREATE UNIQUE INDEX certifications_pkey ON public.certifications USING btree (id);

CREATE UNIQUE INDEX cv_versions_pkey ON public.cv_versions USING btree (id);

CREATE UNIQUE INDEX education_pkey ON public.education USING btree (id);

CREATE UNIQUE INDEX email_logs_pkey ON public.email_logs USING btree (id);

CREATE UNIQUE INDEX experiences_pkey ON public.experiences USING btree (id);

CREATE INDEX idx_ai_usage_user_id ON public.ai_usage USING btree (user_id);

CREATE INDEX idx_applications_job_id ON public.applications USING btree (job_id);

CREATE INDEX idx_applications_user_id ON public.applications USING btree (user_id);

CREATE INDEX idx_auto_application_settings_user_id ON public.auto_application_settings USING btree (user_id);

CREATE INDEX idx_auto_application_stats_user_id_date ON public.auto_application_stats USING btree (user_id, date DESC);

CREATE INDEX idx_auto_application_templates_user_id ON public.auto_application_templates USING btree (user_id);

CREATE INDEX idx_certifications_user_id ON public.certifications USING btree (user_id);

CREATE INDEX idx_cv_versions_active ON public.cv_versions USING btree (is_active);

CREATE INDEX idx_cv_versions_created_at ON public.cv_versions USING btree (created_at DESC);

CREATE INDEX idx_cv_versions_user_id ON public.cv_versions USING btree (user_id);

CREATE INDEX idx_education_user_id ON public.education USING btree (user_id);

CREATE INDEX idx_email_logs_application_id ON public.email_logs USING btree (application_id);

CREATE INDEX idx_email_logs_sent_status ON public.email_logs USING btree (sent_status);

CREATE INDEX idx_email_logs_user_id ON public.email_logs USING btree (user_id);

CREATE INDEX idx_experiences_user_id ON public.experiences USING btree (user_id);

CREATE INDEX idx_jobs_active ON public.jobs USING btree (is_active, posted_date DESC);

CREATE INDEX idx_jobs_location ON public.jobs USING btree (location);

CREATE INDEX idx_jobs_type ON public.jobs USING btree (type);

CREATE INDEX idx_languages_user_id ON public.languages USING btree (user_id);

CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at DESC);

CREATE INDEX idx_notifications_read ON public.notifications USING btree (read);

CREATE INDEX idx_notifications_type ON public.notifications USING btree (type);

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);

CREATE INDEX idx_recommendations_user_id ON public.recommendations USING btree (user_id);

CREATE INDEX idx_recruiter_responses_application_id ON public.recruiter_responses USING btree (application_id);

CREATE INDEX idx_recruiter_responses_received_at ON public.recruiter_responses USING btree (received_at DESC);

CREATE INDEX idx_saved_jobs_user_id ON public.saved_jobs USING btree (user_id);

CREATE INDEX idx_skills_user_id ON public.skills USING btree (user_id);

CREATE INDEX idx_system_logs_created_at ON public.system_logs USING btree (created_at DESC);

CREATE INDEX idx_transactions_user_id ON public.transactions USING btree (user_id);

CREATE INDEX idx_user_email_aliases_user_id ON public.user_email_aliases USING btree (user_id);

CREATE UNIQUE INDEX jobs_pkey ON public.jobs USING btree (id);

CREATE UNIQUE INDEX languages_pkey ON public.languages USING btree (id);

CREATE UNIQUE INDEX languages_user_id_name_key ON public.languages USING btree (user_id, name);

CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

CREATE UNIQUE INDEX recommendations_pkey ON public.recommendations USING btree (id);

CREATE UNIQUE INDEX recruiter_responses_pkey ON public.recruiter_responses USING btree (id);

CREATE UNIQUE INDEX saved_jobs_pkey ON public.saved_jobs USING btree (id);

CREATE UNIQUE INDEX saved_jobs_user_id_job_id_key ON public.saved_jobs USING btree (user_id, job_id);

CREATE UNIQUE INDEX skills_pkey ON public.skills USING btree (id);

CREATE UNIQUE INDEX skills_user_id_name_key ON public.skills USING btree (user_id, name);

CREATE UNIQUE INDEX system_alerts_pkey ON public.system_alerts USING btree (id);

CREATE UNIQUE INDEX system_logs_pkey ON public.system_logs USING btree (id);

CREATE UNIQUE INDEX transactions_pkey ON public.transactions USING btree (id);

CREATE UNIQUE INDEX user_email_aliases_alias_key ON public.user_email_aliases USING btree (alias);

CREATE UNIQUE INDEX user_email_aliases_pkey ON public.user_email_aliases USING btree (id);

CREATE UNIQUE INDEX user_email_aliases_user_id_key ON public.user_email_aliases USING btree (user_id);

CREATE UNIQUE INDEX user_profiles_pkey ON public.user_profiles USING btree (id);

alter table "public"."admin_settings" add constraint "admin_settings_pkey" PRIMARY KEY using index "admin_settings_pkey";

alter table "public"."ai_settings" add constraint "ai_settings_pkey" PRIMARY KEY using index "ai_settings_pkey";

alter table "public"."ai_usage" add constraint "ai_usage_pkey" PRIMARY KEY using index "ai_usage_pkey";

alter table "public"."applications" add constraint "applications_pkey" PRIMARY KEY using index "applications_pkey";

alter table "public"."auto_application_settings" add constraint "auto_application_settings_pkey" PRIMARY KEY using index "auto_application_settings_pkey";

alter table "public"."auto_application_stats" add constraint "auto_application_stats_pkey" PRIMARY KEY using index "auto_application_stats_pkey";

alter table "public"."auto_application_templates" add constraint "auto_application_templates_pkey" PRIMARY KEY using index "auto_application_templates_pkey";

alter table "public"."certifications" add constraint "certifications_pkey" PRIMARY KEY using index "certifications_pkey";

alter table "public"."cv_versions" add constraint "cv_versions_pkey" PRIMARY KEY using index "cv_versions_pkey";

alter table "public"."education" add constraint "education_pkey" PRIMARY KEY using index "education_pkey";

alter table "public"."email_logs" add constraint "email_logs_pkey" PRIMARY KEY using index "email_logs_pkey";

alter table "public"."experiences" add constraint "experiences_pkey" PRIMARY KEY using index "experiences_pkey";

alter table "public"."jobs" add constraint "jobs_pkey" PRIMARY KEY using index "jobs_pkey";

alter table "public"."languages" add constraint "languages_pkey" PRIMARY KEY using index "languages_pkey";

alter table "public"."notifications" add constraint "notifications_pkey" PRIMARY KEY using index "notifications_pkey";

alter table "public"."recommendations" add constraint "recommendations_pkey" PRIMARY KEY using index "recommendations_pkey";

alter table "public"."recruiter_responses" add constraint "recruiter_responses_pkey" PRIMARY KEY using index "recruiter_responses_pkey";

alter table "public"."saved_jobs" add constraint "saved_jobs_pkey" PRIMARY KEY using index "saved_jobs_pkey";

alter table "public"."skills" add constraint "skills_pkey" PRIMARY KEY using index "skills_pkey";

alter table "public"."system_alerts" add constraint "system_alerts_pkey" PRIMARY KEY using index "system_alerts_pkey";

alter table "public"."system_logs" add constraint "system_logs_pkey" PRIMARY KEY using index "system_logs_pkey";

alter table "public"."transactions" add constraint "transactions_pkey" PRIMARY KEY using index "transactions_pkey";

alter table "public"."user_email_aliases" add constraint "user_email_aliases_pkey" PRIMARY KEY using index "user_email_aliases_pkey";

alter table "public"."user_profiles" add constraint "user_profiles_pkey" PRIMARY KEY using index "user_profiles_pkey";

alter table "public"."admin_settings" add constraint "admin_settings_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES auth.users(id) not valid;

alter table "public"."admin_settings" validate constraint "admin_settings_updated_by_fkey";

alter table "public"."ai_settings" add constraint "ai_settings_max_tokens_check" CHECK ((max_tokens > 0)) not valid;

alter table "public"."ai_settings" validate constraint "ai_settings_max_tokens_check";

alter table "public"."ai_settings" add constraint "ai_settings_preferred_model_check" CHECK ((preferred_model = ANY (ARRAY['local-mock'::text, 'groq-llama'::text, 'gemini-2.0-flash'::text]))) not valid;

alter table "public"."ai_settings" validate constraint "ai_settings_preferred_model_check";

alter table "public"."ai_settings" add constraint "ai_settings_temperature_check" CHECK (((temperature >= (0)::numeric) AND (temperature <= (2)::numeric))) not valid;

alter table "public"."ai_settings" validate constraint "ai_settings_temperature_check";

alter table "public"."ai_settings" add constraint "ai_settings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."ai_settings" validate constraint "ai_settings_user_id_fkey";

alter table "public"."ai_settings" add constraint "ai_settings_user_id_key" UNIQUE using index "ai_settings_user_id_key";

alter table "public"."ai_usage" add constraint "ai_usage_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."ai_usage" validate constraint "ai_usage_user_id_fkey";

alter table "public"."applications" add constraint "applications_approval_status_check" CHECK ((approval_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'auto_sent'::text]))) not valid;

alter table "public"."applications" validate constraint "applications_approval_status_check";

alter table "public"."applications" add constraint "applications_approved_by_fkey" FOREIGN KEY (approved_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."applications" validate constraint "applications_approved_by_fkey";

alter table "public"."applications" add constraint "applications_job_id_fkey" FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE not valid;

alter table "public"."applications" validate constraint "applications_job_id_fkey";

alter table "public"."applications" add constraint "applications_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'sent'::text, 'viewed'::text, 'interview'::text, 'rejected'::text, 'accepted'::text]))) not valid;

alter table "public"."applications" validate constraint "applications_status_check";

alter table "public"."applications" add constraint "applications_type_check" CHECK ((type = ANY (ARRAY['manual'::text, 'automatic'::text]))) not valid;

alter table "public"."applications" validate constraint "applications_type_check";

alter table "public"."applications" add constraint "applications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."applications" validate constraint "applications_user_id_fkey";

alter table "public"."auto_application_settings" add constraint "auto_application_settings_experience_level_check" CHECK ((experience_level = ANY (ARRAY['junior'::text, 'mid'::text, 'senior'::text, 'all'::text]))) not valid;

alter table "public"."auto_application_settings" validate constraint "auto_application_settings_experience_level_check";

alter table "public"."auto_application_settings" add constraint "auto_application_settings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."auto_application_settings" validate constraint "auto_application_settings_user_id_fkey";

alter table "public"."auto_application_settings" add constraint "auto_application_settings_user_id_key" UNIQUE using index "auto_application_settings_user_id_key";

alter table "public"."auto_application_stats" add constraint "auto_application_stats_user_id_date_key" UNIQUE using index "auto_application_stats_user_id_date_key";

alter table "public"."auto_application_stats" add constraint "auto_application_stats_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."auto_application_stats" validate constraint "auto_application_stats_user_id_fkey";

alter table "public"."auto_application_templates" add constraint "auto_application_templates_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."auto_application_templates" validate constraint "auto_application_templates_user_id_fkey";

alter table "public"."certifications" add constraint "certifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."certifications" validate constraint "certifications_user_id_fkey";

alter table "public"."cv_versions" add constraint "cv_versions_file_type_check" CHECK ((file_type = ANY (ARRAY['pdf'::text, 'doc'::text, 'docx'::text]))) not valid;

alter table "public"."cv_versions" validate constraint "cv_versions_file_type_check";

alter table "public"."cv_versions" add constraint "cv_versions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."cv_versions" validate constraint "cv_versions_user_id_fkey";

alter table "public"."education" add constraint "education_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."education" validate constraint "education_user_id_fkey";

alter table "public"."email_logs" add constraint "email_logs_application_id_fkey" FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL not valid;

alter table "public"."email_logs" validate constraint "email_logs_application_id_fkey";

alter table "public"."email_logs" add constraint "email_logs_sent_status_check" CHECK ((sent_status = ANY (ARRAY['pending'::text, 'sent'::text, 'delivered'::text, 'failed'::text, 'bounced'::text]))) not valid;

alter table "public"."email_logs" validate constraint "email_logs_sent_status_check";

alter table "public"."email_logs" add constraint "email_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."email_logs" validate constraint "email_logs_user_id_fkey";

alter table "public"."experiences" add constraint "experiences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."experiences" validate constraint "experiences_user_id_fkey";

alter table "public"."jobs" add constraint "jobs_type_check" CHECK ((type = ANY (ARRAY['CDI'::text, 'CDD'::text, 'Stage'::text, 'Freelance'::text]))) not valid;

alter table "public"."jobs" validate constraint "jobs_type_check";

alter table "public"."languages" add constraint "languages_level_check" CHECK ((level = ANY (ARRAY['A1'::text, 'A2'::text, 'B1'::text, 'B2'::text, 'C1'::text, 'C2'::text, 'Natif'::text]))) not valid;

alter table "public"."languages" validate constraint "languages_level_check";

alter table "public"."languages" add constraint "languages_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."languages" validate constraint "languages_user_id_fkey";

alter table "public"."languages" add constraint "languages_user_id_name_key" UNIQUE using index "languages_user_id_name_key";

alter table "public"."notifications" add constraint "notifications_priority_check" CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]))) not valid;

alter table "public"."notifications" validate constraint "notifications_priority_check";

alter table "public"."notifications" add constraint "notifications_type_check" CHECK ((type = ANY (ARRAY['application'::text, 'job'::text, 'interview'::text, 'reminder'::text, 'system'::text]))) not valid;

alter table "public"."notifications" validate constraint "notifications_type_check";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

alter table "public"."recommendations" add constraint "recommendations_priority_check" CHECK ((priority = ANY (ARRAY['high'::text, 'medium'::text, 'low'::text]))) not valid;

alter table "public"."recommendations" validate constraint "recommendations_priority_check";

alter table "public"."recommendations" add constraint "recommendations_type_check" CHECK ((type = ANY (ARRAY['missing_info'::text, 'improvement'::text, 'optimization'::text, 'formatting'::text]))) not valid;

alter table "public"."recommendations" validate constraint "recommendations_type_check";

alter table "public"."recommendations" add constraint "recommendations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."recommendations" validate constraint "recommendations_user_id_fkey";

alter table "public"."recruiter_responses" add constraint "recruiter_responses_application_id_fkey" FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE not valid;

alter table "public"."recruiter_responses" validate constraint "recruiter_responses_application_id_fkey";

alter table "public"."recruiter_responses" add constraint "recruiter_responses_email_log_id_fkey" FOREIGN KEY (email_log_id) REFERENCES email_logs(id) ON DELETE SET NULL not valid;

alter table "public"."recruiter_responses" validate constraint "recruiter_responses_email_log_id_fkey";

alter table "public"."recruiter_responses" add constraint "recruiter_responses_priority_check" CHECK ((priority = ANY (ARRAY['low'::text, 'normal'::text, 'high'::text, 'urgent'::text]))) not valid;

alter table "public"."recruiter_responses" validate constraint "recruiter_responses_priority_check";

alter table "public"."recruiter_responses" add constraint "recruiter_responses_response_type_check" CHECK ((response_type = ANY (ARRAY['positive'::text, 'negative'::text, 'neutral'::text, 'interview_request'::text, 'rejection'::text, 'unknown'::text]))) not valid;

alter table "public"."recruiter_responses" validate constraint "recruiter_responses_response_type_check";

alter table "public"."saved_jobs" add constraint "saved_jobs_job_id_fkey" FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE not valid;

alter table "public"."saved_jobs" validate constraint "saved_jobs_job_id_fkey";

alter table "public"."saved_jobs" add constraint "saved_jobs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."saved_jobs" validate constraint "saved_jobs_user_id_fkey";

alter table "public"."saved_jobs" add constraint "saved_jobs_user_id_job_id_key" UNIQUE using index "saved_jobs_user_id_job_id_key";

alter table "public"."skills" add constraint "skills_category_check" CHECK ((category = ANY (ARRAY['Technique'::text, 'Soft Skills'::text, 'Outils'::text, 'Linguistique'::text]))) not valid;

alter table "public"."skills" validate constraint "skills_category_check";

alter table "public"."skills" add constraint "skills_level_check" CHECK ((level = ANY (ARRAY['Débutant'::text, 'Intermédiaire'::text, 'Avancé'::text, 'Expert'::text]))) not valid;

alter table "public"."skills" validate constraint "skills_level_check";

alter table "public"."skills" add constraint "skills_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."skills" validate constraint "skills_user_id_fkey";

alter table "public"."skills" add constraint "skills_user_id_name_key" UNIQUE using index "skills_user_id_name_key";

alter table "public"."system_alerts" add constraint "system_alerts_level_check" CHECK ((level = ANY (ARRAY['info'::text, 'warning'::text, 'error'::text, 'success'::text]))) not valid;

alter table "public"."system_alerts" validate constraint "system_alerts_level_check";

alter table "public"."system_alerts" add constraint "system_alerts_resolved_by_fkey" FOREIGN KEY (resolved_by) REFERENCES auth.users(id) not valid;

alter table "public"."system_alerts" validate constraint "system_alerts_resolved_by_fkey";

alter table "public"."system_logs" add constraint "system_logs_level_check" CHECK ((level = ANY (ARRAY['debug'::text, 'info'::text, 'warning'::text, 'error'::text]))) not valid;

alter table "public"."system_logs" validate constraint "system_logs_level_check";

alter table "public"."system_logs" add constraint "system_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."system_logs" validate constraint "system_logs_user_id_fkey";

alter table "public"."transactions" add constraint "transactions_payment_method_check" CHECK ((payment_method = ANY (ARRAY['card'::text, 'paypal'::text, 'bank_transfer'::text]))) not valid;

alter table "public"."transactions" validate constraint "transactions_payment_method_check";

alter table "public"."transactions" add constraint "transactions_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text, 'refunded'::text]))) not valid;

alter table "public"."transactions" validate constraint "transactions_status_check";

alter table "public"."transactions" add constraint "transactions_type_check" CHECK ((type = ANY (ARRAY['subscription'::text, 'one-time'::text]))) not valid;

alter table "public"."transactions" validate constraint "transactions_type_check";

alter table "public"."transactions" add constraint "transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."transactions" validate constraint "transactions_user_id_fkey";

alter table "public"."user_email_aliases" add constraint "user_email_aliases_alias_key" UNIQUE using index "user_email_aliases_alias_key";

alter table "public"."user_email_aliases" add constraint "user_email_aliases_routing_status_check" CHECK ((routing_status = ANY (ARRAY['active'::text, 'inactive'::text, 'suspended'::text]))) not valid;

alter table "public"."user_email_aliases" validate constraint "user_email_aliases_routing_status_check";

alter table "public"."user_email_aliases" add constraint "user_email_aliases_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_email_aliases" validate constraint "user_email_aliases_user_id_fkey";

alter table "public"."user_email_aliases" add constraint "user_email_aliases_user_id_key" UNIQUE using index "user_email_aliases_user_id_key";

alter table "public"."user_profiles" add constraint "user_profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_is_admin()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. User is not an administrator.'
      USING HINT = 'Verify that the user has the Admin role in their metadata.',
            ERRCODE = '42501';
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    DELETE FROM public.notifications
    WHERE created_at < (now() - INTERVAL '30 days')
    AND read = true;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_notification(target_user_id uuid, notification_type text, notification_title text, notification_message text, notification_priority text DEFAULT 'medium'::text, notification_action_url text DEFAULT NULL::text, notification_metadata jsonb DEFAULT NULL::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.create_user_email_alias(user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.debug_admin_access()
 RETURNS TABLE(current_user_id uuid, has_admin_role boolean, user_metadata jsonb, error_message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.fix_admin_role(admin_email text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_role(target_user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN (
    SELECT COALESCE(raw_user_meta_data->>'role', 'User')
    FROM auth.users
    WHERE id = target_user_id
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_users_with_emails()
 RETURNS TABLE(id uuid, first_name text, last_name text, email character varying, title text, location text, completion_score integer, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Vérifie si l'utilisateur actuel a le rôle Admin dans ses métadonnées
  RETURN (
    SELECT COALESCE(raw_user_meta_data->>'role', '') = 'Admin'
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    UPDATE public.notifications
    SET read = true, updated_at = now()
    WHERE id = notification_id AND user_id = auth.uid();
END;
$function$
;

CREATE OR REPLACE FUNCTION public.notify_application_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Notification quand le statut d'une candidature change
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    PERFORM create_notification(
      NEW.user_id,
      'application',
      'Mise à jour de candidature',
      'Le statut de votre candidature a changé : ' || NEW.status,
      CASE 
        WHEN NEW.status IN ('accepté', 'entretien') THEN 'high'
        WHEN NEW.status = 'refusé' THEN 'medium'
        ELSE 'low'
      END,
      '/applications/' || NEW.id::text
    );
  END IF;
  
  -- Notification pour nouvelle candidature
  IF TG_OP = 'INSERT' THEN
    PERFORM create_notification(
      NEW.user_id,
      'application',
      'Candidature envoyée',
      'Votre candidature a été envoyée avec succès',
      'medium',
      '/applications/' || NEW.id::text
    );
  END IF;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.notify_interview_reminder()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.interview_date IS NOT NULL AND OLD.interview_date IS DISTINCT FROM NEW.interview_date THEN
    -- Notification immédiate
    PERFORM create_notification(
      NEW.user_id,
      'interview',
      'Entretien programmé',
      'Votre entretien est programmé le ' || to_char(NEW.interview_date, 'DD/MM/YYYY à HH24:MI'),
      'high',
      '/applications/' || NEW.id::text
    );
  END IF;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.notify_new_job_match()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  user_record RECORD;
  job_skills TEXT[];
  user_skills TEXT[];
  match_count INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Extraire les compétences du job
    job_skills := ARRAY(SELECT jsonb_array_elements_text(NEW.requirements));
    
    -- Trouver les utilisateurs avec des compétences correspondantes
    FOR user_record IN 
      SELECT DISTINCT up.id, up.first_name, up.last_name
      FROM user_profiles up
      JOIN skills s ON s.user_id = up.id
      WHERE s.name = ANY(job_skills)
    LOOP
      -- Compter les compétences correspondantes
      SELECT COUNT(*) INTO match_count
      FROM skills s
      WHERE s.user_id = user_record.id
      AND s.name = ANY(job_skills);
      
      -- Notifier si au moins 2 compétences correspondent
      IF match_count >= 2 THEN
        PERFORM create_notification(
          user_record.id,
          'job',
          'Nouvelle opportunité correspondante',
          'Un nouveau poste "' || NEW.title || '" chez ' || NEW.company || ' correspond à votre profil (' || match_count || ' compétences)',
          'medium',
          '/jobs/' || NEW.id::text,
          jsonb_build_object('match_score', match_count, 'job_id', NEW.id)
        );
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_active_cv(cv_version_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_auto_application_stats(user_id uuid, date date)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_user_role(target_user_id uuid, new_role text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

create policy "Admins can access admin settings"
on "public"."admin_settings"
as permissive
for all
to public
using (is_admin());


create policy "Temporary admin access - admin_settings"
on "public"."admin_settings"
as permissive
for all
to authenticated
using (true);


create policy "Users can manage own AI settings"
on "public"."ai_settings"
as permissive
for all
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "System can insert AI usage"
on "public"."ai_usage"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));


create policy "Users can view own AI usage"
on "public"."ai_usage"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "Users can manage own applications"
on "public"."applications"
as permissive
for all
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Users can manage own auto application settings"
on "public"."auto_application_settings"
as permissive
for all
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Users can view own auto application stats"
on "public"."auto_application_stats"
as permissive
for all
to authenticated
using ((auth.uid() = user_id));


create policy "Users can manage own auto application templates"
on "public"."auto_application_templates"
as permissive
for all
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Users can manage own certifications"
on "public"."certifications"
as permissive
for all
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Users can manage own CV versions"
on "public"."cv_versions"
as permissive
for all
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Users can manage own education"
on "public"."education"
as permissive
for all
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Users can view own email logs"
on "public"."email_logs"
as permissive
for all
to authenticated
using ((auth.uid() = user_id));


create policy "Users can manage own experiences"
on "public"."experiences"
as permissive
for all
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Temporary admin access - jobs"
on "public"."jobs"
as permissive
for all
to authenticated
using (true);


create policy "Users can manage own languages"
on "public"."languages"
as permissive
for all
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "System can insert notifications"
on "public"."notifications"
as permissive
for insert
to authenticated
with check (true);


create policy "Users can delete own notifications"
on "public"."notifications"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "Users can update own notifications"
on "public"."notifications"
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Users can view own notifications"
on "public"."notifications"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "Users can manage own recommendations"
on "public"."recommendations"
as permissive
for all
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Users can view own recruiter responses"
on "public"."recruiter_responses"
as permissive
for all
to authenticated
using ((application_id IN ( SELECT applications.id
   FROM applications
  WHERE (applications.user_id = auth.uid()))));


create policy "Users can manage own saved jobs"
on "public"."saved_jobs"
as permissive
for all
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Users can manage own skills"
on "public"."skills"
as permissive
for all
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Admins can access system alerts"
on "public"."system_alerts"
as permissive
for all
to public
using (is_admin());


create policy "Temporary admin access - system_alerts"
on "public"."system_alerts"
as permissive
for all
to authenticated
using (true);


create policy "Admins can access system logs"
on "public"."system_logs"
as permissive
for all
to public
using (is_admin());


create policy "Temporary admin access - system_logs"
on "public"."system_logs"
as permissive
for all
to authenticated
using (true);


create policy "Temporary admin access - transactions"
on "public"."transactions"
as permissive
for all
to authenticated
using (true);


create policy "Users can manage own email aliases"
on "public"."user_email_aliases"
as permissive
for all
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Admins can view all profiles"
on "public"."user_profiles"
as permissive
for all
to public
using (is_admin());


create policy "Temporary admin access - user_profiles"
on "public"."user_profiles"
as permissive
for all
to authenticated
using (true);


create policy "Users can view own profile"
on "public"."user_profiles"
as permissive
for select
to public
using ((auth.uid() = id));


CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON public.admin_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_settings_updated_at BEFORE UPDATE ON public.ai_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER application_status_notification AFTER INSERT OR UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION notify_application_status_change();

CREATE TRIGGER interview_reminder_notification AFTER UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION notify_interview_reminder();

CREATE TRIGGER update_auto_application_settings_updated_at BEFORE UPDATE ON public.auto_application_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auto_application_templates_updated_at BEFORE UPDATE ON public.auto_application_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cv_versions_updated_at BEFORE UPDATE ON public.cv_versions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER new_job_notification AFTER INSERT ON public.jobs FOR EACH ROW EXECUTE FUNCTION notify_new_job_match();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_email_aliases_updated_at BEFORE UPDATE ON public.user_email_aliases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


