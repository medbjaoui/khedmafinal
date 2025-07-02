# KhedmaClair - Plateforme de Recherche d'Emploi en Tunisie

![KhedmaClair Logo](https://i.imgur.com/XYZ123.png)

## 🚀 Présentation

KhedmaClair est une plateforme innovante de recherche d'emploi conçue spécifiquement pour le marché tunisien. Elle utilise l'intelligence artificielle pour aider les candidats à optimiser leur profil, analyser leur CV, générer des lettres de motivation personnalisées et trouver les offres d'emploi les plus pertinentes.

## ✨ Fonctionnalités principales

### 👤 Gestion de profil
- Création de profil professionnel complet
- Import et analyse automatique de CV (PDF, DOCX)
- Suivi du taux de complétion du profil
- Recommandations personnalisées d'amélioration

### 💼 Recherche d'emploi
- Recherche avancée avec filtres (localisation, type de contrat, etc.)
- Matching intelligent entre profil et offres
- Sauvegarde des offres favorites
- Alertes personnalisées

### 📝 Candidatures
- Génération de lettres de motivation par IA
- Suivi complet du statut des candidatures
- Relances automatiques
- Statistiques et analytics

### 🤖 Intelligence Artificielle
- Analyse de CV avec recommandations
- Génération de lettres de motivation personnalisées
- Assistant conversationnel pour conseils carrière
- Choix entre plusieurs modèles d'IA (Groq, Gemini)

## 🛠️ Technologies utilisées

### Frontend
- **React 18** avec TypeScript
- **Vite** pour le bundling et le développement
- **Redux Toolkit** pour la gestion d'état
- **React Router** pour la navigation
- **Tailwind CSS** pour le styling
- **Framer Motion** pour les animations
- **Lucide React** pour les icônes

### Backend
- **Supabase** pour l'authentification, la base de données et le stockage
- **PostgreSQL** avec Row Level Security (RLS)
- **Edge Functions** pour la logique serveur

### Intelligence Artificielle
- **Groq** (Llama 3.1) pour la génération de texte rapide
- **Gemini 2.0 Flash** de Google pour l'analyse et la génération
- **Mode local** pour les démonstrations sans API key

## 🏗️ Architecture de la base de données

### Tables principales
- `user_profiles` - Profils utilisateurs
- `experiences` - Expériences professionnelles
- `education` - Formation et diplômes
- `skills` - Compétences techniques et soft skills
- `languages` - Langues parlées
- `certifications` - Certifications professionnelles
- `jobs` - Offres d'emploi
- `applications` - Candidatures
- `saved_jobs` - Emplois sauvegardés
- `ai_settings` - Configuration des modèles IA
- `recommendations` - Recommandations personnalisées
- `ai_usage` - Suivi d'utilisation des tokens

## 📊 Fonctionnalités analytiques
- Taux de réponse aux candidatures
- Taux d'entretiens obtenus
- Performance par source d'emploi
- Évolution temporelle des candidatures
- Recommandations basées sur les statistiques

## 🔒 Sécurité
- Authentification complète via Supabase Auth
- Row Level Security (RLS) pour toutes les tables
- Chiffrement des clés API sensibles
- Politiques d'accès strictes par utilisateur

## 📱 Responsive Design
L'application est entièrement responsive et optimisée pour:
- Ordinateurs de bureau
- Tablettes
- Smartphones

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Supabase

### Installation

1. Cloner le dépôt
```bash
git clone https://github.com/votre-username/khedmaclair.git
cd khedmaclair
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
Créez un fichier `.env` à la racine du projet:
```
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase
VITE_GROQ_API_KEY=votre_clé_api_groq (optionnel)
VITE_GEMINI_API_KEY=votre_clé_api_gemini (optionnel)
```

4. Lancer l'application en mode développement
```bash
npm run dev
```

5. Construire pour la production
```bash
npm run build
```

## 🗄️ Structure du projet

```
khedmaclair/
├── public/              # Ressources statiques
├── src/                 # Code source
│   ├── components/      # Composants React
│   │   ├── AI/          # Composants liés à l'IA
│   │   ├── Applications/ # Gestion des candidatures
│   │   ├── Auth/        # Authentification
│   │   ├── CV/          # Analyse de CV
│   │   ├── Dashboard/   # Tableaux de bord
│   │   ├── Jobs/        # Offres d'emploi
│   │   ├── Layout/      # Structure de l'application
│   │   └── Profile/     # Gestion de profil
│   ├── hooks/           # Hooks personnalisés
│   ├── pages/           # Pages de l'application
│   │   └── admin/       # Pages d'administration
│   ├── services/        # Services (API, IA, etc.)
│   ├── store/           # État global (Redux)
│   │   └── slices/      # Slices Redux
│   ├── utils/           # Utilitaires
│   ├── App.tsx          # Composant racine
│   └── main.tsx         # Point d'entrée
├── supabase/            # Configuration Supabase
│   └── migrations/      # Migrations SQL
├── .env                 # Variables d'environnement
├── package.json         # Dépendances
└── vite.config.ts       # Configuration Vite
```

## 🧪 Tests

```bash
npm run test
```

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Contributeurs

- [Votre Nom](https://github.com/votre-username)

## 🙏 Remerciements

- [Supabase](https://supabase.io/) pour l'infrastructure backend
- [Groq](https://groq.com/) et [Google Gemini](https://ai.google.dev/) pour les API d'IA
- [Tailwind CSS](https://tailwindcss.com/) pour le framework CSS
- [Lucide](https://lucide.dev/) pour les icônes
- [Framer Motion](https://www.framer.com/motion/) pour les animations

---

Développé avec ❤️ pour le marché de l'emploi tunisien