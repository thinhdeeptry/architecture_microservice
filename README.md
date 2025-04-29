# Hướng dẫn CI/CD cho Dự án Microservice

Dự án này sử dụng GitHub Actions để thiết lập quy trình CI/CD (Continuous Integration/Continuous Deployment) tự động.

## Quy trình CI/CD

Quy trình CI/CD của dự án bao gồm các bước sau:

1. **Continuous Integration (CI)**:
   - Chạy khi có push hoặc pull request vào nhánh chính (main/master)
   - Cài đặt Node.js và dependencies
   - Chạy linting để kiểm tra code style
   - Chạy unit tests
   - Build ứng dụng

2. **Continuous Deployment (CD)**:
   - Chỉ chạy khi có push vào nhánh chính (main/master), không chạy khi có pull request
   - Build Docker image cho từng service
   - Đẩy Docker image lên Docker Hub
   - Triển khai lên môi trường production

## Thiết lập GitHub Actions

### 1. Secrets cần thiết

Để quy trình CI/CD hoạt động, bạn cần thiết lập các secrets sau trong repository GitHub:

- `DOCKER_USERNAME`: Tên đăng nhập Docker Hub
- `DOCKER_PASSWORD`: Mật khẩu hoặc access token Docker Hub
- `SSH_HOST`: Địa chỉ IP hoặc hostname của server production
- `SSH_USERNAME`: Tên đăng nhập SSH
- `SSH_PRIVATE_KEY`: Khóa SSH private key
- `DEPLOY_PATH`: Đường dẫn đến thư mục triển khai trên server

### 2. Cách thiết lập Secrets

1. Truy cập repository của bạn trên GitHub
2. Chọn "Settings" > "Secrets and variables" > "Actions"
3. Nhấn "New repository secret"
4. Thêm các secrets đã liệt kê ở trên

## Triển khai thủ công

Nếu bạn muốn triển khai thủ công, bạn có thể sử dụng script `deploy.sh`:

```bash
./deploy.sh <docker_username>
```

Script này sẽ:
1. Kéo các image mới nhất từ Docker Hub
2. Dừng các container hiện tại
3. Khởi động các container mới sử dụng `docker-compose.prod.yml`

## Cấu trúc file

- `.github/workflows/ci.yml`: Cấu hình workflow CI/CD
- `docker-compose.prod.yml`: Cấu hình Docker Compose cho môi trường production
- `deploy.sh`: Script triển khai
- `Dockerfile`: File cấu hình để build Docker image

## Lưu ý

- Đảm bảo server production có cài đặt Docker và Docker Compose
- Đảm bảo server production có quyền truy cập vào Docker Hub
- Nếu bạn thay đổi tên service hoặc port, hãy cập nhật lại file workflow và docker-compose.prod.yml
