#!/bin/bash

# Script de déploiement Vercel pour Apaddicto
# Usage: ./deploy-vercel.sh [production|preview]

set -e

echo "🚀 Déploiement Apaddicto sur Vercel..."

# Vérifier que le token Vercel est fourni
if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ Erreur: VERCEL_TOKEN n'est pas défini"
  echo "Usage: VERCEL_TOKEN=your_token ./deploy-vercel.sh [production|preview]"
  exit 1
fi

# Déterminer le type de déploiement
DEPLOY_TYPE="${1:-production}"

# Build du client
echo "📦 Building client..."
npm run build:client

# Déploiement
if [ "$DEPLOY_TYPE" = "production" ]; then
  echo "🚢 Deploying to production..."
  npx vercel --prod --token "$VERCEL_TOKEN" --yes
else
  echo "🔍 Deploying preview..."
  npx vercel --token "$VERCEL_TOKEN" --yes
fi

echo "✅ Déploiement terminé!"
