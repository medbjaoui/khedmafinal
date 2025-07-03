-- Seed file pour importer les utilisateurs de la base distante
-- Ce fichier sera exécuté automatiquement lors du reset de la base

-- Insérer les utilisateurs de test
INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'test@example.com', '$2a$06$DBVCrvgFzQQlGHwk0Lf43uXi1Rh2zg4rcLPkRDJu0CmOc0tuenfLC', '2025-06-29 10:31:48.931607+00', '2025-06-29 10:31:48.931607+00', '', '2025-06-29 10:31:48.931607+00', '', NULL, '', '', NULL, '2025-07-01 06:54:21.075065+00', '{"provider": "email", "providers": ["email"]}', '{"role": "Admin", "last_name": "User", "first_name": "Test"}', false, '2025-06-29 10:31:48.931607+00', '2025-07-01 06:54:21.079898+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'ahmed.benali@email.com', '$2a$06$yg6hzSAf0pJi/R2t0cSoq.YuxZUiSVeVY9fb2llS4q6yzRNYTBV/O', '2025-06-29 10:31:48.931607+00', '2025-06-29 10:31:48.931607+00', '', '2025-06-29 10:31:48.931607+00', '', NULL, '', '', NULL, '2025-06-29 11:19:52.384326+00', '{"provider": "email", "providers": ["email"]}', '{"role": "Premium", "last_name": "Ben Ali", "first_name": "Ahmed"}', false, '2025-06-29 10:31:48.931607+00', '2025-06-29 11:19:52.387104+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'fatma.trabelsi@email.com', '$2a$06$5Jp9GbN559oBv2CBp.G4xuGNn8cWGVKKcKC8LsG3KZoMk0Pel2Y3i', '2025-06-29 10:31:48.931607+00', '2025-06-29 10:31:48.931607+00', '', '2025-06-29 10:31:48.931607+00', '', NULL, '', '', NULL, '2025-07-01 06:39:03.13385+00', '{"provider": "email", "providers": ["email"]}', '{"role": "User", "last_name": "Trabelsi", "first_name": "Fatma"}', false, '2025-06-29 10:31:48.931607+00', '2025-07-01 06:39:03.136446+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'mohamed.gharbi@email.com', '$2a$06$Xq5YqShPAUzcUZiIbIHykejoZ5azOvu2baNOV0qC/tUbuYfdIPny.', '2025-06-29 10:31:48.931607+00', '2025-06-29 10:31:48.931607+00', '', '2025-06-29 10:31:48.931607+00', '', NULL, '', '', NULL, '2025-06-30 12:26:50.584294+00', '{"provider": "email", "providers": ["email"]}', '{"role": "User", "last_name": "Gharbi", "first_name": "Mohamed"}', false, '2025-06-29 10:31:48.931607+00', '2025-07-01 05:56:15.856208+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'leila.mansouri@email.com', '$2a$06$hlO4B5JoorJb0G7Wwfq0EecEQHEY9q1R7zy/LXglRGii.JRZigFMi', '2025-06-29 10:31:48.931607+00', '2025-06-29 10:31:48.931607+00', '', '2025-06-29 10:31:48.931607+00', '', NULL, '', '', NULL, '2025-06-29 10:31:48.931607+00', '{"provider": "email", "providers": ["email"]}', '{"role": "User", "last_name": "Mansouri", "first_name": "Leila"}', false, '2025-06-29 10:31:48.931607+00', '2025-06-29 10:31:48.931607+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '8e5852de-6e0e-45a9-8ff4-28d3f7c26b9d', 'authenticated', 'authenticated', 'bjaoui24@gmail.com', '$2a$10$N6xc0LA/FQY6H/qR0fdLzeNbCK7Ic63UarHDpwB6czioYJkCF.p4K', '2025-07-01 06:13:03.727348+00', NULL, '', '2025-07-01 06:11:47.358332+00', '', NULL, '', '', NULL, '2025-07-01 06:55:03.005427+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "8e5852de-6e0e-45a9-8ff4-28d3f7c26b9d", "role": "User", "email": "bjaoui24@gmail.com", "last_name": "bjaoui", "first_name": "med", "email_verified": true, "phone_verified": false}', NULL, '2025-07-01 06:11:47.336374+00', '2025-07-01 06:55:03.007298+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false)
ON CONFLICT (id) DO NOTHING;

-- Insérer les identités
INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('8e5852de-6e0e-45a9-8ff4-28d3f7c26b9d', '8e5852de-6e0e-45a9-8ff4-28d3f7c26b9d', '{"sub": "8e5852de-6e0e-45a9-8ff4-28d3f7c26b9d", "role": "User", "email": "bjaoui24@gmail.com", "last_name": "bjaoui", "first_name": "med", "email_verified": true, "phone_verified": false}', 'email', '2025-07-01 06:11:47.350221+00', '2025-07-01 06:11:47.350284+00', '2025-07-01 06:11:47.350284+00', '80451bc7-8246-4739-bed4-73673ef91dea')
ON CONFLICT (id) DO NOTHING;

-- Insérer les profils utilisateurs correspondants
INSERT INTO public.user_profiles (id, first_name, last_name)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'Test', 'User'),
    ('00000000-0000-0000-0000-000000000002', 'Ahmed', 'Ben Ali'),
    ('00000000-0000-0000-0000-000000000003', 'Fatma', 'Trabelsi'),
    ('00000000-0000-0000-0000-000000000004', 'Mohamed', 'Gharbi'),
    ('00000000-0000-0000-0000-000000000005', 'Leila', 'Mansouri'),
    ('8e5852de-6e0e-45a9-8ff4-28d3f7c26b9d', 'med', 'bjaoui')
ON CONFLICT (id) DO NOTHING;

-- Insérer quelques offres d'emploi de test
INSERT INTO public.jobs (id, title, company, location, type, description, is_active, source)
VALUES
    ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Développeur Frontend', 'Innovatech', 'Tunis, Tunisie', 'CDI', 'Nous recherchons un développeur Frontend expérimenté pour rejoindre notre équipe.', true, 'LinkedIn'),
    ('b2c3d4e5-f6a7-8901-2345-67890abcdef1', 'Ingénieur Backend', 'DataSolutions', 'Sfax, Tunisie', 'CDD', 'Responsable du développement et de la maintenance de notre infrastructure backend.', true, 'Khedma.tn'),
    ('c3d4e5f6-a7b8-9012-3456-7890abcdef22', 'UI/UX Designer', 'CreativeMinds', 'Sousse, Tunisie', 'Freelance', 'Créer des expériences utilisateur exceptionnelles pour nos applications web et mobiles.', false, 'Tanitjobs')
ON CONFLICT (id) DO NOTHING;

-- Insérer quelques candidatures de test
INSERT INTO public.applications (user_id, job_id, status, type)
VALUES
    ('00000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'sent', 'manual'),
    ('00000000-0000-0000-0000-000000000004', 'b2c3d4e5-f6a7-8901-2345-67890abcdef1', 'draft', 'manual')
ON CONFLICT (user_id, job_id) DO NOTHING;

-- Insérer quelques emplois sauvegardés de test
INSERT INTO public.saved_jobs (user_id, job_id)
VALUES
    ('00000000-0000-0000-0000-000000000003', 'b2c3d4e5-f6a7-8901-2345-67890abcdef1')
ON CONFLICT (user_id, job_id) DO NOTHING;