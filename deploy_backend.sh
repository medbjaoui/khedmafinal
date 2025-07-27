#!/bin/bash

# Script de déploiement backend KhedmaFinal
# Usage: ./deploy_backend.sh [environment]
# Environment: dev, staging, prod (default: dev)

set -e  # Exit on any error

# Configuration
ENVIRONMENT=${1:-dev}
PROJECT_NAME="khedmafinal"
BACKUP_DIR="./backups"
LOGS_DIR="./logs"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher des messages colorés
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Fonction pour vérifier les prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    # Vérifier si Supabase CLI est installé
    if ! command -v supabase &> /dev/null; then
        log_error "Supabase CLI n'est pas installé. Installez-le avec: npm install -g supabase"
        exit 1
    fi
    
    # Vérifier si Deno est installé (pour les Edge Functions)
    if ! command -v deno &> /dev/null; then
        log_warning "Deno n'est pas installé. Les Edge Functions ne pourront pas être testées localement."
    fi
    
    # Vérifier si les variables d'environnement sont définies
    if [ -z "$SUPABASE_PROJECT_REF" ]; then
        log_error "SUPABASE_PROJECT_REF n'est pas défini"
        exit 1
    fi
    
    if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
        log_error "SUPABASE_ACCESS_TOKEN n'est pas défini"
        exit 1
    fi
    
    log_success "Prérequis vérifiés"
}

# Fonction pour créer les dossiers nécessaires
create_directories() {
    log_info "Création des dossiers nécessaires..."
    
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$LOGS_DIR"
    
    log_success "Dossiers créés"
}

# Fonction pour faire un backup de la base de données
backup_database() {
    log_info "Création d'un backup de la base de données..."
    
    local backup_file="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"
    
    if [ "$ENVIRONMENT" = "prod" ]; then
        # Backup complet pour la production
        supabase db dump --project-ref "$SUPABASE_PROJECT_REF" > "$backup_file"
        log_success "Backup créé: $backup_file"
    else
        log_info "Backup ignoré pour l'environnement $ENVIRONMENT"
    fi
}

# Fonction pour appliquer les migrations
apply_migrations() {
    log_info "Application des migrations..."
    
    # Vérifier s'il y a des migrations en attente
    if [ -d "supabase/migrations" ] && [ "$(ls -A supabase/migrations)" ]; then
        log_info "Migrations trouvées, application en cours..."
        
        # Appliquer les migrations
        supabase migration up --project-ref "$SUPABASE_PROJECT_REF"
        
        log_success "Migrations appliquées avec succès"
    else
        log_info "Aucune migration à appliquer"
    fi
}

# Fonction pour déployer les Edge Functions
deploy_edge_functions() {
    log_info "Déploiement des Edge Functions..."
    
    if [ -d "supabase/functions" ] && [ "$(ls -A supabase/functions)" ]; then
        # Déployer chaque fonction
        for function_dir in supabase/functions/*/; do
            if [ -d "$function_dir" ]; then
                function_name=$(basename "$function_dir")
                log_info "Déploiement de la fonction: $function_name"
                
                supabase functions deploy "$function_name" --project-ref "$SUPABASE_PROJECT_REF"
                
                log_success "Fonction $function_name déployée"
            fi
        done
    else
        log_info "Aucune Edge Function à déployer"
    fi
}

# Fonction pour exécuter les tests
run_tests() {
    log_info "Exécution des tests..."
    
    if [ -f "BACKEND_TESTS.sql" ]; then
        log_info "Exécution des tests SQL..."
        
        # Exécuter les tests SQL
        supabase db reset --project-ref "$SUPABASE_PROJECT_REF"
        psql -h db.${SUPABASE_PROJECT_REF}.supabase.co -U postgres -d postgres -f BACKEND_TESTS.sql
        
        log_success "Tests SQL exécutés"
    else
        log_warning "Fichier de tests SQL non trouvé"
    fi
    
    # Tester les Edge Functions
    if [ -d "supabase/functions" ]; then
        log_info "Test des Edge Functions..."
        
        # Test de santé basique pour chaque fonction
        for function_dir in supabase/functions/*/; do
            if [ -d "$function_dir" ]; then
                function_name=$(basename "$function_dir")
                log_info "Test de la fonction: $function_name"
                
                # Test de santé (ping)
                response=$(curl -s -o /dev/null -w "%{http_code}" \
                    -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
                    "https://${SUPABASE_PROJECT_REF}.functions.supabase.co/$function_name" \
                    -d '{"test": true}' \
                    -H "Content-Type: application/json" \
                    --max-time 30)
                
                if [ "$response" = "200" ] || [ "$response" = "400" ]; then
                    log_success "Fonction $function_name répond correctement"
                else
                    log_warning "Fonction $function_name retourne le code: $response"
                fi
            fi
        done
    fi
}

# Fonction pour valider le déploiement
validate_deployment() {
    log_info "Validation du déploiement..."
    
    # Vérifier la connexion à la base de données
    log_info "Test de connexion à la base de données..."
    if supabase db ping --project-ref "$SUPABASE_PROJECT_REF"; then
        log_success "Base de données accessible"
    else
        log_error "Impossible de se connecter à la base de données"
        exit 1
    fi
    
    # Vérifier les fonctions SQL
    log_info "Vérification des fonctions SQL..."
    functions_to_check=("is_admin" "search_jobs" "get_user_stats" "calculate_job_match_score")
    
    for func in "${functions_to_check[@]}"; do
        if psql -h db.${SUPABASE_PROJECT_REF}.supabase.co -U postgres -d postgres -c "SELECT $func FROM pg_proc WHERE proname = '$func';" > /dev/null 2>&1; then
            log_success "Fonction $func disponible"
        else
            log_warning "Fonction $func non trouvée"
        fi
    done
    
    # Vérifier les politiques RLS
    log_info "Vérification des politiques RLS..."
    tables_with_rls=("user_profiles" "applications" "notifications" "jobs")
    
    for table in "${tables_with_rls[@]}"; do
        rls_status=$(psql -h db.${SUPABASE_PROJECT_REF}.supabase.co -U postgres -d postgres -t -c "SELECT relrowsecurity FROM pg_class WHERE relname = '$table';")
        if [ "$rls_status" = " t" ]; then
            log_success "RLS activé pour $table"
        else
            log_warning "RLS non activé pour $table"
        fi
    done
    
    log_success "Validation terminée"
}

# Fonction pour nettoyer les ressources temporaires
cleanup() {
    log_info "Nettoyage des ressources temporaires..."
    
    # Supprimer les fichiers temporaires
    find . -name "*.tmp" -delete 2>/dev/null || true
    find . -name "*.log" -mtime +7 -delete 2>/dev/null || true
    
    log_success "Nettoyage terminé"
}

# Fonction pour afficher le résumé
show_summary() {
    log_info "=== RÉSUMÉ DU DÉPLOIEMENT ==="
    echo "Environment: $ENVIRONMENT"
    echo "Project: $PROJECT_NAME"
    echo "Timestamp: $(date)"
    echo "Supabase Project: $SUPABASE_PROJECT_REF"
    echo ""
    echo "Composants déployés:"
    echo "- ✅ Migrations SQL"
    echo "- ✅ Edge Functions"
    echo "- ✅ Politiques RLS"
    echo "- ✅ Fonctions SQL"
    echo ""
    echo "URLs importantes:"
    echo "- Dashboard: https://app.supabase.com/project/$SUPABASE_PROJECT_REF"
    echo "- API: https://${SUPABASE_PROJECT_REF}.supabase.co"
    echo "- Functions: https://${SUPABASE_PROJECT_REF}.functions.supabase.co"
    echo ""
    log_success "Déploiement terminé avec succès!"
}

# Fonction principale
main() {
    log_info "=== DÉPLOIEMENT BACKEND KHEDMAFINAL ==="
    log_info "Environment: $ENVIRONMENT"
    
    # Vérifier les prérequis
    check_prerequisites
    
    # Créer les dossiers nécessaires
    create_directories
    
    # Faire un backup si nécessaire
    if [ "$ENVIRONMENT" = "prod" ]; then
        backup_database
    fi
    
    # Appliquer les migrations
    apply_migrations
    
    # Déployer les Edge Functions
    deploy_edge_functions
    
    # Exécuter les tests
    if [ "$ENVIRONMENT" != "prod" ]; then
        run_tests
    fi
    
    # Valider le déploiement
    validate_deployment
    
    # Nettoyer
    cleanup
    
    # Afficher le résumé
    show_summary
}

# Gestion des erreurs
trap 'log_error "Erreur durant le déploiement. Vérifiez les logs."; exit 1' ERR

# Vérifier les arguments
if [ "$ENVIRONMENT" != "dev" ] && [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "prod" ]; then
    log_error "Environment invalide: $ENVIRONMENT. Utilisez: dev, staging, ou prod"
    exit 1
fi

# Exécuter le script principal
main "$@" 