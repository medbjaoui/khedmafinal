# TODO - Fonctionnalités et Tables Manquantes

## 📋 Vue d'ensemble
Ce document liste toutes les fonctionnalités manquantes et les tables qui ne sont pas encore implémentées dans l'application Khedma.

---

## Tables Manquantes dans la Base de Données

### Tables Principales
- [x] `jobs` - Table des offres d'emploi
- [x] `user_profiles` - Profils utilisateurs
- [x] `saved_jobs` - Emplois sauvegardés
- [x] `recommendations` - Recommandations personnalisées
- [x] `notifications` - Système de notifications
- [x] `cv_versions` - Versions de CV
- [x] `applications` - Candidatures utilisateurs

### Tables de Profil Utilisateur
- [x] `experiences` - Expériences professionnelles
- [x] `education` - Formation et éducation
- [x] `skills` - Compétences utilisateur
- [x] `languages` - Langues maîtrisées
- [x] `certifications` - Certifications et diplômes

### Tables Admin
- [x] `system_alerts` - Alertes système
- [x] `ai_settings` - Paramètres IA
- [x] `ai_usage` - Suivi d'utilisation IA

---

## Fonctionnalités Manquantes

### 1. Authentification et Gestion des Utilisateurs
- [x] Connexion/Inscription par email/mot de passe (présence de composants Auth, hooks, services et slice Redux)
- [x] Gestion de profil utilisateur (édition de profil, overview, slice Redux, page dédiée)
- [x] Administration des utilisateurs (pages et composants admin, gestion de la liste des utilisateurs)
- [x] Gestion des rôles côté backend (fonctions SQL pour changer le rôle dans les métadonnées)
- [x] Policies RLS sur les tables sensibles

- [x] **Interface d’administration pour attribuer/changer les rôles** (UI implémentée avec contournement pour la fonction backend défectueuse)
- [ ] **Création de rôles personnalisés** (actuellement, seuls “Admin” et “User” sont utilisés ; pas de gestion dynamique des rôles)
- [ ] **Permissions granulaires côté application** (pas de gestion fine côté front/back pour chaque permission)
- [ ] **Validation d’email à l’inscription** (à vérifier côté front, pas d’UI claire)
- [ ] **Téléversement de photo de profil** (pas de champ ni d’UI dédié repéré)
- [ ] **Suppression de compte utilisateur** (pas de fonction ou bouton utilisateur pour supprimer son compte)
- [ ] **Gestion du rafraîchissement/expiration des tokens** (à vérifier côté front/back)
- [ ] **Journalisation des connexions et tentatives échouées** (pas de log d’authentification utilisateur explicite)
- [ ] **Possibilité de bannir ou désactiver un utilisateur** (pas de champ ou de logique “is_active”/“banned” sur auth.users ou user_profiles)
  - [ ] Gestion des permissions par fonctionnalité

- [ ] **Gestion des sessions**
  - [ ] Sessions multiples
  - [ ] Déconnexion automatique
  - [ ] Historique des connexions

- [ ] **Récupération de compte**
  - [ ] Réinitialisation de mot de passe par email
  - [ ] Questions de sécurité
  - [ ] Authentification à deux facteurs

### 2. Gestion des Profils
- [ ] **Profil utilisateur complet**
  - [ ] Photo de profil
  - [ ] Informations personnelles détaillées
  - [ ] Préférences de travail
  - [ ] Disponibilité

- [ ] **CV Builder avancé**
  - [ ] Templates personnalisables
  - [ ] Export PDF/Word
  - [ ] Analyse automatique du CV
  - [ ] Suggestions d'amélioration

- [ ] **Portfolio**
  - [ ] Upload de projets
  - [ ] Galerie de travaux
  - [ ] Liens vers réseaux sociaux

### 3. Système d'Emplois
- [ ] **Recherche avancée**
  - [ ] Filtres multiples
  - [ ] Recherche géolocalisée
  - [ ] Alertes d'emploi
  - [ ] Historique de recherche

- [ ] **Candidature intelligente**
  - [ ] Candidature en un clic
  - [ ] Lettres de motivation automatiques
  - [ ] Suivi des candidatures
  - [ ] Rappels automatiques

- [ ] **Matching IA**
  - [ ] Analyse de compatibilité
  - [ ] Suggestions personnalisées
  - [ ] Score de correspondance

### 4. Système de Notifications
- [ ] **Notifications en temps réel**
  - [ ] WebSocket pour notifications instantanées
  - [ ] Notifications push
  - [ ] Notifications par email
  - [ ] Notifications SMS

- [ ] **Types de notifications**
  - [ ] Nouvelles offres d'emploi
  - [ ] Mise à jour de candidature
  - [ ] Messages de recruteurs
  - [ ] Rappels et alertes

### 5. Intelligence Artificielle
- [ ] **Analyse de CV**
  - [ ] Extraction automatique d'informations
  - [ ] Analyse des compétences
  - [ ] Suggestions d'amélioration
  - [ ] Comparaison avec les offres

- [ ] **Assistant IA**
  - [ ] Chatbot pour questions
  - [ ] Aide à la rédaction
  - [ ] Conseils personnalisés
  - [ ] Préparation aux entretiens

- [ ] **Recommandations intelligentes**
  - [ ] Emplois recommandés
  - [ ] Compétences à développer
  - [ ] Formations suggérées
  - [ ] Évolutions de carrière

### 6. Analytics et Rapports
- [ ] **Tableau de bord utilisateur**
  - [ ] Statistiques personnelles
  - [ ] Progression de carrière
  - [ ] Performance des candidatures
  - [ ] Graphiques interactifs

- [ ] **Rapports avancés**
  - [ ] Rapports de performance
  - [ ] Analyses de marché
  - [ ] Tendances du secteur
  - [ ] Export de données

### 7. Communication
- [ ] **Messagerie interne**
  - [ ] Chat avec recruteurs
  - [ ] Messages privés
  - [ ] Notifications de messages
  - [ ] Historique des conversations

- [ ] **Intégrations externes**
  - [ ] LinkedIn
  - [ ] Indeed
  - [ ] Apec
  - [ ] Autres plateformes

### 8. Fonctionnalités Avancées
- [ ] **Calendrier et planification**
  - [ ] Planification d'entretiens
  - [ ] Rappels automatiques
  - [ ] Synchronisation calendrier
  - [ ] Gestion des disponibilités

- [ ] **Gestion des documents**
  - [ ] Upload multiple
  - [ ] Gestion des versions
  - [ ] Partage sécurisé
  - [ ] Signature électronique

- [ ] **Évaluations et feedback**
  - [ ] Système de notation
  - [ ] Commentaires utilisateurs
  - [ ] Avis sur les entreprises
  - [ ] Recommandations

---

## 🎯 Priorités de Développement

### Phase 1 - Fondations (Urgent)
1. **Tables de base**
   - [ ] Créer toutes les tables manquantes
   - [ ] Implémenter les relations
   - [ ] Ajouter les contraintes de sécurité

2. **Authentification complète**
   - [ ] Système de rôles
   - [ ] Gestion des sessions
   - [ ] Récupération de compte

### Phase 2 - Fonctionnalités Core (Important)
1. **Gestion des profils**
   - [ ] CV Builder
   - [ ] Portfolio
   - [ ] Gestion des compétences

2. **Système d'emplois**
   - [ ] Recherche avancée
   - [ ] Candidatures
   - [ ] Suivi des candidatures

### Phase 3 - Intelligence Artificielle (Moyen)
1. **Analyse IA**
   - [ ] Analyse de CV
   - [ ] Matching intelligent
   - [ ] Recommandations

2. **Assistant IA**
   - [ ] Chatbot
   - [ ] Conseils personnalisés

### Phase 4 - Fonctionnalités Avancées (Faible)
1. **Analytics**
   - [ ] Tableaux de bord
   - [ ] Rapports

2. **Communication**
   - [ ] Messagerie
   - [ ] Intégrations

---

## 🛠️ Tâches Techniques

### Base de Données
- [ ] **Migrations**
  - [ ] Créer les migrations pour toutes les tables
  - [ ] Ajouter les index pour les performances
  - [ ] Implémenter les triggers et fonctions

- [ ] **Sécurité**
  - [ ] Row Level Security (RLS) pour toutes les tables
  - [ ] Politiques d'accès granulaires
  - [ ] Audit trail

- [ ] **Performance**
  - [ ] Optimisation des requêtes
  - [ ] Mise en cache
  - [ ] Pagination

### Frontend
- [ ] **Composants manquants**
  - [ ] Formulaires de profil
  - [ ] Interface de recherche
  - [ ] Tableau de bord
  - [ ] Système de notifications

- [ ] **UX/UI**
  - [ ] Design responsive
  - [ ] Accessibilité
  - [ ] Thèmes personnalisables
  - [ ] Animations et transitions

### Backend
- [ ] **API**
  - [ ] Endpoints manquants
  - [ ] Validation des données
  - [ ] Gestion d'erreurs
  - [ ] Documentation API

- [ ] **Services**
  - [ ] Service d'email
  - [ ] Service de notifications
  - [ ] Service d'IA
  - [ ] Service de fichiers

---

## 📊 Métriques de Suivi

### Fonctionnalités
- [ ] **Couverture fonctionnelle** : 0% → 100%
- [ ] **Tables implémentées** : 0/15 → 15/15
- [ ] **Composants créés** : 0/20 → 20/20

### Qualité
- [ ] **Tests unitaires** : 0% → 80%
- [ ] **Tests d'intégration** : 0% → 70%
- [ ] **Couverture de code** : 0% → 85%

### Performance
- [ ] **Temps de chargement** : < 3s
- [ ] **Temps de réponse API** : < 500ms
- [ ] **Disponibilité** : 99.9%

---

## 🚀 Prochaines Étapes

1. **Immédiat** (Cette semaine)
   - [ ] Créer les tables manquantes
   - [ ] Implémenter l'authentification de base
   - [x] Corriger les erreurs existantes (Erreurs de hooks React et de mise à jour de rôle résolues)

2. **Court terme** (2-4 semaines)
   - [ ] Développer les fonctionnalités core
   - [ ] Créer les composants UI
   - [ ] Implémenter les services de base

3. **Moyen terme** (1-3 mois)
   - [ ] Intégrer l'IA
   - [ ] Développer les analytics
   - [ ] Optimiser les performances

4. **Long terme** (3-6 mois)
   - [ ] Fonctionnalités avancées
   - [ ] Intégrations externes
   - [ ] Évolutions majeures

---

## 📝 Notes

- **Priorité** : Commencer par les tables et fonctionnalités de base
- **Approche** : Développement itératif avec tests continus
- **Objectif** : Application fonctionnelle et stable
- **Deadline** : Version MVP dans 4 semaines
- **Note Technique** : La fonction Supabase `update_user_role` est défectueuse (erreur de colonne `metadata` dans `system_logs`). Un contournement a été implémenté côté client en modifiant `AdminService.updateUser` pour gérer directement la mise à jour du rôle. La fonction backend devra être corrigée.

---

*Dernière mise à jour : 2025-07-03*
*Version : 1.0* 