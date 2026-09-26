#!/bin/bash

# Скрипт автоматической установки Xray VLESS (gRPC) + Caddy + Docker Compose

if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

read -p "Enter your domain (e.g. vpn.example.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
    echo "Domain cannot be empty."
    exit 1
fi

# Генерируем UUID
UUID=$(cat /proc/sys/kernel/random/uuid)

# Генерируем случайный путь для gRPC (8 символов)
GRPC_PATH=$(tr -dc a-z0-9 </dev/urandom | head -c 8)

echo "Generating configs..."

# Подставляем переменные в Caddyfile
sed -e "s/\${DOMAIN}/${DOMAIN}/g" -e "s/\${GRPC_PATH}/${GRPC_PATH}/g" caddy/Caddyfile.template > caddy/Caddyfile

# Подставляем переменные в config.json для Xray
sed -e "s/\${UUID}/${UUID}/g" -e "s/\${GRPC_PATH}/${GRPC_PATH}/g" xray/config.json.template > xray/config.json

echo "Configuration generated."
echo "UUID: ${UUID}"
echo "gRPC Path: ${GRPC_PATH}"
echo "Domain: ${DOMAIN}"

echo "Starting Docker containers..."
# Пробуем использовать docker compose (v2) или docker-compose (v1)
if docker compose version &> /dev/null; then
    docker compose up -d
else
    docker-compose up -d
fi

echo "=========================================================="
echo "Installation complete! Your containers should be running."
echo ""
echo "Here is your VLESS client configuration link:"
echo ""
echo "vless://${UUID}@${DOMAIN}:443?encryption=none&security=tls&type=grpc&serviceName=${GRPC_PATH}#VLESS-gRPC-${DOMAIN}"
echo ""
echo "=========================================================="
