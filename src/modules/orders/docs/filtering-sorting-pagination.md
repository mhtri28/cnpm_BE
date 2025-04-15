# Hướng dẫn sử dụng tính năng lọc, sắp xếp và phân trang

API quản lý đơn đặt hàng (`orders`) hỗ trợ các tính năng tiên tiến để lọc, sắp xếp và phân trang dữ liệu. Tài liệu này cung cấp hướng dẫn chi tiết về cách sử dụng các tính năng này.

## Tổng quan về endpoint

```
GET /orders
```

Endpoint này cho phép bạn truy vấn danh sách đơn đặt hàng với các tùy chọn lọc, sắp xếp và phân trang khác nhau.

## Phân trang

Phân trang giúp bạn chia nhỏ tập kết quả lớn thành các phần nhỏ hơn, dễ quản lý.

### Tham số phân trang

| Tham số | Mô tả                                     | Giá trị mặc định | Ví dụ       |
| ------- | ----------------------------------------- | ---------------- | ----------- |
| `page`  | Số trang hiện tại (bắt đầu từ 1)          | 1                | `?page=2`   |
| `limit` | Số lượng đơn hàng hiển thị trên mỗi trang | 10               | `?limit=20` |

### Ví dụ phân trang

- Lấy trang đầu tiên với 10 kết quả (mặc định):

  ```
  GET /orders
  ```

- Lấy trang thứ 2 với 10 kết quả:

  ```
  GET /orders?page=2
  ```

- Lấy trang đầu tiên với 20 kết quả:

  ```
  GET /orders?limit=20
  ```

- Lấy trang thứ 3 với 15 kết quả:
  ```
  GET /orders?page=3&limit=15
  ```

## Lọc dữ liệu

Lọc dữ liệu cho phép bạn truy xuất chỉ những đơn hàng đáp ứng các tiêu chí cụ thể.

### Tham số lọc

| Tham số        | Mô tả                                 | Ví dụ                |
| -------------- | ------------------------------------- | -------------------- |
| `tableName`    | Lọc theo tên chính xác của bàn        | `?tableName=Bàn 1`   |
| `status`       | Lọc theo trạng thái đơn hàng          | `?status=pending`    |
| `withCanceled` | Bao gồm đơn hàng đã hủy trong kết quả | `?withCanceled=true` |

### Các giá trị trạng thái hợp lệ

- `pending`: Đơn hàng đang chờ xử lý
- `paid`: Đơn hàng đã thanh toán
- `preparing`: Đơn hàng đang được chuẩn bị
- `completed`: Đơn hàng đã hoàn thành
- `canceled`: Đơn hàng đã hủy

### Xử lý đơn hàng đã hủy

- Mặc định, API sẽ **không** trả về các đơn hàng có trạng thái `canceled`, trừ khi bạn:
  - Chỉ định rõ `status=canceled` trong tham số lọc
  - Đặt `withCanceled=true` để hiển thị tất cả đơn hàng bao gồm cả đơn hàng đã hủy

### Ví dụ lọc dữ liệu

- Lấy tất cả đơn hàng từ "Bàn 1":

  ```
  GET /orders?tableName=Bàn 1
  ```

- Lấy tất cả đơn hàng đang chờ xử lý:

  ```
  GET /orders?status=pending
  ```

- Lấy tất cả đơn hàng đã thanh toán từ "Bàn 5":

  ```
  GET /orders?tableName=Bàn 5&status=paid
  ```

- Lấy tất cả đơn hàng bao gồm cả đơn hàng đã hủy:
  ```
  GET /orders?withCanceled=true
  ```

## Sắp xếp dữ liệu

Sắp xếp cho phép bạn quyết định thứ tự hiển thị kết quả.

### Tham số sắp xếp

| Tham số | Mô tả                            | Giá trị mặc định                         | Ví dụ                  |
| ------- | -------------------------------- | ---------------------------------------- | ---------------------- |
| `sort`  | Chỉ định trường và hướng sắp xếp | Theo trình tự quy trình và thời gian tạo | `?sort=createdAt_DESC` |

### Các tùy chọn sắp xếp

| Giá trị          | Mô tả                                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| `createdAt_ASC`  | Sắp xếp theo thời gian tạo (cũ nhất trước)                                                           |
| `createdAt_DESC` | Sắp xếp theo thời gian tạo (mới nhất trước)                                                          |
| `updatedAt_ASC`  | Sắp xếp theo thời gian cập nhật (cũ nhất trước)                                                      |
| `updatedAt_DESC` | Sắp xếp theo thời gian cập nhật (mới nhất trước)                                                     |
| `status_ASC`     | Sắp xếp theo trạng thái (theo quy trình tăng dần: pending → paid → preparing → completed → canceled) |
| `status_DESC`    | Sắp xếp theo trạng thái (theo quy trình giảm dần: canceled → completed → preparing → paid → pending) |

### Sắp xếp nhiều trường

Bạn có thể sắp xếp theo nhiều trường bằng cách phân tách các giá trị bằng dấu phẩy.

### Ví dụ sắp xếp

- Sắp xếp theo thời gian tạo (mới nhất trước):

  ```
  GET /orders?sort=createdAt_DESC
  ```

- Sắp xếp theo trạng thái và sau đó theo thời gian tạo (mới nhất trước):
  ```
  GET /orders?sort=status_ASC,createdAt_DESC
  ```

## Kết hợp lọc, sắp xếp và phân trang

Bạn có thể kết hợp nhiều tham số để có kết quả chính xác hơn.

### Ví dụ kết hợp

- Lấy trang thứ 2 của đơn hàng đang chờ xử lý từ "Bàn 3", sắp xếp theo thời gian tạo (mới nhất trước), với 15 kết quả trên mỗi trang:

  ```
  GET /orders?tableName=Bàn 3&status=pending&sort=createdAt_DESC&page=2&limit=15
  ```

- Hiển thị tất cả đơn hàng bao gồm cả đơn hàng đã hủy, sắp xếp theo trạng thái:
  ```
  GET /orders?withCanceled=true&sort=status_ASC
  ```

## Cấu trúc kết quả phân trang

API trả về kết quả với cấu trúc phân trang tiêu chuẩn:

```json
{
  "items": [
    // Danh sách đơn hàng trên trang hiện tại
  ],
  "total": 100, // Tổng số đơn hàng
  "page": 2, // Trang hiện tại
  "limit": 15, // Số lượng kết quả trên mỗi trang
  "totalPages": 7 // Tổng số trang
}
```

## Lưu ý

- **Thứ tự trạng thái đơn hàng**: Hệ thống sắp xếp trạng thái theo quy trình tự nhiên: pending → paid → preparing → completed → canceled
- **Đơn hàng đã hủy**: Mặc định không hiển thị trong kết quả trừ khi có tham số `withCanceled=true` hoặc lọc cụ thể `status=canceled`
- Phân trang bắt đầu từ 1, không phải từ 0
- Tham số `tableName` yêu cầu khớp chính xác với tên bàn, không hỗ trợ tìm kiếm một phần
