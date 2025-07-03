# Script de réparation automatique des migrations Supabase
Write-Host "🔧 Réparation des migrations Supabase..." -ForegroundColor Yellow

# 1. Réparer l'historique des migrations
Write-Host "📝 Réparation de l'historique des migrations..." -ForegroundColor Cyan
npx supabase migration repair --status applied 20250000
npx supabase migration repair --status applied 20250701
npx supabase migration repair --status applied 20250702
npx supabase migration repair --status applied 20250703
npx supabase migration repair --status applied 20250704
npx supabase migration repair --status applied 20250705

# 2. Synchroniser avec la base distante
Write-Host "🔄 Synchronisation avec la base distante..." -ForegroundColor Cyan
npx supabase db pull

# 3. Pousser toutes les migrations
Write-Host "📤 Application de toutes les migrations..." -ForegroundColor Cyan
npx supabase db push --include-all

Write-Host "✅ Réparation terminée !" -ForegroundColor Green 