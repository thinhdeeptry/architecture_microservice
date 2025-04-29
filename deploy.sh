#!/bin/bash

# Script triển khai ứng dụng microservice
# Sử dụng: ./deploy.sh <docker_username>

if [ -z "$1" ]; then
  echo "Vui lòng cung cấp tên đăng nhập Docker Hub"
  echo "Sử dụng: ./deploy.sh <docker_username>"
  exit 1
fi

DOCKER_USERNAME=$1

# Kéo các image mới nhất từ Docker Hub
echo "Kéo các image mới nhất từ Docker Hub..."
docker pull $DOCKER_USERNAME/product-service:latest
docker pull $DOCKER_USERNAME/order-service:latest
docker pull $DOCKER_USERNAME/customer-service:latest
docker pull $DOCKER_USERNAME/api-gateway:latest

# Dừng và xóa các container hiện tại (nếu có)
echo "Dừng các container hiện tại..."
docker-compose -f docker-compose.prod.yml down

# Khởi động các container mới
echo "Khởi động các container mới..."
DOCKER_USERNAME=$DOCKER_USERNAME docker-compose -f docker-compose.prod.yml up -d

echo "Triển khai hoàn tất!"
