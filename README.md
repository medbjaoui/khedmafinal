# 🤖 Système Multi-Agents IA pour KhedmaFinal

Une solution complète d'intelligence artificielle collaborative pour transformer votre plateforme de recherche d'emploi en un écosystème intelligent et automatisé.

## 🎯 Vue d'Ensemble

Ce système multi-agents révolutionne l'expérience KhedmaFinal en intégrant six agents IA spécialisés qui collaborent pour automatiser les tâches complexes, améliorer la qualité des matchings, et offrir une assistance intelligente aux utilisateurs.

### Agents IA Inclus

| Agent | Fonction | Technologie IA |
|-------|----------|----------------|
| 🔍 **CV Analyzer** | Analyse intelligente des CV avec extraction d'informations et recommandations | Gemini Pro + Document AI |
| 🎯 **Matching Agent** | Matching sémantique avancé entre candidats et offres d'emploi | Gemini Pro + Algorithmes ML |
| ✍️ **Content Writer** | Génération automatique de contenu professionnel personnalisé | Gemini Pro + Groq |
| 💬 **Support Agent** | Assistant conversationnel multilingue pour le support client | Gemini Pro + NLP |
| 🛡️ **Moderation Agent** | Détection automatique de contenu inapproprié et frauduleux | Google Natural Language |
| 📊 **Analytics Agent** | Insights prédictifs et analytics avancés du marché de l'emploi | Gemini Pro + ML |

## 🚀 Fonctionnalités Principales

### Analyse de CV Intelligente
- **Extraction automatique** d'informations structurées (expériences, compétences, formation)
- **Scoring de qualité** avec recommandations d'amélioration personnalisées
- **Support multi-format** (PDF, DOCX) avec OCR avancé
- **Détection de compétences** sémantique et transférable

### Matching Avancé
- **Algorithme de scoring** multi-dimensionnel (compétences, expérience, localisation, salaire)
- **Analyse sémantique** pour détecter les correspondances non-exactes
- **Explications détaillées** des scores de matching
- **Recommandations personnalisées** pour améliorer la candidature

### Génération de Contenu
- **Descriptions de poste** optimisées et attractives
- **Lettres de motivation** personnalisées automatiquement
- **Résumés de profil** professionnels
- **Contenu marketing** adapté au marché tunisien

### Support Client IA
- **Conversations naturelles** en français et arabe
- **Compréhension contextuelle** avec mémoire de conversation
- **Escalade intelligente** vers le support humain
- **Réponses personnalisées** selon le profil utilisateur

## 🏗️ Architecture Technique

### Stack Technologique
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase Edge Functions (Deno)
- **Base de données**: PostgreSQL avec Row Level Security
- **IA**: Google Gemini Pro, Document AI, Groq Llama 3.1
- **Orchestration**: Système d'événements asynchrone

### Composants Principaux

```
khedmafinal-multi-agents/
├── 📁 orchestrator/           # Gestionnaire central des agents
│   └── agent-orchestrator.ts  # Orchestrateur principal
├── 📁 agents/                 # Agents IA spécialisés
│   ├── cv-analyzer-agent.ts   # Agent d'analyse de CV
│   ├── matching-agent.ts      # Agent de matching
│   ├── content-writer-agent.ts # Agent rédacteur
│   ├── support-agent.ts       # Agent de support
│   ├── moderation-agent.ts    # Agent de modération
│   └── analytics-agent.ts     # Agent d'analytics
├── 📁 types/                  # Définitions TypeScript
│   └── index.ts              # Types complets du système
├── 📁 utils/                  # Utilitaires et configuration
│   └── database-setup.sql    # Script d'extension BDD
└── 📁 examples/              # Exemples d'intégration
    └── integration-examples.ts # Composants React d'exemple
```

## 📋 Prérequis

### Comptes et APIs Requis
- ✅ **Supabase** : Projet existant avec base PostgreSQL
- ✅ **Google Cloud Platform** : Accès à Gemini Pro et Document AI
- ✅ **Groq** : Clé API pour Llama 3.1 (optionnel, fallback)

### Environnement Technique
- **Node.js** 18+ avec npm/yarn
- **Deno** pour les Edge Functions Supabase
- **Git** pour le versioning
- **VS Code** avec extensions TypeScript et Supabase (recommandé)

## 🛠️ Installation Rapide

### 1. Cloner et Configurer

```bash
# Cloner votre projet KhedmaFinal existant
git clone https://github.com/medbjaoui/khedmafinal.git
cd khedmafinal

# Créer une branche pour l'intégration IA
git checkout -b feature/multi-agents-ai

# Copier les fichiers du système multi-agents
cp -r /path/to/khedmafinal-multi-agents/* ./
```

### 2. Configuration de la Base de Données

```bash
# Exécuter le script d'extension de la base de données
psql -h your-supabase-host -U postgres -d your-database -f utils/database-setup.sql
```

### 3. Variables d'Environnement

Créer un fichier `.env.local` :

```env
# Supabase (existant)
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Cloud AI
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# Groq (optionnel)
GROQ_API_KEY=your_groq_api_key

# Configuration des agents
AGENT_CV_ANALYZER_ENABLED=true
AGENT_MATCHING_ENABLED=true
AGENT_CONTENT_WRITER_ENABLED=true
AGENT_SUPPORT_ENABLED=true
AGENT_MODERATION_ENABLED=true
AGENT_ANALYTICS_ENABLED=true
```

### 4. Déploiement des Edge Functions

```bash
# Installer Supabase CLI
npm install -g supabase

# Déployer les fonctions
supabase functions deploy agent-orchestrator
supabase functions deploy cv-analyzer-agent
supabase functions deploy matching-agent
supabase functions deploy content-writer-agent
supabase functions deploy support-agent
supabase functions deploy moderation-agent
supabase functions deploy analytics-agent
```

### 5. Intégration Frontend

```bash
# Installer les nouvelles dépendances
npm install

# Copier les composants d'exemple
cp examples/integration-examples.ts src/components/AI/

# Démarrer en mode développement
npm run dev
```

## 💡 Exemples d'Utilisation

### Analyse de CV

```typescript
import { useAgentService } from './hooks/useAgentService';
import { AgentType, TaskPriority } from './types';

const { executeTask } = useAgentService();

// Analyser un CV uploadé
const analyzeCV = async (file: File) => {
  const fileBuffer = await file.arrayBuffer();
  
  const result = await executeTask(
    AgentType.CV_ANALYZER,
    'analyze_cv',
    {
      fileBuffer,
      fileName: file.name,
      fileType: file.type,
      userId: currentUser.id,
      analysisType: 'complete'
    },
    TaskPriority.HIGH
  );
  
  console.log('Analyse terminée:', result);
  // result contient: scores, compétences, recommandations, etc.
};
```

### Matching Intelligent

```typescript
// Effectuer un matching candidat-offre
const performMatching = async (candidateId: string, jobId: string) => {
  const result = await executeTask(
    AgentType.MATCHING,
    'perform_matching',
    {
      candidateProfile: candidateData,
      jobOffer: jobData,
      matchingCriteria: {
        skillsWeight: 0.35,
        experienceWeight: 0.25,
        educationWeight: 0.15,
        locationWeight: 0.10,
        salaryWeight: 0.10,
        languageWeight: 0.05
      }
    }
  );
  
  console.log(`Score de matching: ${result.overallScore}%`);
  console.log('Recommandations:', result.recommendations);
};
```

### Génération de Contenu

```typescript
// Générer une description de poste
const generateJobDescription = async (context: string) => {
  const result = await executeTask(
    AgentType.CONTENT_WRITER,
    'generate_content',
    {
      type: 'job_description',
      context: { description: context },
      style: {
        tone: 'professional',
        length: 'medium',
        industry: 'technology'
      },
      language: 'fr'
    }
  );
  
  return result.generatedContent;
};
```

## 📊 Monitoring et Métriques

### Tableau de Bord des Agents

Le système inclut un tableau de bord complet pour surveiller :

- **Statut de santé** de chaque agent (🟢 Sain, 🟡 Dégradé, 🔴 Indisponible)
- **Métriques de performance** (temps de réponse, taux de succès, charge)
- **Utilisation des APIs** externes et coûts associés
- **Statistiques d'usage** par utilisateur et par fonctionnalité

### Alertes Automatiques

- **Dégradation de performance** des agents
- **Dépassement de quotas** API
- **Erreurs critiques** nécessitant une intervention
- **Pics d'utilisation** anormaux

## 🔧 Configuration Avancée

### Personnalisation des Agents

Chaque agent peut être configuré via la table `agent_configurations` :

```sql
-- Exemple : Ajuster les seuils de l'agent de matching
UPDATE agent_configurations 
SET configuration = jsonb_set(
  configuration, 
  '{matchingThresholds}', 
  '{"strong": 85, "moderate": 65, "weak": 45}'
)
WHERE agent_type = 'matching';
```

### Ajout de Nouveaux Agents

Le système est conçu pour être extensible :

1. **Créer le type** dans `types/index.ts`
2. **Implémenter l'agent** dans `agents/`
3. **Configurer l'orchestrateur** pour reconnaître le nouvel agent
4. **Déployer** la nouvelle Edge Function
5. **Mettre à jour** l'interface utilisateur

## 🚀 Déploiement en Production

### Checklist de Déploiement

- [ ] **Tests complets** en environnement de staging
- [ ] **Configuration des quotas** API et alertes de coût
- [ ] **Sauvegarde** de la base de données avant migration
- [ ] **Monitoring** activé pour tous les agents
- [ ] **Documentation** mise à jour pour l'équipe

### Optimisations de Performance

- **Mise en cache** des résultats fréquents
- **Parallélisation** des tâches indépendantes
- **Optimisation** des requêtes de base de données
- **CDN** pour les ressources statiques

## 🤝 Support et Contribution

### Documentation Complète

- 📖 **[Guide de Déploiement](guide_deploiement_multi_agents.md)** : Instructions détaillées
- 🏗️ **[Architecture](architecture_multi_agents_khedmafinal.md)** : Conception technique
- 📊 **[Analyse du Projet](analyse_khedmafinal.md)** : Étude approfondie

### Support Technique

Pour toute question ou problème :

1. **Consulter** la documentation complète
2. **Vérifier** les logs des agents dans Supabase
3. **Tester** en environnement de développement
4. **Contacter** l'équipe de support si nécessaire

## 📈 Roadmap et Évolutions

### Prochaines Fonctionnalités

- **Agent de Recommandation** : Suggestions personnalisées d'offres
- **Agent de Formation** : Recommandations de formations et certifications
- **Agent de Veille** : Surveillance des tendances du marché de l'emploi
- **Intégration LinkedIn** : Import automatique de profils
- **API publique** : Accès aux fonctionnalités IA pour les partenaires

### Améliorations Continues

- **Modèles IA** mis à jour régulièrement
- **Algorithmes de matching** affinés par l'apprentissage
- **Interface utilisateur** optimisée selon les retours
- **Performance** améliorée en continu

## 📄 Licence et Crédits

Ce système multi-agents a été développé spécifiquement pour KhedmaFinal, intégrant les meilleures pratiques d'architecture IA et les technologies les plus avancées du marché.

**Technologies utilisées :**
- Google Gemini Pro pour l'IA générative
- Supabase pour l'infrastructure serverless
- PostgreSQL pour la persistance des données
- TypeScript pour la sécurité de type
- React pour l'interface utilisateur moderne

---

**Développé avec ❤️ pour révolutionner le marché de l'emploi tunisien**

*Transformez votre plateforme de recherche d'emploi en un écosystème intelligent avec l'IA collaborative.*

