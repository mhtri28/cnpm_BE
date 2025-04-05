# Drink Store Management System

Hệ thống quản lý cửa hàng bán đồ uống với các chức năng quản lý người dùng, sản phẩm, đơn hàng và
kho.

## Yêu cầu hệ thống

- Node.js (>= 20.x)
- MySQL (>= 8.x)
- npm

## Cài đặt

1. Clone repository:

```bash
git clone <https://github.com/mhtri28/cnpm_BE>
cd cnpm_BE
```

2. Cài đặt dependencies:

```bash
npm install
```

3. Tạo file .env từ mẫu:

```bash
cp .env.example .env
```

4. Cấu hình database trong file `.env`:

```env
DATABASE_TYPE=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=your_database
JWT_SECRET=your_jwt_secret
```

## Xác thực và Phân quyền

### JWT Token

Hệ thống sử dụng JWT (JSON Web Token) để xác thực người dùng. Khi đăng nhập thành công, hệ thống sẽ trả về 2 loại token:

1. **Access Token**:

   - Thời gian sống ngắn (mặc định 15 phút)
   - Được sử dụng để truy cập các API được bảo vệ
   - Chứa thông tin người dùng (id, email, role)
   - Được gửi trong header `Authorization: Bearer <access_token>`

2. **Refresh Token**:
   - Thời gian sống dài (mặc định 7 ngày)
   - Dùng để lấy access token mới khi access token hết hạn
   - Không nên sử dụng để truy cập API
   - Được lưu trữ an toàn ở client (httpOnly cookie)

### Quy trình xác thực:

1. Đăng nhập với email/password
2. Hệ thống trả về access token và refresh token
3. Sử dụng access token để gọi API
4. Khi access token hết hạn:
   - Gọi API `/auth/refresh` với refresh token
   - Hệ thống trả về access token mới
5. Khi đăng xuất:
   - Gọi API `/auth/logout`
   - Access token sẽ bị đưa vào blacklist

## Quản lý Database

### Các lệnh migration

```bash
# Tạo migration mới
npm run migration:generate --name=create-users-table

# Chạy tất cả migrations
npm run migration:run

# Hoàn tác migration cuối cùng
npm run migration:revert

# Xóa tất cả bảng và chạy lại migrations
npm run migration:refresh

# Xóa tất cả bảng
npm run migration:drop
```

### Các lệnh seeding

```bash
# Chạy tất cả seeders
npm run db:seed

# Reset hoàn toàn database (xóa bảng + chạy migration + seed)
npm run db:fresh
```

## Business Logic

### Quản lý nhân viên

- Phân quyền nhân viên (Admin, Barista, Inventory Manager)

### Quản lý đơn hàng

- Đơn hàng được tạo bởi Khách hàng
- Barista phụ trách pha chế
- Trạng thái đơn hàng: PENDING -> PREPARING -> READY -> DELIVERED
- Mỗi đơn hàng có thể có nhiều món
- Tính toán tổng tiền tự động

### Quản lý kho

- Do Inventory Manager quản lý
- Theo dõi số lượng nguyên liệu
- Cảnh báo khi nguyên liệu sắp hết
- Lịch sử nhập/xuất kho

## Tài khoản mặc định

Sau khi chạy seeder, hệ thống sẽ tạo các tài khoản mặc định:

1. Admin:

   - Email: admin@example.com
   - Password: password123
   - Quyền: Quản lý toàn bộ hệ thống

2. Bartender:

   - Email: barista@example.com
   - Password: password123
   - Quyền: Chấp nhận đơn hàng, pha chế và cập nhật trạng thái đơn hàng

3. Inventory Manager:

   - Email: inventory@example.com
   - Password: password123
   - Quyền: Tạo đơn nhập hàng mới, quản lý nhà cung cấp.

## Khởi chạy ứng dụng

```bash
# development
npm run start:dev

# production
npm run build
npm run start:prod
```

Ứng dụng sẽ chạy tại: http://localhost:3000

## API Documentation

API documentation được tạo tự động bằng Swagger UI tại: http://localhost:3000/api
