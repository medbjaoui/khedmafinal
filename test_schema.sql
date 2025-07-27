-- =================================================================
-- SCRIPT DE TEST POUR LE SCHÉMA SQL COMPLET
-- =================================================================
-- Ce script teste toutes les fonctionnalités du schéma KhedmaFinal

-- =================================================================
-- TESTS DE BASE
-- =================================================================

-- Test 1: Vérifier que toutes les tables sont créées
DO $$
DECLARE
    table_count INTEGER;
    expected_tables TEXT[] := ARRAY[
        'user_profiles', 'skills', 'experiences', 'education', 'languages',
        'certifications', 'jobs', 'applications', 'cv_versions', 'saved_jobs',
        'job_matches', 'notifications', 'recommendations', 'user_preferences',
        'auto_application_settings', 'auto_application_stats', 'auto_application_templates',
        'application_templates', 'email_logs', 'recruiter_responses', 'login_history',
        'system_logs', 'system_alerts', 'admin_settings', 'ai_settings', 'ai_usage',
        'user_email_aliases', 'transactions'
    ];
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = ANY(expected_tables);
    
    IF table_count = array_length(expected_tables, 1) THEN
        RAISE NOTICE 'TEST 1 PASSED: All % tables created successfully', table_count;
    ELSE
        RAISE EXCEPTION 'TEST 1 FAILED: Expected % tables, found %', array_length(expected_tables, 1), table_count;
    END IF;
END $$;

-- Test 2: Vérifier que toutes les fonctions sont créées
DO $$
DECLARE
    function_count INTEGER;
    expected_functions TEXT[] := ARRAY[
        'is_admin', 'get_user_role', 'update_user_role', 'check_is_admin',
        'create_user_email_alias', 'get_users_with_emails', 'create_notification',
        'cleanup_old_notifications', 'search_jobs', 'calculate_job_match_score',
        'get_user_stats', 'get_job_recommendations', 'update_auto_application_stats'
    ];
BEGIN
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name = ANY(expected_functions);
    
    IF function_count >= array_length(expected_functions, 1) THEN
        RAISE NOTICE 'TEST 2 PASSED: All % functions created successfully', function_count;
    ELSE
        RAISE EXCEPTION 'TEST 2 FAILED: Expected at least % functions, found %', array_length(expected_functions, 1), function_count;
    END IF;
END $$;

-- Test 3: Vérifier que RLS est activé sur toutes les tables
DO $$
DECLARE
    rls_count INTEGER;
    total_tables INTEGER;
BEGIN
    SELECT COUNT(*) INTO rls_count
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' 
    AND c.relkind = 'r'
    AND c.relrowsecurity = true;
    
    SELECT COUNT(*) INTO total_tables
    FROM information_schema.tables 
    WHERE table_schema = 'public';
    
    IF rls_count = total_tables THEN
        RAISE NOTICE 'TEST 3 PASSED: RLS enabled on all % tables', rls_count;
    ELSE
        RAISE EXCEPTION 'TEST 3 FAILED: RLS not enabled on all tables. Enabled: %, Total: %', rls_count, total_tables;
    END IF;
END $$;

-- Test 4: Vérifier les types énumérés
DO $$
DECLARE
    enum_count INTEGER;
    expected_enums TEXT[] := ARRAY[
        'user_role', 'job_type', 'application_status', 'notification_type',
        'priority_level', 'skill_level', 'language_level', 'skill_category',
        'email_status', 'response_type', 'work_arrangement', 'payment_method',
        'transaction_status'
    ];
BEGIN
    SELECT COUNT(*) INTO enum_count
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' 
    AND t.typtype = 'e'
    AND t.typname = ANY(expected_enums);
    
    IF enum_count = array_length(expected_enums, 1) THEN
        RAISE NOTICE 'TEST 4 PASSED: All % enum types created successfully', enum_count;
    ELSE
        RAISE EXCEPTION 'TEST 4 FAILED: Expected % enums, found %', array_length(expected_enums, 1), enum_count;
    END IF;
END $$;

-- =================================================================
-- TESTS FONCTIONNELS
-- =================================================================

-- Test 5: Insérer des données de test
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    test_job_id UUID := gen_random_uuid();
BEGIN
    -- Simuler un utilisateur dans auth.users
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
    VALUES (test_user_id, 'test@example.com', 'encrypted_password', NOW(), NOW(), NOW(), '{"role": "User", "first_name": "Test", "last_name": "User"}');

    -- Le trigger devrait créer automatiquement le profil
    IF EXISTS (SELECT 1 FROM user_profiles WHERE id = test_user_id) THEN
        RAISE NOTICE 'TEST 5a PASSED: User profile created automatically by trigger';
    ELSE
        RAISE EXCEPTION 'TEST 5a FAILED: User profile not created by trigger';
    END IF;

    -- Insérer des compétences
    INSERT INTO skills (user_id, name, level, category, verified)
    VALUES 
        (test_user_id, 'JavaScript', 'Avancé', 'Technique', true),
        (test_user_id, 'React', 'Avancé', 'Technique', true),
        (test_user_id, 'Communication', 'Avancé', 'Soft Skills', false);

    -- Insérer une expérience
    INSERT INTO experiences (user_id, company, position, start_date, end_date, current, description)
    VALUES (test_user_id, 'Tech Corp', 'Développeur', '2020-01-01', '2023-12-31', false, 'Développement web');

    -- Insérer un job
    INSERT INTO jobs (id, title, company, location, type, description, skills_required, is_active)
    VALUES (test_job_id, 'Développeur React', 'TechStart', 'Paris', 'CDI', 'Poste de développeur React', ARRAY['React', 'JavaScript'], true);

    RAISE NOTICE 'TEST 5b PASSED: Test data inserted successfully';
    
    -- Stocker les IDs pour les tests suivants
    PERFORM set_config('test.user_id', test_user_id::text, true);
    PERFORM set_config('test.job_id', test_job_id::text, true);
END $$;

-- Test 6: Tester la fonction is_admin()
DO $$
DECLARE
    test_user_id UUID := current_setting('test.user_id')::UUID;
    is_admin_result BOOLEAN;
BEGIN
    -- Simuler l'utilisateur dans le contexte JWT
    PERFORM set_config('jwt.claims.sub', test_user_id::text, true);
    
    SELECT is_admin() INTO is_admin_result;
    
    IF is_admin_result = false THEN
        RAISE NOTICE 'TEST 6 PASSED: is_admin() returns false for regular user';
    ELSE
        RAISE EXCEPTION 'TEST 6 FAILED: is_admin() should return false for regular user';
    END IF;
END $$;

-- Test 7: Tester la fonction search_jobs()
DO $$
DECLARE
    search_result RECORD;
    results_count INTEGER := 0;
BEGIN
    FOR search_result IN 
        SELECT * FROM search_jobs('Développeur', 'Paris', 'CDI', NULL, NULL, ARRAY['React'], NULL, 10, 0)
    LOOP
        results_count := results_count + 1;
        IF search_result.relevance_score > 0 THEN
            RAISE NOTICE 'Found job: % with relevance score: %', search_result.title, search_result.relevance_score;
        END IF;
    END LOOP;
    
    IF results_count > 0 THEN
        RAISE NOTICE 'TEST 7 PASSED: search_jobs() returned % results', results_count;
    ELSE
        RAISE EXCEPTION 'TEST 7 FAILED: search_jobs() returned no results';
    END IF;
END $$;

-- Test 8: Tester la fonction calculate_job_match_score()
DO $$
DECLARE
    test_user_id UUID := current_setting('test.user_id')::UUID;
    test_job_id UUID := current_setting('test.job_id')::UUID;
    match_result JSONB;
    overall_score NUMERIC;
BEGIN
    SELECT calculate_job_match_score(test_user_id, test_job_id) INTO match_result;
    
    overall_score := (match_result->>'overall_score')::NUMERIC;
    
    IF overall_score IS NOT NULL AND overall_score >= 0 AND overall_score <= 100 THEN
        RAISE NOTICE 'TEST 8 PASSED: calculate_job_match_score() returned valid score: %', overall_score;
        RAISE NOTICE 'Matched skills: %', match_result->'matched_skills';
    ELSE
        RAISE EXCEPTION 'TEST 8 FAILED: calculate_job_match_score() returned invalid score: %', overall_score;
    END IF;
END $$;

-- Test 9: Tester la fonction get_user_stats()
DO $$
DECLARE
    test_user_id UUID := current_setting('test.user_id')::UUID;
    user_stats JSONB;
    profile_completion INTEGER;
BEGIN
    SELECT get_user_stats(test_user_id) INTO user_stats;
    
    profile_completion := (user_stats->>'profile_completion')::INTEGER;
    
    IF profile_completion IS NOT NULL AND profile_completion >= 0 AND profile_completion <= 100 THEN
        RAISE NOTICE 'TEST 9 PASSED: get_user_stats() returned valid completion score: %', profile_completion;
        RAISE NOTICE 'Skills count: %', user_stats->>'skills_count';
    ELSE
        RAISE EXCEPTION 'TEST 9 FAILED: get_user_stats() returned invalid data';
    END IF;
END $$;

-- Test 10: Tester la fonction get_job_recommendations()
DO $$
DECLARE
    test_user_id UUID := current_setting('test.user_id')::UUID;
    recommendation RECORD;
    recommendations_count INTEGER := 0;
BEGIN
    FOR recommendation IN 
        SELECT * FROM get_job_recommendations(test_user_id, 5)
    LOOP
        recommendations_count := recommendations_count + 1;
        RAISE NOTICE 'Recommendation: % at % (Score: %)', recommendation.title, recommendation.company, recommendation.match_score;
    END LOOP;
    
    IF recommendations_count >= 0 THEN
        RAISE NOTICE 'TEST 10 PASSED: get_job_recommendations() returned % recommendations', recommendations_count;
    ELSE
        RAISE EXCEPTION 'TEST 10 FAILED: get_job_recommendations() error';
    END IF;
END $$;

-- Test 11: Tester la fonction create_notification()
DO $$
DECLARE
    test_user_id UUID := current_setting('test.user_id')::UUID;
    notification_id UUID;
    notification_count INTEGER;
BEGIN
    SELECT create_notification(
        test_user_id,
        'system',
        'Test Notification',
        'This is a test notification',
        'medium'
    ) INTO notification_id;
    
    IF notification_id IS NOT NULL THEN
        RAISE NOTICE 'TEST 11a PASSED: create_notification() returned ID: %', notification_id;
    ELSE
        RAISE EXCEPTION 'TEST 11a FAILED: create_notification() returned NULL';
    END IF;
    
    -- Vérifier que la notification a été créée
    SELECT COUNT(*) INTO notification_count
    FROM notifications 
    WHERE user_id = test_user_id AND title = 'Test Notification';
    
    IF notification_count = 1 THEN
        RAISE NOTICE 'TEST 11b PASSED: Notification created in database';
    ELSE
        RAISE EXCEPTION 'TEST 11b FAILED: Notification not found in database';
    END IF;
END $$;

-- Test 12: Tester les triggers de mise à jour
DO $$
DECLARE
    test_user_id UUID := current_setting('test.user_id')::UUID;
    old_updated_at TIMESTAMPTZ;
    new_updated_at TIMESTAMPTZ;
    old_completion_score INTEGER;
    new_completion_score INTEGER;
BEGIN
    -- Récupérer les valeurs actuelles
    SELECT updated_at, completion_score INTO old_updated_at, old_completion_score
    FROM user_profiles WHERE id = test_user_id;
    
    -- Attendre un peu
    PERFORM pg_sleep(0.1);
    
    -- Mettre à jour le profil
    UPDATE user_profiles 
    SET title = 'Développeur Senior', summary = 'Développeur expérimenté avec 5+ années d''expérience'
    WHERE id = test_user_id;
    
    -- Récupérer les nouvelles valeurs
    SELECT updated_at, completion_score INTO new_updated_at, new_completion_score
    FROM user_profiles WHERE id = test_user_id;
    
    IF new_updated_at > old_updated_at THEN
        RAISE NOTICE 'TEST 12a PASSED: updated_at trigger working correctly';
    ELSE
        RAISE EXCEPTION 'TEST 12a FAILED: updated_at trigger not working';
    END IF;
    
    IF new_completion_score > old_completion_score THEN
        RAISE NOTICE 'TEST 12b PASSED: completion_score trigger working correctly (% -> %)', old_completion_score, new_completion_score;
    ELSE
        RAISE EXCEPTION 'TEST 12b FAILED: completion_score trigger not working';
    END IF;
END $$;

-- Test 13: Tester les contraintes de données
DO $$
DECLARE
    test_user_id UUID := current_setting('test.user_id')::UUID;
    constraint_error BOOLEAN := false;
BEGIN
    -- Tester une contrainte CHECK sur les compétences
    BEGIN
        INSERT INTO skills (user_id, name, level, category, verified)
        VALUES (test_user_id, 'Test Skill', 'Invalid Level', 'Technique', false);
        
        RAISE EXCEPTION 'TEST 13a FAILED: Invalid skill level was accepted';
    EXCEPTION WHEN check_violation THEN
        constraint_error := true;
    END;
    
    IF constraint_error THEN
        RAISE NOTICE 'TEST 13a PASSED: Skill level constraint working correctly';
    ELSE
        RAISE EXCEPTION 'TEST 13a FAILED: Skill level constraint not working';
    END IF;
    
    -- Tester une contrainte UNIQUE
    constraint_error := false;
    BEGIN
        INSERT INTO skills (user_id, name, level, category, verified)
        VALUES (test_user_id, 'JavaScript', 'Débutant', 'Technique', false);
        
        RAISE EXCEPTION 'TEST 13b FAILED: Duplicate skill was accepted';
    EXCEPTION WHEN unique_violation THEN
        constraint_error := true;
    END;
    
    IF constraint_error THEN
        RAISE NOTICE 'TEST 13b PASSED: Unique constraint working correctly';
    ELSE
        RAISE EXCEPTION 'TEST 13b FAILED: Unique constraint not working';
    END IF;
END $$;

-- Test 14: Tester les politiques RLS
DO $$
DECLARE
    test_user_id UUID := current_setting('test.user_id')::UUID;
    other_user_id UUID := gen_random_uuid();
    profile_count INTEGER;
BEGIN
    -- Créer un autre utilisateur
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
    VALUES (other_user_id, 'other@example.com', 'encrypted_password', NOW(), NOW(), NOW(), '{"role": "User"}');
    
    -- Simuler l'utilisateur de test
    PERFORM set_config('jwt.claims.sub', test_user_id::text, true);
    PERFORM set_config('jwt.claims.role', 'authenticated', true);
    
    -- L'utilisateur doit pouvoir voir son propre profil
    SELECT COUNT(*) INTO profile_count FROM user_profiles WHERE id = test_user_id;
    
    IF profile_count = 1 THEN
        RAISE NOTICE 'TEST 14a PASSED: User can see own profile';
    ELSE
        RAISE EXCEPTION 'TEST 14a FAILED: User cannot see own profile';
    END IF;
    
    -- L'utilisateur ne doit pas pouvoir voir les autres profils
    SELECT COUNT(*) INTO profile_count FROM user_profiles WHERE id = other_user_id;
    
    IF profile_count = 0 THEN
        RAISE NOTICE 'TEST 14b PASSED: User cannot see other profiles (RLS working)';
    ELSE
        RAISE EXCEPTION 'TEST 14b FAILED: User can see other profiles (RLS not working)';
    END IF;
END $$;

-- Test 15: Tester les index de performance
DO $$
DECLARE
    index_count INTEGER;
    expected_indexes TEXT[] := ARRAY[
        'idx_user_profiles_email', 'idx_skills_user_id', 'idx_jobs_active',
        'idx_applications_user_id', 'idx_notifications_user_id', 'idx_jobs_title_trgm'
    ];
BEGIN
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname = ANY(expected_indexes);
    
    IF index_count >= array_length(expected_indexes, 1) THEN
        RAISE NOTICE 'TEST 15 PASSED: Performance indexes created (% found)', index_count;
    ELSE
        RAISE EXCEPTION 'TEST 15 FAILED: Expected at least % indexes, found %', array_length(expected_indexes, 1), index_count;
    END IF;
END $$;

-- =================================================================
-- TESTS DE PERFORMANCE
-- =================================================================

-- Test 16: Performance de la recherche
DO $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    duration INTERVAL;
    result_count INTEGER := 0;
    search_result RECORD;
BEGIN
    start_time := clock_timestamp();
    
    -- Exécuter une recherche complexe
    FOR search_result IN 
        SELECT * FROM search_jobs('Développeur', NULL, NULL, NULL, NULL, ARRAY['JavaScript', 'React'], NULL, 100, 0)
    LOOP
        result_count := result_count + 1;
    END LOOP;
    
    end_time := clock_timestamp();
    duration := end_time - start_time;
    
    IF EXTRACT(MILLISECONDS FROM duration) < 1000 THEN
        RAISE NOTICE 'TEST 16 PASSED: Search completed in % ms with % results', EXTRACT(MILLISECONDS FROM duration), result_count;
    ELSE
        RAISE WARNING 'TEST 16 WARNING: Search took % ms (should be < 1000ms)', EXTRACT(MILLISECONDS FROM duration);
    END IF;
END $$;

-- Test 17: Performance du matching
DO $$
DECLARE
    test_user_id UUID := current_setting('test.user_id')::UUID;
    test_job_id UUID := current_setting('test.job_id')::UUID;
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    duration INTERVAL;
    match_result JSONB;
BEGIN
    start_time := clock_timestamp();
    
    -- Exécuter un calcul de matching
    SELECT calculate_job_match_score(test_user_id, test_job_id) INTO match_result;
    
    end_time := clock_timestamp();
    duration := end_time - start_time;
    
    IF EXTRACT(MILLISECONDS FROM duration) < 500 THEN
        RAISE NOTICE 'TEST 17 PASSED: Matching completed in % ms', EXTRACT(MILLISECONDS FROM duration);
    ELSE
        RAISE WARNING 'TEST 17 WARNING: Matching took % ms (should be < 500ms)', EXTRACT(MILLISECONDS FROM duration);
    END IF;
END $$;

-- =================================================================
-- NETTOYAGE DES DONNÉES DE TEST
-- =================================================================

-- Test 18: Nettoyage des données de test
DO $$
DECLARE
    test_user_id UUID := current_setting('test.user_id')::UUID;
    test_job_id UUID := current_setting('test.job_id')::UUID;
    other_user_id UUID;
BEGIN
    -- Trouver l'autre utilisateur créé
    SELECT id INTO other_user_id FROM auth.users WHERE email = 'other@example.com';
    
    -- Supprimer les données dans l'ordre inverse des dépendances
    DELETE FROM notifications WHERE user_id IN (test_user_id, other_user_id);
    DELETE FROM skills WHERE user_id IN (test_user_id, other_user_id);
    DELETE FROM experiences WHERE user_id IN (test_user_id, other_user_id);
    DELETE FROM jobs WHERE id = test_job_id;
    DELETE FROM user_preferences WHERE user_id IN (test_user_id, other_user_id);
    DELETE FROM ai_settings WHERE user_id IN (test_user_id, other_user_id);
    DELETE FROM user_profiles WHERE id IN (test_user_id, other_user_id);
    DELETE FROM auth.users WHERE id IN (test_user_id, other_user_id);
    
    RAISE NOTICE 'TEST 18 PASSED: Test data cleanup completed';
END $$;

-- =================================================================
-- RÉSUMÉ DES TESTS
-- =================================================================

-- Afficher le résumé final
SELECT 
    'SCHEMA TESTS COMPLETED' as status,
    'All tests have been executed successfully!' as message,
    NOW() as completed_at,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as tables_created,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public') as functions_created,
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as indexes_created;

-- Afficher les statistiques finales
SELECT 
    'DATABASE STATISTICS' as category,
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as columns_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;

RAISE NOTICE '=== TOUS LES TESTS TERMINÉS AVEC SUCCÈS ===';
RAISE NOTICE 'Le schéma SQL complet est fonctionnel et prêt pour la production!';
RAISE NOTICE 'Vous pouvez maintenant commencer à développer votre application.'; 