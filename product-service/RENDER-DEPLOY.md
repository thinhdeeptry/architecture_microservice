# Triển khai Product Service lên Render.com

Hướng dẫn này sẽ giúp bạn triển khai Product Service lên Render.com.

## Các bước triển khai

### 1. Đăng ký tài khoản Render.com

- Truy cập [Render.com](https://render.com/) và đăng ký tài khoản mới
- Xác nhận email và đăng nhập vào tài khoản

### 2. Kết nối với GitHub

- Trong Dashboard của Render.com, chọn "New" > "Web Service"
- Chọn "Build and deploy from a Git repository"
- Kết nối với GitHub và chọn repository của bạn
- Nếu repository chưa được hiển thị, bạn có thể cần cấp quyền truy cập cho Render.com

### 3. Cấu hình Web Service

- **Name**: product-service
- **Environment**: Node
- **Region**: Chọn region gần với người dùng của bạn
- **Branch**: main (hoặc nhánh bạn muốn triển khai)
- **Root Directory**: product-service
- **Build Command**: npm install && npm run build
- **Start Command**: npm run start:prod
- **Plan**: Free

### 4. Cấu hình Environment Variables

Thêm các biến môi trường sau:

- `NODE_ENV`: production
- `PORT`: 10000 (Render sẽ tự động thiết lập PORT, nhưng bạn nên đặt giá trị này)

### 5. Cấu hình cơ sở dữ liệu MongoDB

#### Sử dụng MongoDB Atlas (Khuyến nghị)

1. Đăng ký tài khoản [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Tạo cluster mới (có thể sử dụng tier miễn phí)
3. Tạo database user và thiết lập IP whitelist (có thể cho phép truy cập từ mọi nơi: 0.0.0.0/0)
4. Lấy connection string và thêm vào biến môi trường `MONGODB_URI` trong Render.com

#### Sử dụng MongoDB trên Render.com

1. Trong Dashboard của Render.com, chọn "New" > "PostgreSQL" (Render không hỗ trợ MongoDB trực tiếp)
2. Sử dụng dịch vụ MongoDB của bên thứ ba như MongoDB Atlas

### 6. Triển khai

- Nhấn "Create Web Service"
- Render.com sẽ tự động build và triển khai ứng dụng của bạn
- Sau khi triển khai hoàn tất, bạn có thể truy cập ứng dụng qua URL được cung cấp

## Kiểm tra triển khai

Sau khi triển khai hoàn tất, bạn có thể kiểm tra API bằng cách truy cập:

```
https://product-service.onrender.com/api/products
```

## Xử lý sự cố

- **Lỗi kết nối cơ sở dữ liệu**: Kiểm tra connection string và đảm bảo IP của Render.com được cho phép trong whitelist của MongoDB
- **Lỗi build**: Kiểm tra logs trong tab "Logs" của Render.com
- **Lỗi khởi động**: Kiểm tra logs và đảm bảo các biến môi trường đã được thiết lập đúng
