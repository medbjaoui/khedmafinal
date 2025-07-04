# KhedmaClair UX/UI Redesign - Plan de Refonte

Ce document détaille les prochaines étapes pour la modernisation de l'interface utilisateur de KhedmaClair.

## Objectif Général

Finaliser la refonte de l'application en appliquant le nouveau design system (basé sur Tailwind CSS et les composants `shadcn/ui`) à toutes les pages principales pour une expérience utilisateur cohérente, moderne et responsive.

## Pages à Refondre (par ordre de priorité)

1.  **Tableau de Bord Principal (`/`) - `src/pages/Index.tsx`**
    *   **Statut :** En cours.
    *   **Actions :**
        *   Remplacer les cartes (Cards) existantes par le nouveau composant `Card` modernisé.
        *   Utiliser une grille responsive (CSS Grid ou Flexbox) pour un meilleur alignement sur toutes les tailles d'écran.
        *   Moderniser les en-têtes de section et les indicateurs de performance (KPIs).
        *   Intégrer des graphiques (si présents) avec des styles plus épurés.

2.  **Page de Profil (`/profile`) - `src/pages/Profile.tsx` et ses composants**
    *   **Statut :** À faire.
    *   **Actions :**
        *   **`ProfileHeader.tsx`**: Refondre l'en-tête avec la nouvelle charte graphique. Utiliser les composants `Button` et `Avatar` mis à jour.
        *   **`AboutSection.tsx`**: Moderniser la mise en page de la section "À propos". Utiliser les composants `Card` et `Badge`.
        *   **`ExperienceSection.tsx`, `EducationSection.tsx`, etc.**: Appliquer le style des `Card` pour chaque entrée (expérience, formation). Standardiser les icônes et la typographie.
        *   **Formulaires d'édition**: Mettre à jour tous les champs de formulaire (`Input`, `Textarea`, `Select`) avec les nouveaux composants `ui`.

3.  **Page de Recherche d'Emplois (`/jobs`)**
    *   **Statut :** À faire.
    *   **Actions :**
        *   Refondre la carte de chaque offre d'emploi (`JobCard`).
        *   Améliorer les filtres de recherche avec les nouveaux composants `Input`, `Select`, `Checkbox`.
        *   Rendre la liste des offres plus lisible et aérée.

4.  **Page des Paramètres (`/settings`)**
    *   **Statut :** À faire.
    *   **Actions :**
        *   Organiser les paramètres en onglets ou sections claires en utilisant le composant `Tabs`.
        *   Mettre à jour tous les éléments de formulaire.
        *   Assurer une mise en page claire et facile à naviguer.

## Composants à Créer/Mettre à Jour

*   **`Tabs.tsx`**: Créer un composant d'onglets réutilisable pour la navigation sectionnelle (ex: page de profil, paramètres).
*   **`Badge.tsx`**: Standardiser le composant `Badge` pour les compétences, les rôles, etc.
*   **`Avatar.tsx`**: Créer un composant `Avatar` pour afficher les images de profil ou les initiales.
*   **`DataTable.tsx`**: Si des tableaux de données sont utilisés, créer un composant de table stylisé et fonctionnel (avec tri, pagination).

## Prochaines Étapes Immédiates

1.  Créer ce fichier `PLAN.md` à la racine du projet.
2.  Commencer la refonte de la page `Index.tsx`.
