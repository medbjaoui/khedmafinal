# Plan de Finalisation du Backend - KhedmaFinal

## 🔍 État Actuel du Backend

### ✅ Déjà Implémenté
- **Tables principales** : 24 tables complètes avec contraintes
- **Fonctions SQL** : 12 fonctions utilitaires
- **Politiques RLS** : Partiellement implémentées
- **Edge Functions** : 2 fonctions (send-application-email, sign-in-with-log)
- **Triggers** : 9 triggers pour notifications et mises à jour

### ❌ Manquant ou à Corriger
- **Politiques RLS sécurisées** : Remplacer les politiques temporaires
- **Edge Functions manquantes** : CV analysis, job matching, notifications
- **Fonctions SQL manquantes** : Recherche, statistiques, analytics
- **Tests backend** : Aucun test automatisé
- **Monitoring** : Logs et métriques système

## 🎯 Plan d'Action (4 Phases)

### Phase 1 : Sécurité et Politiques RLS (Priorité CRITIQUE)
```sql
-- 1.1 Supprimer les politiques temporaires dangereuses
DROP POLICY IF EXISTS "Temporary admin access - admin_settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Temporary admin access - jobs" ON public.jobs;
DROP POLICY IF EXISTS "Temporary admin access - system_alerts" ON public.system_alerts;
DROP POLICY IF EXISTS "Temporary admin access - system_logs" ON public.system_logs;
DROP POLICY IF EXISTS "Temporary admin access - transactions" ON public.transactions;
DROP POLICY IF EXISTS "Temporary admin access - user_profiles" ON public.user_profiles;

-- 1.2 Créer des politiques sécurisées
CREATE POLICY "Users can read own profile" ON public.user_profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON public.user_profiles
FOR ALL USING (is_admin());
```

### Phase 2 : Fonctions SQL Avancées
```sql
-- 2.1 Fonction de recherche d'emplois
CREATE OR REPLACE FUNCTION search_jobs(
  search_query text DEFAULT NULL,
  job_location text DEFAULT NULL,
  job_type text DEFAULT NULL,
  salary_min integer DEFAULT NULL,
  salary_max integer DEFAULT NULL,
  skills_required text[] DEFAULT NULL,
  limit_results integer DEFAULT 20,
  offset_results integer DEFAULT 0
) RETURNS TABLE(
  id uuid,
  title text,
  company text,
  location text,
  type text,
  salary text,
  description text,
  requirements text[],
  posted_date timestamptz,
  relevance_score numeric
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.id,
    j.title,
    j.company,
    j.location,
    j.type,
    j.salary,
    j.description,
    j.requirements,
    j.posted_date,
    -- Score de pertinence basé sur les critères
    (
      CASE WHEN search_query IS NULL THEN 0
           WHEN j.title ILIKE '%' || search_query || '%' THEN 10
           WHEN j.description ILIKE '%' || search_query || '%' THEN 5
           ELSE 0 END +
      CASE WHEN job_location IS NULL THEN 0
           WHEN j.location ILIKE '%' || job_location || '%' THEN 8
           ELSE 0 END +
      CASE WHEN skills_required IS NULL THEN 0
           WHEN j.requirements && skills_required THEN 15
           ELSE 0 END
    )::numeric as relevance_score
  FROM jobs j
  WHERE j.is_active = true
    AND (search_query IS NULL OR 
         j.title ILIKE '%' || search_query || '%' OR 
         j.description ILIKE '%' || search_query || '%')
    AND (job_location IS NULL OR j.location ILIKE '%' || job_location || '%')
    AND (job_type IS NULL OR j.type = job_type)
    AND (salary_min IS NULL OR CAST(REGEXP_REPLACE(j.salary, '[^0-9]', '', 'g') AS INTEGER) >= salary_min)
    AND (salary_max IS NULL OR CAST(REGEXP_REPLACE(j.salary, '[^0-9]', '', 'g') AS INTEGER) <= salary_max)
    AND (skills_required IS NULL OR j.requirements && skills_required)
  ORDER BY relevance_score DESC, j.posted_date DESC
  LIMIT limit_results OFFSET offset_results;
END;
$$;

-- 2.2 Fonction de statistiques utilisateur
CREATE OR REPLACE FUNCTION get_user_stats(target_user_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  result jsonb;
BEGIN
  -- Vérifier que l'utilisateur peut accéder à ces stats
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
    'last_activity', COALESCE(up.updated_at, up.created_at)
  ) INTO result
  FROM user_profiles up
  LEFT JOIN (
    SELECT 
      user_id,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'sent') as sent,
      COUNT(*) FILTER (WHERE status = 'draft') as pending,
      COUNT(*) FILTER (WHERE status = 'interview') as interviews,
      CASE 
        WHEN COUNT(*) FILTER (WHERE status = 'sent') > 0 
        THEN (COUNT(*) FILTER (WHERE response IS NOT NULL)::numeric / COUNT(*) FILTER (WHERE status = 'sent')) * 100
        ELSE 0 
      END as response_rate
    FROM applications 
    WHERE user_id = target_user_id
    GROUP BY user_id
  ) app_stats ON up.id = app_stats.user_id
  LEFT JOIN (
    SELECT user_id, COUNT(*) as total
    FROM saved_jobs 
    WHERE user_id = target_user_id
    GROUP BY user_id
  ) saved_stats ON up.id = saved_stats.user_id
  LEFT JOIN (
    SELECT user_id, COUNT(*) as total
    FROM cv_versions 
    WHERE user_id = target_user_id
    GROUP BY user_id
  ) cv_stats ON up.id = cv_stats.user_id
  WHERE up.id = target_user_id;

  RETURN result;
END;
$$;

-- 2.3 Fonction de matching intelligent
CREATE OR REPLACE FUNCTION calculate_job_match_score(
  target_user_id uuid,
  target_job_id uuid
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  user_skills text[];
  job_requirements text[];
  location_match boolean;
  skill_match_score numeric;
  result jsonb;
BEGIN
  -- Récupérer les compétences utilisateur
  SELECT array_agg(name) INTO user_skills
  FROM skills WHERE user_id = target_user_id;

  -- Récupérer les exigences du poste
  SELECT requirements INTO job_requirements
  FROM jobs WHERE id = target_job_id;

  -- Calculer le score de correspondance des compétences
  SELECT 
    CASE 
      WHEN array_length(job_requirements, 1) IS NULL THEN 50
      ELSE (
        (array_length(user_skills & job_requirements, 1)::numeric / 
         array_length(job_requirements, 1)) * 100
      )
    END INTO skill_match_score;

  -- Vérifier la correspondance géographique
  SELECT EXISTS(
    SELECT 1 FROM user_profiles up, jobs j
    WHERE up.id = target_user_id AND j.id = target_job_id
    AND (up.location ILIKE '%' || j.location || '%' OR j.location ILIKE '%' || up.location || '%')
  ) INTO location_match;

  -- Construire le résultat
  SELECT jsonb_build_object(
    'overall_score', COALESCE(skill_match_score, 0),
    'skills_match', COALESCE(skill_match_score, 0),
    'location_match', location_match,
    'matched_skills', COALESCE(user_skills & job_requirements, '{}'),
    'missing_skills', COALESCE(job_requirements - user_skills, '{}'),
    'calculated_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$;
```

### Phase 3 : Edge Functions Complètes
```typescript
// 3.1 CV Analysis Edge Function
// supabase/functions/cv-analysis/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, fileUrl, analysisType = 'complete' } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Appeler l'agent d'analyse CV
    const agentResponse = await fetch(`${Deno.env.get('CV_ANALYZER_AGENT_URL')}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskType: 'analyze_cv',
        inputData: {
          userId,
          fileUrl,
          analysisType
        }
      })
    });

    const analysisResult = await agentResponse.json();

    // Sauvegarder les résultats dans la base
    const { error: saveError } = await supabase
      .from('cv_versions')
      .update({
        analysis_data: analysisResult,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (saveError) throw saveError;

    // Créer des recommandations basées sur l'analyse
    if (analysisResult.recommendations) {
      for (const rec of analysisResult.recommendations) {
        await supabase.from('recommendations').insert({
          user_id: userId,
          type: rec.type,
          priority: rec.priority,
          title: rec.title,
          description: rec.description,
          action: rec.action || 'review',
          category: rec.category || 'general'
        });
      }
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

// 3.2 Job Matching Edge Function
// supabase/functions/job-matching/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, jobId } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer les données utilisateur et job
    const [userProfile, jobDetails] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('id', userId).single(),
      supabase.from('jobs').select('*').eq('id', jobId).single()
    ]);

    if (userProfile.error || jobDetails.error) {
      throw new Error('User or job not found');
    }

    // Appeler l'agent de matching
    const matchingResponse = await fetch(`${Deno.env.get('MATCHING_AGENT_URL')}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskType: 'perform_matching',
        inputData: {
          candidateProfile: userProfile.data,
          jobOffer: jobDetails.data
        }
      })
    });

    const matchingResult = await matchingResponse.json();

    // Sauvegarder le résultat du matching
    const { error: saveError } = await supabase
      .from('job_matches')
      .insert({
        user_id: userId,
        job_id: jobId,
        overall_score: matchingResult.overallScore,
        detailed_scores: matchingResult.detailedScores,
        explanation: matchingResult.explanation,
        strengths: matchingResult.strengths,
        weaknesses: matchingResult.weaknesses,
        recommendations: matchingResult.recommendations
      });

    if (saveError) throw saveError;

    return new Response(JSON.stringify(matchingResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

// 3.3 Notifications Edge Function
// supabase/functions/notifications/index.ts
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, type, title, message, priority = 'medium' } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Créer la notification
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        priority
      })
      .select()
      .single();

    if (error) throw error;

    // Envoyer notification push si activée
    const { data: preferences } = await supabase
      .from('auto_application_settings')
      .select('notification_preferences')
      .eq('user_id', userId)
      .single();

    if (preferences?.notification_preferences?.push) {
      // Logique d'envoi de notification push
      await sendPushNotification(userId, { title, message });
    }

    return new Response(JSON.stringify(notification), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
```

### Phase 4 : Tests et Validation
```sql
-- 4.1 Tests des fonctions SQL
-- Test de la fonction de recherche
SELECT * FROM search_jobs('développeur', 'Paris', 'CDI', 35000, 50000, ARRAY['JavaScript', 'React']);

-- Test des statistiques utilisateur
SELECT get_user_stats('550e8400-e29b-41d4-a716-446655440000');

-- Test du matching
SELECT calculate_job_match_score(
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440001'
);

-- 4.2 Tests des politiques RLS
-- Test accès utilisateur normal
SET role postgres;
SET jwt.claims.sub = '550e8400-e29b-41d4-a716-446655440000';
SELECT * FROM user_profiles WHERE id = '550e8400-e29b-41d4-a716-446655440000'; -- Doit fonctionner
SELECT * FROM user_profiles WHERE id != '550e8400-e29b-41d4-a716-446655440000'; -- Doit échouer

-- Test accès admin
SET jwt.claims.sub = '550e8400-e29b-41d4-a716-446655440001';
SET jwt.claims.role = 'Admin';
SELECT * FROM user_profiles; -- Doit fonctionner pour admin
```

## 📋 Checklist de Finalisation

### Sécurité ✅
- [ ] Supprimer toutes les politiques temporaires
- [ ] Implémenter RLS pour toutes les tables
- [ ] Tester les permissions utilisateur/admin
- [ ] Valider les contraintes de données

### Fonctionnalités ✅
- [ ] Fonction de recherche avancée
- [ ] Statistiques utilisateur
- [ ] Matching intelligent
- [ ] Système de notifications
- [ ] Gestion des versions CV

### Edge Functions ✅
- [ ] CV Analysis Function
- [ ] Job Matching Function
- [ ] Notifications Function
- [ ] Email Service Function
- [ ] Admin Analytics Function

### Tests ✅
- [ ] Tests unitaires SQL
- [ ] Tests d'intégration
- [ ] Tests de performance
- [ ] Tests de sécurité
- [ ] Tests de charge

### Monitoring ✅
- [ ] Logs système
- [ ] Métriques performance
- [ ] Alertes automatiques
- [ ] Backup automatique
- [ ] Health checks

## 🚀 Déploiement

### Environnement de Test
```bash
# 1. Appliquer les migrations
supabase migration up

# 2. Déployer les Edge Functions
supabase functions deploy cv-analysis
supabase functions deploy job-matching
supabase functions deploy notifications

# 3. Exécuter les tests
supabase test db
```

### Environnement de Production
```bash
# 1. Backup de la base existante
supabase db dump --file backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Déploiement progressif
supabase migration up --environment production
supabase functions deploy --environment production

# 3. Validation post-déploiement
curl -X POST "${SUPABASE_URL}/functions/v1/cv-analysis" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user", "fileUrl": "test-cv.pdf"}'
```

## 📊 Métriques de Succès

### Performance
- **Temps de réponse API** : < 500ms
- **Analyse CV** : < 30 secondes
- **Matching emploi** : < 5 secondes
- **Recherche** : < 200ms

### Fiabilité
- **Uptime** : > 99.9%
- **Erreur rate** : < 0.1%
- **Backup réussi** : 100%
- **Tests passés** : 100%

### Sécurité
- **Politiques RLS** : 100% des tables
- **Accès non autorisé** : 0 incident
- **Audit trail** : Complet
- **Chiffrement** : Activé

Ce plan garantit un backend complet, sécurisé et performant pour KhedmaFinal. 