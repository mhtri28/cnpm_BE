# Food Store Management System

Hệ thống quản lý cửa hàng bán đồ ăn với các chức năng quản lý người dùng, sản phẩm, đơn hàng và kho.

## Yêu cầu hệ thống

- Node.js (>= 20.x)
- MySQL (>= 8.x)
- npm

## Cài đặt

1. Clone repository:

```bash
git clone <repository-url>
cd food-store-management
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

## Quy ước code

### Quy ước đặt tên

- **TypeScript/JavaScript**: Sử dụng camelCase cho tên biến, hàm và thuộc tính
  ```typescript
  const userName = 'John';
  function getUserById() {}
  class UserService {}
  ```
- **Database**: Sử dụng snake_case cho tên cột và bảng
  ```sql
  CREATE TABLE user_roles (
    user_id INT,
    role_id INT
  );
  ```
- **TypeORM**: Tự động map giữa camelCase (TypeScript) và snake_case (Database)
  ```typescript
  @Column({ name: 'user_name' })
  userName: string;
  ```

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

### Quản lý người dùng

- Phân quyền người dùng (Admin, Waiter, Bartender)
- Mỗi người dùng có thể có nhiều vai trò
- Mỗi vai trò có nhiều quyền hạn

### Quản lý đơn hàng

- Đơn hàng được tạo bởi Waiter
- Bartender phụ trách pha chế
- Trạng thái đơn hàng: PENDING -> PREPARING -> READY -> DELIVERED
- Mỗi đơn hàng có thể có nhiều món
- Tính toán tổng tiền tự động

### Quản lý kho

- Theo dõi số lượng nguyên liệu
- Cảnh báo khi nguyên liệu sắp hết
- Lịch sử nhập/xuất kho

## Tài khoản mặc định

Sau khi chạy seeder, hệ thống sẽ tạo các tài khoản mặc định:

1. Admin:

   - Email: admin@example.com
   - Password: password123
   - Quyền: Quản lý toàn bộ hệ thống

2. Waiter:

   - Email: waiter@example.com
   - Password: password123
   - Quyền: Tạo và quản lý đơn hàng

3. Bartender:
   - Email: bartender@example.com
   - Password: password123
   - Quyền: Pha chế và cập nhật trạng thái đơn hàng

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
