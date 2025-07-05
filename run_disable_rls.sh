#!/bin/bash

# =====================================================
# SCRIPT POUR EXÉCUTER LA DÉSACTIVATION RLS
# =====================================================

echo "🔧 Désactivation de RLS sur Supabase..."
echo "⚠️  ATTENTION: Ceci va supprimer toute la sécurité au niveau ligne"
echo ""

# Vérifier si Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé"
    echo "Installez-le avec: npm install -g supabase"
    exit 1
fi

# Vérifier si le fichier SQL existe
if [[ ! -f "disable_all_rls.sql" ]]; then
    echo "❌ Le fichier disable_all_rls.sql n'existe pas"
    exit 1
fi

# Demander confirmation
echo "Êtes-vous sûr de vouloir désactiver RLS sur toutes les tables ? (y/N)"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "❌ Opération annulée"
    exit 1
fi

# Exécuter le script SQL
echo "🚀 Exécution du script de désactivation RLS..."

# Méthode 1: Avec Supabase CLI (recommandée)
if [[ -n "$DATABASE_URL" ]]; then
    echo "Exécution via DATABASE_URL..."
    psql "$DATABASE_URL" -f disable_all_rls.sql
elif supabase status &> /dev/null; then
    echo "Exécution via supabase local..."
    psql "postgresql://postgres:postgres@localhost:54322/postgres" -f disable_all_rls.sql
else
    echo "❌ Impossible de déterminer la méthode de connexion"
    echo "Options:"
    echo "1. Définissez DATABASE_URL pour la production"
    echo "2. Ou démarrez Supabase localement: supabase start"
    echo "3. Ou exécutez manuellement: psql 'VOTRE_DATABASE_URL' -f disable_all_rls.sql"
    exit 1
fi

echo ""
echo "✅ Script terminé!"
echo ""
echo "📋 Vérifications recommandées:"
echo "1. Connectez-vous à votre base de données"
echo "2. Exécutez: SELECT * FROM public.check_rls_status();"
echo "3. Exécutez: SELECT * FROM public.list_remaining_policies();"
echo ""
echo "⚠️  RAPPEL: Toutes les données sont maintenant accessibles"
echo "⚠️  à tous les utilisateurs authentifiés"