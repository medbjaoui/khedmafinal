#!/bin/bash

# Script de déploiement pour KhedmaClair
echo "🚀 Déploiement de KhedmaClair en production..."

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

# Vérifier que npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm ci --production=false

# Vérifier les types TypeScript
echo "🔍 Vérification des types TypeScript..."
npm run type-check

# Linter le code
echo "🧹 Linting du code..."
npm run lint

# Build pour la production
echo "🏗️ Build pour la production..."
npm run build:prod

# Vérifier que le build a réussi
if [ ! -d "dist" ]; then
    echo "❌ Le build a échoué - dossier dist non trouvé"
    exit 1
fi

echo "✅ Build terminé avec succès!"
echo "📁 Dossier de production: ./dist"
echo "🌐 Pour tester localement: npm run preview"

# Optionnel: Déployer sur un serveur
# echo "🚀 Déploiement sur le serveur..."
# rsync -avz --delete dist/ user@your-server:/var/www/khedmaclair/

echo "🎉 Déploiement terminé!" 