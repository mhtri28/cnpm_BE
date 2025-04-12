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
- Trạng thái đơn hàng: PENDING -> PAID -> PREPARING -> COMPLETED -> CANCELED
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

   - Email: admin@coffee.com
   - Password: password123
   - Quyền: Quản lý toàn bộ hệ thống

2. Bartender:

   - Email: barista@coffee.com
   - Password: password123
   - Quyền: Chấp nhận đơn hàng, pha chế và cập nhật trạng thái đơn hàng

3. Inventory Manager:

   - Email: inventory@coffee.com
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

# Hệ Thống Xác Thực và Phân Quyền trong Ứng Dụng Quản Lý Cửa Hàng Đồ Uống

## Giới Thiệu

Tài liệu này mô tả chi tiết cách hoạt động của hệ thống xác thực (Authentication) và phân quyền (Authorization) trong ứng dụng backend NestJS của cửa hàng đồ uống. Hệ thống sử dụng Guards và JWT (JSON Web Tokens) để bảo vệ API và kiểm soát quyền truy cập của người dùng.

## Cấu Trúc Thư Mục

```
/guard
  ├── auth.guard.ts        - Guard xác thực người dùng qua JWT
  ├── role.guard.ts        - Guard kiểm tra quyền của người dùng
  ├── auth.service.ts      - Service xử lý logic xác thực
  ├── guard.module.ts      - Module đăng ký các Guard và Service
  └── dtos/
      └── refreshToken.dto.ts - DTO cho chức năng làm mới token
```

## Quy Trình Xác Thực và Phân Quyền

### 1. Đăng Ký và Đăng Nhập

Quá trình xác thực bắt đầu với việc đăng ký và đăng nhập người dùng:

- **Đăng Ký (`AuthService.register`)**:

  - Kiểm tra email đã tồn tại chưa
  - Mã hóa mật khẩu với bcrypt
  - Lưu thông tin người dùng vào database
  - Tạo và trả về access_token và refresh_token

- **Đăng Nhập (`AuthService.signIn`)**:
  - Xác thực email và mật khẩu
  - Tạo và trả về access_token và refresh_token

### 2. Xác Thực Người Dùng với AuthGuard

`AuthGuard` là một middleware implement interface `CanActivate` của NestJS, được sử dụng để xác thực JWT token trong mỗi request:

1. **Trích xuất Token**: Lấy JWT token từ header `Authorization`
2. **Xác thực Token**: Dùng `JwtService` để xác minh tính hợp lệ của token
3. **Xác thực Người Dùng**: Gọi `AuthService.validateUser()` để kiểm tra người dùng có tồn tại trong hệ thống
4. **Lưu Thông Tin Người Dùng**: Đính kèm thông tin người dùng vào request để sử dụng trong các controller

Code chính của `AuthGuard`:

```typescript
async canActivate(context: ExecutionContext): Promise<boolean> {
  const request = context.switchToHttp().getRequest();
  const token = this.extractTokenFromHeader(request);
  if (!token) {
    throw new UnauthorizedException('No token provided');
  }
  try {
    // Xác thực token
    const payload = await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_SECRET,
    });

    // Lấy thông tin user từ AuthService
    const user = await this.authService.validateUser(payload.sub);

    if (!user) {
      throw new BadRequestException('User not belong to token, please try again!');
    }

    // Lưu thông tin user vào request
    request.currentUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
  } catch (error) {
    throw new UnauthorizedException('Invalid token');
  }
  return true;
}
```

### 3. Phân Quyền với RoleGuard

`RoleGuard` kiểm tra xem người dùng đã xác thực có quyền truy cập vào endpoint cụ thể hay không:

1. **Lấy Yêu Cầu Vai Trò**: Sử dụng `Reflector` để lấy metadata từ các custom decorator `@Roles()`
2. **Kiểm Tra Quyền**: So sánh vai trò của người dùng hiện tại với vai trò được yêu cầu
3. **Quản Lý Truy Cập**: Cho phép hoặc từ chối truy cập dựa trên kết quả so sánh

Code chính của `RoleGuard`:

```typescript
canActivate(context: ExecutionContext): boolean {
  // Lấy các role được yêu cầu từ decorator
  const requiredRoles = this.reflector.get<EmployeeRole[]>(
    ROLE_KEY,
    context.getHandler(),
  );

  // Nếu không có role nào được yêu cầu, cho phép truy cập
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // Lấy đối tượng request từ context
  const request = context.switchToHttp().getRequest();
  const currentUser = request.currentUser;

  // Nếu không có currentUser (chưa xác thực), từ chối truy cập
  if (!currentUser) {
    throw new ForbiddenException('User not authenticated');
  }

  // Kiểm tra xem user có role phù hợp không
  const hasRequiredRole = requiredRoles.includes(currentUser.role);

  if (!hasRequiredRole) {
    throw new ForbiddenException(
      `Required role: ${requiredRoles.join(', ')}. Your role: ${currentUser.role}`,
    );
  }

  return true;
}
```

### 4. Custom Decorator cho Phân Quyền

Decorator `@Roles()` được sử dụng để đánh dấu endpoint yêu cầu quyền cụ thể:

```typescript
export const ROLE_KEY = 'role';
export const Roles = (...role: EmployeeRole[]) => SetMetadata(ROLE_KEY, role);
```

Sử dụng trong controller:

```typescript
@Get('admin-only')
@Roles(EmployeeRole.ADMIN)
@UseGuards(AuthGuard, RoleGuard)
getAdminData() {
  return { message: 'Dữ liệu chỉ dành cho Admin' };
}
```

### 5. Làm Mới Token

Hệ thống có cơ chế làm mới token khi access_token hết hạn:

```typescript
async refreshToken(refreshTokenDto: RefreshTokenDto) {
  const { refresh_token } = refreshTokenDto;

  try {
    const payload = await this.jwtService.verifyAsync(refresh_token, {
      secret: process.env.JWT_SECRET,
    });

    const newAccessToken = await this.jwtService.signAsync(
      {
        sub: payload.sub,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        role: payload.role,
      },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      },
    );

    return {
      message: 'Refresh token thành công',
      access_token: newAccessToken,
    };
  } catch (err) {
    throw new UnauthorizedException(
      'Refresh token không hợp lệ hoặc đã hết hạn',
    );
  }
}
```

## Vai Trò Người Dùng

Hệ thống hỗ trợ 3 vai trò chính:

```typescript
export enum EmployeeRole {
  ADMIN = 'admin',
  BARISTA = 'barista',
  INVENTORY_MANAGER = 'inventory_manager',
}
```

- **ADMIN**: Có toàn quyền truy cập vào tất cả tính năng
- **BARISTA**: Nhân viên pha chế, quản lý đơn hàng
- **INVENTORY_MANAGER**: Quản lý kho hàng và nguyên liệu

## Cách Sử Dụng Guards

Để bảo vệ route với xác thực và phân quyền:

```typescript
// Yêu cầu đăng nhập
@UseGuards(AuthGuard)
@Get('profile')
getProfile(@Request() req) {
  return req.currentUser;
}

// Yêu cầu quyền cụ thể
@UseGuards(AuthGuard, RoleGuard)
@Roles(EmployeeRole.ADMIN)
@Get('admin-dashboard')
getAdminDashboard() {
  // Logic xử lý
}
```

## Tóm Tắt Luồng Hoạt Động

1. Người dùng đăng nhập và nhận JWT token
2. Người dùng gửi request kèm token trong header Authorization
3. `AuthGuard` kiểm tra tính hợp lệ của token và xác thực người dùng
4. `RoleGuard` kiểm tra quyền của người dùng dựa trên decorator `@Roles()`
5. Nếu tất cả guard cho phép, controller xử lý request và trả về response

Hệ thống này đảm bảo rằng chỉ những người dùng đã xác thực và có quyền thích hợp mới có thể truy cập các endpoint được bảo vệ trong ứng dụng.
