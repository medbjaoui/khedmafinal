# TODO - KhedmaClair Project

Ce document résume les prochaines étapes pour finaliser l'intégration des données réelles, la gestion des fichiers et améliorer la robustesse globale de l'application.

## 🔴 Critique (À Corriger en Priorité)

Ces points sont essentiels pour que l'application fonctionne comme prévu.

1.  **Pièce Jointe du CV Dynamique**
    *   **Problème**: Actuellement, lors de l'envoi d'une candidature (`ApplicationModal.tsx`), la pièce jointe du CV est codée en dur (`attachments: ['cv.pdf']`). L'application n'envoie pas le CV réel de l'utilisateur.
    *   **Solution**:
        *   Modifier la fonction `handleSendApplication` pour récupérer le `cv_file_path` depuis le profil de l'utilisateur (via le store Redux).
        *   Télécharger le fichier depuis Supabase Storage avant de le joindre à l'email. **Attention**: Cela nécessite une logique backend (probablement une Edge Function) pour ne pas exposer les URLs de stockage.

2.  **Données Statiques du Tableau de Bord Admin**
    *   **Problème**: Certaines parties du tableau de bord administrateur (`Dashboard.tsx`) affichent encore des données statiques.
    *   **Solution**:
        *   **État du système**: Remplacer la liste statique des services par des appels réels. Cela peut nécessiter une nouvelle table `system_status` ou des appels à des services externes.
        *   **Gestion des utilisateurs**: Remplacer la liste statique des utilisateurs par les données réelles récupérées via `SupabaseService.getUsers()`.

3.  **Vérification de l'Application des Rôles dans `ProtectedRoute`**
    *   **Problème**: Le composant `ProtectedRoute` utilise `requiredRole="Admin"` pour les routes d'administration, mais l'implémentation de la vérification de ce rôle doit être confirmée.
    *   **Solution**: Examiner `src/components/Auth/ProtectedRoute.tsx` pour s'assurer que la logique de vérification des rôles est correctement appliquée et sécurisée.

4.  **Données d'Offres d'Emploi Statiques (`Jobs.tsx`)**
    *   **Problème**: Le composant `Jobs.tsx` charge des données d'offres d'emploi simulées (`mockJobs`) au lieu de les récupérer depuis Supabase.
    *   **Solution**: Modifier le `useEffect` pour appeler `SupabaseService.getJobs()` et alimenter le store Redux avec les données réelles.

5.  **Données Statiques des Candidatures (`Applications.tsx`)**
    *   **Problème**: Le composant `Applications.tsx` utilise des données statiques pour la liste des candidatures.
    *   **Solution**: S'assurer que les candidatures sont récupérées depuis Supabase via `SupabaseService.getUserApplications()` et que le store Redux est mis à jour.

6.  **Données Statiques des Emplois Sauvegardés (`SavedJobs.tsx`)**
    *   **Problème**: La liste des `savedJobs` est filtrée à partir de l'état `jobs` du store Redux, qui est statique.
    *   **Solution**: S'assurer que les emplois sauvegardés sont récupérés depuis Supabase via `SupabaseService.getSavedJobs()` et que le store Redux est mis à jour.

## 🟡 Améliorations (Prochaines Étapes)

Ces améliorations ajouteront des fonctionnalités clés et amélioreront l'expérience utilisateur.

1.  **Appliquer le Nouveau Schéma SQL**
    *   **Action**: Le nouveau schéma unifié a été créé dans `supabase/migrations/20250630120000_unified_schema.sql`.
    *   **Étapes**:
        1.  **Supprimer les anciens fichiers de migration** pour éviter les conflits.
        2.  Appliquer ce nouveau schéma à votre base de données Supabase (via la CLI Supabase ou l'éditeur SQL) pour vous assurer que toutes les tables et politiques sont à jour.

2.  **Interface de Gestion des Fichiers du CV**
    *   **Problème**: L'utilisateur peut téléverser un CV, mais ne peut ni le voir, ni le télécharger, ni le supprimer depuis son profil.
    *   **Solution**: 
        *   Dans `Profile.tsx`, ajouter des boutons "Télécharger le CV" et "Supprimer le CV" à côté de la zone de téléversement.
        *   Utiliser les méthodes `getFileUrl` et `deleteFile` du `SupabaseService` pour implémenter cette logique.

3.  **Améliorer l'Upload de la Lettre de Motivation**
    *   **Problème**: L'upload de la lettre de motivation est un simple input de fichier, ce qui est moins intuitif que la zone de glisser-déposer du CV.
    *   **Solution**: Transformer l'upload de la lettre de motivation dans `ApplicationModal.tsx` en un composant de type "dropzone" pour une expérience utilisateur cohérente.

4.  **Refactoriser le Chargement des Données Admin**
    *   **Problème**: La logique de chargement des données pour le tableau de bord admin est directement dans le composant `Dashboard.tsx`.
    *   **Solution**: Créer un `adminSlice` dans Redux pour gérer l'état des données d'administration (utilisateurs, alertes, etc.), comme c'est le cas pour le profil utilisateur.

5.  **Implémenter le Service d'Analyse de CV Réel**
    *   **Problème**: Le `CVAnalysisService.processFile` est actuellement une simulation.
    *   **Solution**: Développer une Edge Function Supabase ou un service backend dédié qui prendra le fichier CV, l'analysera (potentiellement avec une API d'IA externe) et retournera les données structurées pour mettre à jour le profil utilisateur.

6.  **Gestion des Rôles Utilisateur**
    *   **Problème**: Le rôle de l'utilisateur est stocké dans `user_metadata` de Supabase Auth, mais la gestion de ce rôle (par exemple, la modification par un administrateur) n'est pas clairement implémentée.
    *   **Solution**: 
        *   Ajouter une interface dans le tableau de bord administrateur pour modifier le rôle des utilisateurs.
        *   Implémenter une fonction sécurisée (via une Edge Function ou un RLS strict) pour mettre à jour le `user_metadata` dans Supabase Auth.

7.  **Mise à jour Dynamique de la Sidebar et du Header**
    *   **Problème**: La sidebar et le header peuvent afficher des options non pertinentes pour le rôle de l'utilisateur.
    *   **Solution**: Rendre les éléments de navigation dynamiques en fonction du rôle de l'utilisateur (`isAdmin` ou non) pour améliorer l'expérience utilisateur.

8.  **Données d'Activité Récente Statiques (`Dashboard.tsx`)**
    *   **Problème**: Le tableau `recentActivities` est codé en dur.
    *   **Solution**: Alimenter ce tableau avec des données réelles provenant d'une table `user_activities` ou en agrégeant des événements comme les candidatures envoyées, les mises à jour de profil, etc.

9.  **Fonctions Utilitaires Manquantes (`Dashboard.tsx`, `SavedJobs.tsx`)**
    *   **Problème**: Les fonctions `timeAgo` et `getTypeColor` sont définies localement dans `Dashboard.tsx` et `SavedJobs.tsx`.
    *   **Solution**: Définir ces fonctions dans un fichier utilitaire (`src/utils/helpers.ts` par exemple) et les importer dans les composants nécessaires.

10. **Logique de Recommandation d'Offres d'Emploi Basique (`Dashboard.tsx`)**
    *   **Problème**: La logique de "recommandation" (`recommendedJobs = jobs.slice(0, 3)`) est très basique.
    *   **Solution**: Implémenter une logique de recommandation plus sophistiquée basée sur le profil de l'utilisateur, l'historique des candidatures, les compétences, etc. Cela pourrait impliquer une Edge Function ou une logique côté client plus complexe.

11. **Données de Score et de Détails Statiques (`CVAnalysis.tsx`)**
    *   **Problème**: Les scores de "Contenu", "Format", "Mots-clés" et "Lisibilité" sont codés en dur.
    *   **Solution**: Alimenter ces données à partir des résultats de l'analyse du CV stockés dans le store Redux (`state.cv.current`).

12. **Fonctionnalité des Boutons d'Action (`CVAnalysis.tsx`)**
    *   **Problème**: Les boutons "Télécharger le rapport" et "Analyser un nouveau CV" sont présents mais leur fonctionnalité n'est pas implémentée.
    *   **Solution**: Implémenter la logique pour télécharger un rapport d'analyse (potentiellement généré par l'IA) et pour réinitialiser l'état afin de permettre une nouvelle analyse de CV.

13. **Filtre de Salaire Non Implémenté (`Jobs.tsx`)**
    *   **Problème**: Le filtre `filters.salary` est présent dans l'interface utilisateur, mais la logique de filtrage (`filteredJobs`) ne l'utilise pas.
    *   **Solution**: Ajouter la logique de filtrage par salaire dans la fonction `filteredJobs`.

14. **Vérification des Composants `JobCard` et `JobDetailsModal` (`Jobs.tsx`)**
    *   **Problème**: Ces composants sont utilisés pour afficher les offres d'emploi, mais leur implémentation n'a pas été vérifiée en détail.
    *   **Solution**: Examiner `src/components/Jobs/JobCard.tsx` et `src/components/Jobs/JobDetailsModal.tsx` pour s'assurer qu'ils affichent correctement toutes les données pertinentes et gèrent les actions (sauvegarder, postuler).

15. **Données Statiques des Candidatures (`Applications.tsx`)**
    *   **Problème**: Le composant `Applications.tsx` utilise des données statiques pour la liste des candidatures.
    *   **Solution**: S'assurer que les candidatures sont récupérées depuis Supabase via `SupabaseService.getUserApplications()` et que le store Redux est mis à jour.

16. **Données Statiques des Statistiques (`ApplicationStats.tsx`)**
    *   **Problème**: Le composant `ApplicationStats.tsx` est utilisé pour afficher les statistiques des candidatures, mais il est probable qu'il utilise des données statiques.
    *   **Solution**: Examiner `src/components/Applications/ApplicationStats.tsx` et s'assurer qu'il calcule les statistiques à partir des données réelles des candidatures dans le store Redux.

17. **Fonctionnalité "Modifier" Candidature (`Applications.tsx`)**
    *   **Problème**: La fonction `handleEditApplication` est présente mais ne fait rien (`// Open edit modal (to be implemented)`).
    *   **Solution**: Implémenter la logique pour ouvrir un modal d'édition de candidature pré-rempli avec les données de la candidature sélectionnée.

18. **Bouton "Nouvelle" Candidature (`Applications.tsx`)**
    *   **Problème**: Il n'y a pas de bouton "Nouvelle" pour ajouter une candidature manuellement.
    *   **Solution**: Ajouter un bouton "Nouvelle Candidature" qui ouvre un modal permettant de créer une candidature manuellement (sans passer par une offre d'emploi).

19. **Bouton "MoreVertical" (`SavedJobs.tsx`)**
    *   **Problème**: Ce bouton est présent mais n'a pas de fonctionnalité implémentée.
    *   **Solution**: Implémenter un menu contextuel pour ce bouton, offrant des options comme "Voir les détails", "Postuler", "Supprimer", etc.

20. **Données Statiques des Statistiques (`Analytics.tsx`)**
    *   **Problème**: Le composant `Analytics.tsx` utilise probablement des données statiques pour les graphiques et les statistiques.
    *   **Solution**: Implémenter la récupération des données réelles depuis Supabase pour alimenter les graphiques et les indicateurs (par exemple, nombre de candidatures par mois, taux de réponse, etc.).

21. **Fonctionnalités Manquantes (`Tasks.tsx`, `Reports.tsx`, `Settings.tsx`)**
    *   **Problème**: Ces pages sont probablement des placeholders ou ont des fonctionnalités incomplètes.
    *   **Solution**: Examiner chaque page et définir les fonctionnalités attendues, puis implémenter la logique nécessaire pour interagir avec Supabase.

22. **Données Statiques des Utilisateurs Admin (`AdminUsers.tsx`)**
    *   **Problème**: Le composant `AdminUsers.tsx` utilise probablement des données statiques pour la liste des utilisateurs.
    *   **Solution**: S'assurer que les utilisateurs sont récupérés depuis Supabase via `SupabaseService.getUsers()` et que le store Redux est mis à jour.

23. **Données Statiques du Système Admin (`AdminSystem.tsx`)**
    *   **Problème**: Le composant `AdminSystem.tsx` utilise probablement des données statiques pour l'état du système.
    *   **Solution**: Implémenter la récupération des données réelles depuis Supabase pour l'état du système (alertes, logs, etc.).

## 🟢 Suggestions (Qualité de Vie)

Ces suggestions peaufineront l'application.

1.  **Notifications d'Erreur Utilisateur**
    *   **Problème**: Les erreurs (par exemple, échec du téléversement) sont actuellement loguées dans la console (`console.error`).
    *   **Solution**: Implémenter un système de notifications visuelles (par exemple, des "toasts") pour informer l'utilisateur des erreurs de manière claire.

2.  **Indicateurs de Chargement Spécifiques**
    *   **Problème**: Le chargement est souvent géré par un indicateur global.
    *   **Solution**: Ajouter des indicateurs de chargement plus fins, par exemple sur le bouton "Sauvegarder" lorsqu'une section du profil est mise à jour, ou un indicateur de progression pour le téléversement de fichiers.

3.  **Nettoyage du Code**
    *   **Action**: Supprimer les données de démonstration (mock data) qui sont maintenant inutiles dans les fichiers `Dashboard.tsx` et `applicationsSlice.ts` pour garder le code propre.

4.  **Sécurité des Cookies (HttpOnly)**
    *   **Problème**: Les tokens sont stockés dans des cookies accessibles via JavaScript (`js-cookie`), ce qui les rend vulnérables aux attaques XSS.
    *   **Solution**: Pour une sécurité maximale, envisager de stocker les `refresh_token` dans des cookies `HttpOnly`. Cela nécessiterait une couche backend (par exemple, une Edge Function ou un serveur Node.js) pour gérer l'échange de tokens, car les cookies `HttpOnly` ne sont pas accessibles par le JavaScript côté client. C'est un compromis courant avec les architectures client-side comme Supabase.
