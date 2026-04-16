#!/bin/bash

echo "🚀 Iniciando build del frontend Angular..."

# Instalar dependencias
npm install --legacy-peer-deps

# Construir la aplicación
npm run build -- --configuration=production

echo "✅ Build completado exitosamente"
echo "📁 Archivos generados en: dist/"