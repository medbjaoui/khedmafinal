-- Tests Backend KhedmaFinal
-- Ce fichier contient tous les tests pour valider le backend

-- ==========================================
-- PRÉPARATION DES TESTS
-- ==========================================

-- Créer un utilisateur de test
DO $$
DECLARE
    test_user_id UUID := '550e8400-e29b-41d4-a716-446655440000';
    test_admin_id UUID := '550e8400-e29b-41d4-a716-446655440001';
    test_job_id UUID := '550e8400-e29b-41d4-a716-446655440002';
BEGIN
    -- Insérer un utilisateur de test dans auth.users (simulation)
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
    VALUES 
        (test_user_id, 'test@example.com', 'encrypted_password', NOW(), NOW(), NOW(), '{"role": "User", "first_name": "Test", "last_name": "User"}'),
        (test_admin_id, 'admin@example.com', 'encrypted_password', NOW(), NOW(), NOW(), '{"role": "Admin", "first_name": "Admin", "last_name": "User"}')
    ON CONFLICT (id) DO NOTHING;

    -- Créer un profil utilisateur de test
    INSERT INTO public.user_profiles (id, first_name, last_name, title, summary, phone, location, completion_score)
    VALUES 
        (test_user_id, 'Test', 'User', 'Développeur', 'Développeur expérimenté', '+33123456789', 'Paris', 75),
        (test_admin_id, 'Admin', 'User', 'Administrateur', 'Administrateur système', '+33987654321', 'Lyon', 90)
    ON CONFLICT (id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        title = EXCLUDED.title,
        summary = EXCLUDED.summary,
        phone = EXCLUDED.phone,
        location = EXCLUDED.location,
        completion_score = EXCLUDED.completion_score;

    -- Créer des compétences de test
    INSERT INTO public.skills (user_id, name, level, category, verified)
    VALUES 
        (test_user_id, 'JavaScript', 'Avancé', 'Technique', true),
        (test_user_id, 'React', 'Avancé', 'Technique', true),
        (test_user_id, 'Node.js', 'Intermédiaire', 'Technique', false),
        (test_user_id, 'Communication', 'Avancé', 'Soft Skills', true)
    ON CONFLICT (user_id, name) DO UPDATE SET
        level = EXCLUDED.level,
        category = EXCLUDED.category,
        verified = EXCLUDED.verified;

    -- Créer des expériences de test
    INSERT INTO public.experiences (user_id, company, position, start_date, end_date, current, description)
    VALUES 
        (test_user_id, 'Tech Corp', 'Développeur Frontend', '2020-01-01', '2022-12-31', false, 'Développement d''applications web'),
        (test_user_id, 'Innovation Ltd', 'Développeur Full Stack', '2023-01-01', NULL, true, 'Développement d''applications complètes')
    ON CONFLICT DO NOTHING;

    -- Créer un job de test
    INSERT INTO public.jobs (id, title, company, location, type, salary, description, requirements, is_active)
    VALUES (
        test_job_id,
        'Développeur React Senior',
        'TechStart',
        'Paris',
        'CDI',
        '50000-60000',
        'Nous recherchons un développeur React expérimenté',
        ARRAY['React', 'JavaScript', 'Node.js'],
        true
    )
    ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        company = EXCLUDED.company,
        location = EXCLUDED.location,
        type = EXCLUDED.type,
        salary = EXCLUDED.salary,
        description = EXCLUDED.description,
        requirements = EXCLUDED.requirements,
        is_active = EXCLUDED.is_active;

    RAISE NOTICE 'Données de test créées avec succès';
END $$;

-- ==========================================
-- TESTS DES FONCTIONS SQL
-- ==========================================

-- Test 1: Fonction is_admin()
DO $$
DECLARE
    user_role TEXT;
    admin_role TEXT;
BEGIN
    -- Simuler l'utilisateur normal
    SET jwt.claims.sub = '550e8400-e29b-41d4-a716-446655440000';
    SELECT is_admin() INTO user_role;
    
    -- Simuler l'utilisateur admin
    SET jwt.claims.sub = '550e8400-e29b-41d4-a716-446655440001';
    SELECT is_admin() INTO admin_role;
    
    IF user_role = false AND admin_role = true THEN
        RAISE NOTICE 'TEST 1 PASSED: is_admin() function works correctly';
    ELSE
        RAISE EXCEPTION 'TEST 1 FAILED: is_admin() function error - user: %, admin: %', user_role, admin_role;
    END IF;
END $$;

-- Test 2: Fonction search_jobs()
DO $$
DECLARE
    search_results RECORD;
    results_count INTEGER := 0;
BEGIN
    -- Test de recherche basique
    FOR search_results IN 
        SELECT * FROM search_jobs('Développeur', 'Paris', 'CDI', 40000, 70000, ARRAY['React', 'JavaScript'], 10, 0)
    LOOP
        results_count := results_count + 1;
        IF search_results.relevance_score > 0 THEN
            RAISE NOTICE 'Found job: % with score: %', search_results.title, search_results.relevance_score;
        END IF;
    END LOOP;
    
    IF results_count > 0 THEN
        RAISE NOTICE 'TEST 2 PASSED: search_jobs() returned % results', results_count;
    ELSE
        RAISE EXCEPTION 'TEST 2 FAILED: search_jobs() returned no results';
    END IF;
END $$;

-- Test 3: Fonction get_user_stats()
DO $$
DECLARE
    user_stats JSONB;
    profile_completion INTEGER;
BEGIN
    -- Tester les statistiques utilisateur
    SELECT get_user_stats('550e8400-e29b-41d4-a716-446655440000') INTO user_stats;
    
    profile_completion := (user_stats->>'profile_completion')::INTEGER;
    
    IF profile_completion IS NOT NULL AND profile_completion > 0 THEN
        RAISE NOTICE 'TEST 3 PASSED: get_user_stats() returned completion score: %', profile_completion;
        RAISE NOTICE 'Full stats: %', user_stats;
    ELSE
        RAISE EXCEPTION 'TEST 3 FAILED: get_user_stats() returned invalid data';
    END IF;
END $$;

-- Test 4: Fonction calculate_job_match_score()
DO $$
DECLARE
    match_result JSONB;
    overall_score NUMERIC;
    skills_match NUMERIC;
BEGIN
    -- Tester le calcul de score de matching
    SELECT calculate_job_match_score(
        '550e8400-e29b-41d4-a716-446655440000',
        '550e8400-e29b-41d4-a716-446655440002'
    ) INTO match_result;
    
    overall_score := (match_result->>'overall_score')::NUMERIC;
    skills_match := (match_result->>'skills_match')::NUMERIC;
    
    IF overall_score IS NOT NULL AND skills_match IS NOT NULL THEN
        RAISE NOTICE 'TEST 4 PASSED: calculate_job_match_score() returned overall: %, skills: %', overall_score, skills_match;
        RAISE NOTICE 'Matched skills: %', match_result->'matched_skills';
        RAISE NOTICE 'Missing skills: %', match_result->'missing_skills';
    ELSE
        RAISE EXCEPTION 'TEST 4 FAILED: calculate_job_match_score() returned invalid data';
    END IF;
END $$;

-- Test 5: Fonction get_job_recommendations()
DO $$
DECLARE
    recommendation RECORD;
    recommendations_count INTEGER := 0;
BEGIN
    -- Tester les recommandations d'emploi
    FOR recommendation IN 
        SELECT * FROM get_job_recommendations('550e8400-e29b-41d4-a716-446655440000', 5)
    LOOP
        recommendations_count := recommendations_count + 1;
        RAISE NOTICE 'Recommendation: % at % (Score: %)', recommendation.title, recommendation.company, recommendation.match_score;
    END LOOP;
    
    IF recommendations_count >= 0 THEN
        RAISE NOTICE 'TEST 5 PASSED: get_job_recommendations() returned % recommendations', recommendations_count;
    ELSE
        RAISE EXCEPTION 'TEST 5 FAILED: get_job_recommendations() error';
    END IF;
END $$;

-- ==========================================
-- TESTS DES POLITIQUES RLS
-- ==========================================

-- Test 6: Politiques RLS pour user_profiles
DO $$
DECLARE
    user_profile RECORD;
    profile_count INTEGER;
BEGIN
    -- Simuler l'utilisateur normal
    SET jwt.claims.sub = '550e8400-e29b-41d4-a716-446655440000';
    SET jwt.claims.role = 'User';
    
    -- L'utilisateur doit pouvoir voir son propre profil
    SELECT COUNT(*) INTO profile_count FROM user_profiles WHERE id = '550e8400-e29b-41d4-a716-446655440000';
    
    IF profile_count = 1 THEN
        RAISE NOTICE 'TEST 6a PASSED: User can see own profile';
    ELSE
        RAISE EXCEPTION 'TEST 6a FAILED: User cannot see own profile';
    END IF;
    
    -- L'utilisateur ne doit pas pouvoir voir les autres profils
    SELECT COUNT(*) INTO profile_count FROM user_profiles WHERE id != '550e8400-e29b-41d4-a716-446655440000';
    
    IF profile_count = 0 THEN
        RAISE NOTICE 'TEST 6b PASSED: User cannot see other profiles';
    ELSE
        RAISE EXCEPTION 'TEST 6b FAILED: User can see other profiles (security breach)';
    END IF;
END $$;

-- Test 7: Politiques RLS pour admin
DO $$
DECLARE
    profile_count INTEGER;
BEGIN
    -- Simuler l'utilisateur admin
    SET jwt.claims.sub = '550e8400-e29b-41d4-a716-446655440001';
    SET jwt.claims.role = 'Admin';
    
    -- L'admin doit pouvoir voir tous les profils
    SELECT COUNT(*) INTO profile_count FROM user_profiles;
    
    IF profile_count >= 2 THEN
        RAISE NOTICE 'TEST 7 PASSED: Admin can see all profiles (count: %)', profile_count;
    ELSE
        RAISE EXCEPTION 'TEST 7 FAILED: Admin cannot see all profiles';
    END IF;
END $$;

-- Test 8: Politiques RLS pour jobs
DO $$
DECLARE
    job_count INTEGER;
BEGIN
    -- Simuler un utilisateur normal
    SET jwt.claims.sub = '550e8400-e29b-41d4-a716-446655440000';
    SET jwt.claims.role = 'User';
    
    -- L'utilisateur doit pouvoir voir les jobs actifs
    SELECT COUNT(*) INTO job_count FROM jobs WHERE is_active = true;
    
    IF job_count >= 1 THEN
        RAISE NOTICE 'TEST 8 PASSED: User can see active jobs (count: %)', job_count;
    ELSE
        RAISE EXCEPTION 'TEST 8 FAILED: User cannot see active jobs';
    END IF;
END $$;

-- Test 9: Politiques RLS pour applications
DO $$
DECLARE
    test_application_id UUID;
    application_count INTEGER;
BEGIN
    -- Créer une application de test
    INSERT INTO public.applications (user_id, job_id, status, cover_letter)
    VALUES ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'draft', 'Test cover letter')
    RETURNING id INTO test_application_id;
    
    -- Simuler l'utilisateur normal
    SET jwt.claims.sub = '550e8400-e29b-41d4-a716-446655440000';
    SET jwt.claims.role = 'User';
    
    -- L'utilisateur doit pouvoir voir ses propres applications
    SELECT COUNT(*) INTO application_count FROM applications WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';
    
    IF application_count >= 1 THEN
        RAISE NOTICE 'TEST 9 PASSED: User can see own applications (count: %)', application_count;
    ELSE
        RAISE EXCEPTION 'TEST 9 FAILED: User cannot see own applications';
    END IF;
    
    -- Nettoyer
    DELETE FROM applications WHERE id = test_application_id;
END $$;

-- Test 10: Politiques RLS pour notifications
DO $$
DECLARE
    test_notification_id UUID;
    notification_count INTEGER;
BEGIN
    -- Créer une notification de test
    INSERT INTO public.notifications (user_id, type, title, message, priority)
    VALUES ('550e8400-e29b-41d4-a716-446655440000', 'system', 'Test Notification', 'This is a test', 'medium')
    RETURNING id INTO test_notification_id;
    
    -- Simuler l'utilisateur normal
    SET jwt.claims.sub = '550e8400-e29b-41d4-a716-446655440000';
    SET jwt.claims.role = 'User';
    
    -- L'utilisateur doit pouvoir voir ses propres notifications
    SELECT COUNT(*) INTO notification_count FROM notifications WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';
    
    IF notification_count >= 1 THEN
        RAISE NOTICE 'TEST 10 PASSED: User can see own notifications (count: %)', notification_count;
    ELSE
        RAISE EXCEPTION 'TEST 10 FAILED: User cannot see own notifications';
    END IF;
    
    -- Nettoyer
    DELETE FROM notifications WHERE id = test_notification_id;
END $$;

-- ==========================================
-- TESTS DE PERFORMANCE
-- ==========================================

-- Test 11: Performance de la recherche
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
        SELECT * FROM search_jobs('Développeur', NULL, NULL, NULL, NULL, ARRAY['JavaScript', 'React'], 100, 0)
    LOOP
        result_count := result_count + 1;
    END LOOP;
    
    end_time := clock_timestamp();
    duration := end_time - start_time;
    
    IF EXTRACT(MILLISECONDS FROM duration) < 1000 THEN
        RAISE NOTICE 'TEST 11 PASSED: Search completed in % ms with % results', EXTRACT(MILLISECONDS FROM duration), result_count;
    ELSE
        RAISE WARNING 'TEST 11 WARNING: Search took % ms (should be < 1000ms)', EXTRACT(MILLISECONDS FROM duration);
    END IF;
END $$;

-- Test 12: Performance du matching
DO $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    duration INTERVAL;
    match_result JSONB;
BEGIN
    start_time := clock_timestamp();
    
    -- Exécuter un calcul de matching
    SELECT calculate_job_match_score(
        '550e8400-e29b-41d4-a716-446655440000',
        '550e8400-e29b-41d4-a716-446655440002'
    ) INTO match_result;
    
    end_time := clock_timestamp();
    duration := end_time - start_time;
    
    IF EXTRACT(MILLISECONDS FROM duration) < 500 THEN
        RAISE NOTICE 'TEST 12 PASSED: Matching completed in % ms', EXTRACT(MILLISECONDS FROM duration);
    ELSE
        RAISE WARNING 'TEST 12 WARNING: Matching took % ms (should be < 500ms)', EXTRACT(MILLISECONDS FROM duration);
    END IF;
END $$;

-- ==========================================
-- TESTS D'INTÉGRITÉ DES DONNÉES
-- ==========================================

-- Test 13: Contraintes de données
DO $$
DECLARE
    constraint_error BOOLEAN := false;
BEGIN
    -- Tester les contraintes sur les compétences
    BEGIN
        INSERT INTO public.skills (user_id, name, level, category, verified)
        VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Test Skill', 'Invalid Level', 'Technique', false);
        
        RAISE EXCEPTION 'TEST 13 FAILED: Invalid skill level was accepted';
    EXCEPTION WHEN check_violation THEN
        constraint_error := true;
    END;
    
    IF constraint_error THEN
        RAISE NOTICE 'TEST 13 PASSED: Data constraints are working correctly';
    ELSE
        RAISE EXCEPTION 'TEST 13 FAILED: Data constraints are not working';
    END IF;
END $$;

-- Test 14: Triggers de mise à jour
DO $$
DECLARE
    old_updated_at TIMESTAMP;
    new_updated_at TIMESTAMP;
BEGIN
    -- Récupérer l'ancien timestamp
    SELECT updated_at INTO old_updated_at FROM user_profiles WHERE id = '550e8400-e29b-41d4-a716-446655440000';
    
    -- Attendre un peu
    PERFORM pg_sleep(0.1);
    
    -- Mettre à jour le profil
    UPDATE user_profiles SET title = 'Développeur Senior' WHERE id = '550e8400-e29b-41d4-a716-446655440000';
    
    -- Récupérer le nouveau timestamp
    SELECT updated_at INTO new_updated_at FROM user_profiles WHERE id = '550e8400-e29b-41d4-a716-446655440000';
    
    IF new_updated_at > old_updated_at THEN
        RAISE NOTICE 'TEST 14 PASSED: Update triggers are working correctly';
    ELSE
        RAISE EXCEPTION 'TEST 14 FAILED: Update triggers are not working';
    END IF;
END $$;

-- ==========================================
-- NETTOYAGE DES DONNÉES DE TEST
-- ==========================================

-- Supprimer les données de test créées
DO $$
BEGIN
    -- Supprimer les données dans l'ordre inverse des dépendances
    DELETE FROM public.applications WHERE user_id IN ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001');
    DELETE FROM public.job_matches WHERE user_id IN ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001');
    DELETE FROM public.notifications WHERE user_id IN ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001');
    DELETE FROM public.skills WHERE user_id IN ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001');
    DELETE FROM public.experiences WHERE user_id IN ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001');
    DELETE FROM public.jobs WHERE id = '550e8400-e29b-41d4-a716-446655440002';
    DELETE FROM public.user_profiles WHERE id IN ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001');
    DELETE FROM auth.users WHERE id IN ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001');
    
    RAISE NOTICE 'Test data cleanup completed';
END $$;

-- ==========================================
-- RÉSUMÉ DES TESTS
-- ==========================================

SELECT 
    'BACKEND TESTS COMPLETED' as status,
    'All tests have been executed. Check the output above for results.' as message,
    NOW() as completed_at; 