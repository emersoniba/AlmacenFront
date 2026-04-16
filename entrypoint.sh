#!/bin/sh
set -e

echo "Iniciando servidor Nginx para Angular..."

# Reemplazar variable de entorno de API si existe
if [ ! -z "$API_URL" ]; then
    echo "Configurando API_URL: $API_URL"
    find /usr/share/nginx/html -type f -name "main.*.js" -exec sed -i "s|http://localhost:8000|$API_URL|g" {} \;
fi

# Ejecutar Nginx
exec "$@"