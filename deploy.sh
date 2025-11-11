#!/bin/bash

# Script de Deployment Rápido para GBot
# Uso: ./deploy.sh

echo "🚀 GBot - Deployment Script"
echo "============================"
echo ""

# Verificar si estamos en el directorio correcto
if [ ! -f "DEPLOYMENT_GUIDE.md" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

# Verificar git
if ! command -v git &> /dev/null; then
    echo "❌ Git no está instalado"
    exit 1
fi

# Verificar si hay cambios sin commit
if [[ -n $(git status -s) ]]; then
    echo "📝 Hay cambios sin commit. Commiteando..."
    git add .
    read -p "Mensaje de commit: " commit_msg
    git commit -m "$commit_msg"
fi

# Push a GitHub
echo "📤 Pusheando a GitHub..."
git push origin main

echo ""
echo "✅ Código subido a GitHub"
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1. Frontend (Vercel):"
echo "   - Ve a https://vercel.com"
echo "   - Importa tu repo"
echo "   - Root Directory: frontend"
echo "   - Deploy!"
echo ""
echo "2. Backend (Railway):"
echo "   - Ve a https://railway.app"
echo "   - Importa tu repo"
echo "   - Root Directory: backend"
echo "   - Configura variables de entorno"
echo "   - Deploy!"
echo ""
echo "3. Configura variables de entorno en ambos"
echo ""
echo "📖 Lee DEPLOYMENT_GUIDE.md para instrucciones detalladas"
echo ""
echo "🎉 ¡Listo para deploy!"
