# Schéma SQL Complet pour Nouveau Projet Supabase - KhedmaFinal

## 🎯 Vue d'Ensemble

Ce schéma SQL complet est conçu pour créer une plateforme de recherche d'emploi moderne avec toutes les fonctionnalités avancées incluses. Il est optimisé pour Supabase et prêt pour la production.

## 📋 Contenu du Schéma

### 🗃️ Tables Principales (8)
- **user_profiles** - Profils utilisateurs complets
- **skills** - Compétences avec niveaux et catégories
- **experiences** - Expériences professionnelles
- **education** - Formation et éducation
- **languages** - Langues parlées
- **certifications** - Certifications et diplômes
- **jobs** - Offres d'emploi
- **applications** - Candidatures

### 🚀 Tables Avancées (10)
- **cv_versions** - Gestion des versions de CV
- **saved_jobs** - Emplois sauvegardés
- **job_matches** - Correspondances IA
- **notifications** - Système de notifications
- **recommendations** - Recommandations IA
- **user_preferences** - Préférences utilisateur
- **auto_application_settings** - Candidature automatique
- **auto_application_stats** - Statistiques
- **auto_application_templates** - Templates
- **application_templates** - Templates d'application

### 🔧 Tables Système (8)
- **email_logs** - Logs d'emails
- **recruiter_responses** - Réponses recruteurs
- **login_history** - Historique connexions
- **system_logs** - Logs système
- **system_alerts** - Alertes système
- **admin_settings** - Paramètres admin
- **ai_settings** - Paramètres IA
- **ai_usage** - Utilisation IA
- **transactions** - Transactions financières

## 🛠️ Installation

### 1. Créer un Nouveau Projet Supabase

```bash
# Créer un nouveau projet
supabase init your-project-name
cd your-project-name

# Lier à votre projet Supabase
supabase link --project-ref your-project-ref
```

### 2. Appliquer le Schéma

```bash
# Copier le fichier de migration
cp supabase/migrations/20250104000000_complete_schema.sql supabase/migrations/

# Appliquer la migration
supabase db push
```

### 3. Vérifier l'Installation

```bash
# Vérifier les tables créées
supabase db diff

# Tester la connexion
supabase db ping
```

## 🔐 Sécurité Intégrée

### Row Level Security (RLS)
- **Activé sur toutes les tables**
- **Politiques granulaires** par rôle (User/Admin/Recruiter)
- **Isolation des données** par utilisateur
- **Accès admin** pour la gestion

### Rôles Utilisateur
```sql
-- Rôles disponibles
CREATE TYPE user_role AS ENUM ('User', 'Admin', 'Recruiter', 'Premium');

-- Vérifier le rôle
SELECT get_user_role(auth.uid());

-- Changer le rôle (admin seulement)
SELECT update_user_role('user-id', 'Premium');
```

## 📊 Fonctions SQL Intégrées

### Recherche d'Emplois
```sql
-- Recherche avancée
SELECT * FROM search_jobs(
    'Développeur',           -- Terme de recherche
    'Paris',                 -- Localisation
    'CDI',                   -- Type de contrat
    35000,                   -- Salaire min
    50000,                   -- Salaire max
    ARRAY['React', 'JS'],    -- Compétences
    'remote',                -- Arrangement de travail
    20,                      -- Limite
    0                        -- Offset
);
```

### Matching Intelligent
```sql
-- Calculer la correspondance
SELECT calculate_job_match_score('user-id', 'job-id');

-- Obtenir les recommandations
SELECT * FROM get_job_recommendations('user-id', 10);
```

### Statistiques Utilisateur
```sql
-- Statistiques complètes
SELECT get_user_stats('user-id');

-- Mettre à jour les stats auto-candidature
SELECT update_auto_application_stats('user-id', CURRENT_DATE);
```

### Gestion des Notifications
```sql
-- Créer une notification
SELECT create_notification(
    'user-id',
    'job',
    'Nouvelle offre',
    'Une offre correspond à votre profil',
    'high'
);

-- Nettoyer les anciennes notifications
SELECT cleanup_old_notifications();
```

## 🎨 Types de Données Personnalisés

### Énumérations
```sql
-- Types d'emploi
job_type: 'CDI', 'CDD', 'Stage', 'Freelance', 'Interim'

-- Niveaux de compétence
skill_level: 'Débutant', 'Intermédiaire', 'Avancé', 'Expert'

-- Niveaux de langue
language_level: 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Natif'

-- Statuts de candidature
application_status: 'draft', 'sent', 'viewed', 'interview', 'rejected', 'accepted'

-- Arrangements de travail
work_arrangement: 'remote', 'hybrid', 'onsite', 'flexible'
```

## 🔄 Triggers Automatiques

### Mises à Jour Automatiques
- **updated_at** - Mis à jour automatiquement
- **completion_score** - Calculé automatiquement
- **login_history** - Enregistré automatiquement
- **profile_creation** - Créé à l'inscription

### Exemple de Trigger
```sql
-- Trigger pour score de complétion
CREATE TRIGGER update_profile_completion_score_trigger
    BEFORE INSERT OR UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_profile_completion_score();
```

## 📈 Index de Performance

### Index Optimisés
```sql
-- Recherche de texte
CREATE INDEX idx_jobs_title_trgm ON jobs USING gin(title gin_trgm_ops);

-- Recherche par compétences
CREATE INDEX idx_jobs_skills_required ON jobs USING gin(skills_required);

-- Tri par date
CREATE INDEX idx_jobs_posted_date ON jobs(posted_date DESC);

-- Recherche par localisation
CREATE INDEX idx_jobs_location ON jobs(location);
```

## 🚀 Utilisation avec le Frontend

### Configuration Supabase Client
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'your-supabase-url',
  'your-supabase-anon-key'
)
```

### Exemples d'Utilisation
```typescript
// Recherche d'emplois
const { data: jobs } = await supabase
  .rpc('search_jobs', {
    search_query: 'Développeur',
    job_location: 'Paris',
    limit_results: 20
  })

// Obtenir les statistiques utilisateur
const { data: stats } = await supabase
  .rpc('get_user_stats', {
    target_user_id: userId
  })

// Créer une candidature
const { data: application } = await supabase
  .from('applications')
  .insert({
    user_id: userId,
    job_id: jobId,
    status: 'draft',
    cover_letter: 'Ma lettre de motivation...'
  })
```

## 🔧 Configuration Avancée

### Variables d'Environnement
```bash
# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# IA (optionnel)
GROQ_API_KEY=your-groq-key
GEMINI_API_KEY=your-gemini-key

# Email (optionnel)
SMTP_HOST=your-smtp-host
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
```

### Paramètres Admin
```sql
-- Configurer les paramètres
INSERT INTO admin_settings (key, value, description) VALUES
    ('max_cv_size', '10485760', 'Taille max CV en bytes'),
    ('max_applications_per_day', '50', 'Candidatures max par jour'),
    ('ai_analysis_enabled', 'true', 'Analyse IA activée');
```

## 📊 Monitoring et Analytics

### Métriques Disponibles
```sql
-- Statistiques générales
SELECT COUNT(*) as total_users FROM user_profiles;
SELECT COUNT(*) as total_jobs FROM jobs WHERE is_active = true;
SELECT COUNT(*) as total_applications FROM applications;

-- Utilisation IA
SELECT 
    model,
    COUNT(*) as requests,
    SUM(total_tokens) as total_tokens,
    AVG(cost) as avg_cost
FROM ai_usage 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY model;

-- Statistiques de candidature
SELECT 
    DATE(created_at) as date,
    COUNT(*) as applications,
    COUNT(*) FILTER (WHERE status = 'sent') as sent,
    COUNT(*) FILTER (WHERE status = 'interview') as interviews
FROM applications
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## 🛡️ Sécurité et Maintenance

### Bonnes Pratiques
1. **Sauvegarde régulière** de la base de données
2. **Monitoring des logs** système
3. **Nettoyage périodique** des données
4. **Mise à jour des politiques** RLS
5. **Audit des permissions** utilisateur

### Commandes de Maintenance
```sql
-- Nettoyer les notifications anciennes
SELECT cleanup_old_notifications();

-- Vérifier l'intégrité des données
SELECT COUNT(*) FROM user_profiles WHERE completion_score < 0 OR completion_score > 100;

-- Analyser les performances
EXPLAIN ANALYZE SELECT * FROM search_jobs('Développeur', 'Paris');
```

## 🔄 Migration et Mise à Jour

### Ajouter une Nouvelle Table
```sql
-- Créer la migration
CREATE TABLE public.new_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- autres colonnes
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;

-- Créer les politiques
CREATE POLICY "Users can manage own data" ON public.new_table
    FOR ALL USING (auth.uid() = user_id);
```

### Modifier une Table Existante
```sql
-- Ajouter une colonne
ALTER TABLE public.user_profiles 
ADD COLUMN new_field TEXT;

-- Ajouter un index
CREATE INDEX idx_user_profiles_new_field 
ON public.user_profiles(new_field);
```

## 📚 Documentation des API

### Endpoints Principaux
- `search_jobs()` - Recherche d'emplois
- `get_job_recommendations()` - Recommandations
- `calculate_job_match_score()` - Score de correspondance
- `get_user_stats()` - Statistiques utilisateur
- `create_notification()` - Créer notification

### Types de Retour
```typescript
interface JobSearchResult {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'CDI' | 'CDD' | 'Stage' | 'Freelance' | 'Interim';
  salary_min?: number;
  salary_max?: number;
  relevance_score: number;
  posted_date: string;
}

interface UserStats {
  profile_completion: number;
  total_applications: number;
  applications_sent: number;
  response_rate: number;
  saved_jobs: number;
  skills_count: number;
}
```

## 🎯 Prochaines Étapes

1. **Déployer le schéma** sur votre projet Supabase
2. **Configurer les variables** d'environnement
3. **Tester les fonctions** SQL
4. **Implémenter le frontend** avec les API
5. **Configurer les Edge Functions** pour l'IA
6. **Mettre en place le monitoring**

## 🆘 Support et Dépannage

### Problèmes Courants
- **Erreur RLS** : Vérifier les politiques de sécurité
- **Performance lente** : Analyser les index et requêtes
- **Données manquantes** : Vérifier les triggers et contraintes

### Logs Utiles
```sql
-- Vérifier les erreurs récentes
SELECT * FROM system_logs 
WHERE level = 'error' 
AND created_at > NOW() - INTERVAL '1 hour';

-- Analyser les performances
SELECT * FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;
```

Ce schéma SQL complet fournit une base solide pour une plateforme de recherche d'emploi moderne avec toutes les fonctionnalités avancées intégrées ! 🚀 