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

4. Cấu hình database trong file `ormconfig.ts`:

```typescript
{
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'your_username',
  password: 'your_password',
  database: 'your_database'
}
```

## Khởi tạo database
0. Thay đỏi file env để kết nối với database


1. Chạy migrations để tạo cấu trúc database:

```bash
npm run migration:run
```

1.1 Xóa tất cả bảng trong database để reset
npm run migration:drop
```

2. Chạy seeders để tạo dữ liệu mẫu:

```bash
npm run db:seed
```

## Tài khoản mặc định

Sau khi chạy seeder, hệ thống sẽ tạo 3 tài khoản mặc định:

1. Admin:

   - Email: admin@example.com
   - Password: password123

2. Nhân viên bán hàng:

   - Email: sales@example.com
   - Password: password123

3. Nhân viên kho:
   - Email: inventory@example.com
   - Password: password123

## Khởi chạy ứng dụng

```bash
# development
npm run start:dev

# production
npm run build
npm run start:prod
```

Ứng dụng sẽ chạy tại: http://localhost:3000
