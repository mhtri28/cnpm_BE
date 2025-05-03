# Module Thanh Toán

Module này cung cấp các API để tích hợp thanh toán cho hệ thống quản lý cửa hàng đồ uống, hỗ trợ thanh toán qua VNPay và tiền mặt.

## Luồng Hoạt Động Của Quy Trình Đặt Món và Thanh Toán

Quy trình đặt món và thanh toán được thực hiện theo các bước sau:

1. **Người dùng vào quán và quét mã QR trên bàn**

   - Mỗi bàn được gắn một mã QR chứa thông tin tableId
   - Người dùng quét mã QR được chuyển hướng đến trang đặt món với tableId được truyền trong URL

2. **Người dùng chọn món và tạo đơn hàng**

   - Frontend hiển thị menu đồ uống
   - Người dùng chọn đồ uống và số lượng
   - Khi nhấn nút thanh toán, frontend gửi request tạo đơn hàng (order) với trạng thái "pending" và tableId

3. **Tạo thanh toán**

   - Sau khi tạo order, frontend gọi API `POST /payments/create-payment` với thông tin orderId, tổng tiền và phương thức thanh toán
   - Backend tạo bản ghi payment

4. **Xử lý theo phương thức thanh toán**

   - **Nếu thanh toán tiền mặt (cash)**:

     - Backend tự động cập nhật trạng thái payment thành "completed"
     - Backend cập nhật trạng thái đơn hàng thành "paid"
     - Backend trả về thông tin thanh toán đã hoàn thành
     - Frontend hiển thị thông báo thanh toán tiền mặt thành công

   - **Nếu thanh toán VNPay**:
     - Backend tạo URL thanh toán VNPay
     - Backend trả về URL thanh toán cho Frontend
     - Frontend chuyển hướng người dùng đến trang thanh toán VNPay
     - Người dùng hoàn thành thanh toán trên cổng thanh toán VNPay

5. **Xử lý kết quả thanh toán VNPay**

   - Sau khi thanh toán, VNPay chuyển hướng người dùng về URL Return đã được cấu hình
   - Backend xử lý callback từ VNPay và xác thực thông tin thanh toán
   - Backend cập nhật trạng thái payment thành "completed" (thành công) hoặc "failed" (thất bại)
   - Backend tự động cập nhật trạng thái đơn hàng thành "paid" nếu thanh toán thành công
   - Frontend nhận thông tin kết quả thanh toán và hiển thị cho người dùng

6. **Xử lý thông báo IPN (Instant Payment Notification) từ VNPay**

   - VNPay gửi thông báo IPN đến backend
   - Backend xác thực thông báo IPN và cập nhật trạng thái payment (nếu cần)
   - Backend tự động cập nhật trạng thái order thành "paid" nếu thanh toán thành công
   - Backend trả về mã xác nhận cho VNPay

7. **Hoàn thành đơn hàng**
   - Khi đơn hàng có trạng thái "paid", nhân viên nhận thông báo và bắt đầu pha chế
   - Khi hoàn thành món, nhân viên cập nhật trạng thái đơn hàng thành "completed"
   - Người dùng nhận được thông báo khi đơn hàng hoàn thành

## Sự khác biệt giữa Payment Status và Order Status

Điều quan trọng cần lưu ý là có hai trạng thái riêng biệt cần theo dõi:

1. **Payment Status**: Phản ánh trạng thái thanh toán

   - **pending**: Đang chờ thanh toán
   - **completed**: Thanh toán thành công
   - **failed**: Thanh toán thất bại

2. **Order Status**: Phản ánh trạng thái đơn hàng
   - **pending**: Đơn hàng mới tạo, chưa thanh toán
   - **paid**: Đơn hàng đã thanh toán, đang chờ xử lý
   - **preparing**: Đơn hàng đã được tiếp nhận bởi nhân viên pha chế
   - **completed**: Đơn hàng đã hoàn thành
   - **canceled**: Đơn hàng đã bị hủy

## API Endpoints

### 1. Tạo Thanh Toán

```
POST /payments/create-payment
```

**Request Body:**

```json
{
  "orderId": "order-123",
  "totalAmount": 100000,
  "method": "cash" // hoặc "vnpay"
}
```

**Response cho thanh toán tiền mặt:**

```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "payment-123",
      "orderId": "order-123",
      "totalAmount": 100000,
      "method": "cash",
      "status": "completed",
      "transactionId": null,
      "createdAt": "2023-10-05T08:30:45.000Z",
      "updatedAt": "2023-10-05T08:30:45.000Z"
    },
    "message": "Thanh toán tiền mặt đã được ghi nhận"
  }
}
```

**Response cho thanh toán VNPay:**

```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_...",
    "payment": {
      "id": "payment-123",
      "orderId": "order-123",
      "totalAmount": 100000,
      "method": "vnpay",
      "status": "pending",
      "transactionId": null,
      "createdAt": "2023-10-05T08:30:45.000Z",
      "updatedAt": "2023-10-05T08:30:45.000Z"
    }
  }
}
```

### 2. Xử Lý Callback Từ VNPay

```
GET /payments/vnpay-return?vnp_TxnRef=payment-123&vnp_Amount=10000000&vnp_ResponseCode=00...
```

**Response:**

- Chuyển hướng đến `/payment-success?orderId=order-123` nếu thanh toán thành công
- Chuyển hướng đến `/payment-failed?message=Lỗi thanh toán` nếu thanh toán thất bại

### 3. Xử Lý IPN Từ VNPay

```
GET /payments/vnpay-ipn?vnp_TxnRef=payment-123&vnp_Amount=10000000&vnp_ResponseCode=00...
```

**Response:**

```json
{
  "RspCode": "00",
  "Message": "Xác nhận thành công"
}
```

### 4. Lấy Thông Tin Thanh Toán Theo ID Đơn Hàng

```
GET /payments/order/order-123
```

**Response:**

```json
{
  "id": "payment-123",
  "orderId": "order-123",
  "totalAmount": 100000,
  "method": "vnpay",
  "status": "completed",
  "transactionId": 1633456789,
  "createdAt": "2023-10-05T08:30:45.000Z",
  "updatedAt": "2023-10-05T08:31:30.000Z"
}
```

### 5. Lấy Thông Tin Thanh Toán Theo ID Thanh Toán

```
GET /payments/payment-123
```

**Response:**

```json
{
  "id": "payment-123",
  "orderId": "order-123",
  "totalAmount": 100000,
  "method": "vnpay",
  "status": "completed",
  "transactionId": 1633456789,
  "createdAt": "2023-10-05T08:30:45.000Z",
  "updatedAt": "2023-10-05T08:31:30.000Z"
}
```

## Hướng Dẫn Cho Frontend

### 1. Quy Trình Đặt Món và Thanh Toán

```javascript
// 1. Xử lý URL từ mã QR
function handleQRScan() {
  // URL sau khi quét QR: https://your-app.com/menu?tableId=table-45
  const urlParams = new URLSearchParams(window.location.search);
  const tableId = urlParams.get('tableId');

  if (!tableId) {
    showError('Mã QR không hợp lệ');
    return;
  }

  // Lưu tableId vào localStorage để sử dụng sau này
  localStorage.setItem('tableId', tableId);

  // Hiển thị menu
  loadMenu();
}

// 2. Tạo đơn hàng
async function createOrder(items) {
  try {
    const tableId = localStorage.getItem('tableId');
    const orderData = {
      tableId,
      orderItems: items.map((item) => ({
        drinkId: item.id,
        quantity: item.quantity,
      })),
    };

    const orderResponse = await axios.post('/api/orders', orderData);
    const orderId = orderResponse.data.id;

    // Sau khi tạo đơn hàng, tiến hành tạo thanh toán
    return orderId;
  } catch (error) {
    console.error('Lỗi khi tạo đơn hàng:', error);
    showError('Đã xảy ra lỗi khi tạo đơn hàng');
    throw error;
  }
}

// 3. Tạo thanh toán - Phương thức VNPay
async function createVNPayPayment(orderId, totalAmount) {
  try {
    const response = await axios.post('/api/payments/create-payment', {
      orderId,
      totalAmount,
      method: 'vnpay',
    });

    if (response.data.success) {
      // Lưu orderId vào localStorage để sử dụng khi xử lý kết quả thanh toán
      localStorage.setItem('currentOrderId', orderId);

      // Chuyển hướng người dùng đến URL thanh toán VNPay
      window.location.href = response.data.data.paymentUrl;
    } else {
      // Xử lý lỗi
      showError('Không thể tạo thanh toán');
    }
  } catch (error) {
    console.error('Lỗi khi tạo thanh toán:', error);
    showError('Đã xảy ra lỗi khi xử lý thanh toán');
    throw error;
  }
}

// 4. Tạo thanh toán - Phương thức tiền mặt
async function createCashPayment(orderId, totalAmount) {
  try {
    const response = await axios.post('/api/payments/create-payment', {
      orderId,
      totalAmount,
      method: 'cash',
    });

    if (response.data.success) {
      // Hiển thị thông báo thanh toán thành công
      showSuccessMessage('Thanh toán tiền mặt thành công!');

      // Hiển thị thông tin thanh toán
      displayOrderDetails(response.data.data.payment);

      // Xóa dữ liệu đơn hàng hiện tại trong localStorage
      localStorage.removeItem('currentOrderId');

      return response.data.data.payment;
    } else {
      // Xử lý lỗi
      showError('Không thể tạo thanh toán');
    }
  } catch (error) {
    console.error('Lỗi khi tạo thanh toán:', error);
    showError('Đã xảy ra lỗi khi xử lý thanh toán');
    throw error;
  }
}
```

### 2. Xử Lý Kết Quả Thanh Toán VNPay

#### Trang Thanh Toán Thành Công (`/payment-success`)

```javascript
// Xử lý khi thanh toán thành công
async function handlePaymentSuccess() {
  // Lấy orderId từ URL
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('orderId');

  if (!orderId) {
    showError('Không tìm thấy thông tin đơn hàng');
    return;
  }

  try {
    // Lấy thông tin thanh toán
    const paymentResponse = await axios.get(`/api/payments/order/${orderId}`);

    if (paymentResponse.data) {
      // Hiển thị thông tin thành công cho người dùng
      showSuccessMessage('Thanh toán thành công!');
      displayOrderDetails(paymentResponse.data);
    }
  } catch (error) {
    console.error('Lỗi khi lấy thông tin thanh toán:', error);
    showError('Đã xảy ra lỗi khi lấy thông tin thanh toán');
  }
}
```

#### Trang Thanh Toán Thất Bại (`/payment-failed`)

```javascript
// Xử lý khi thanh toán thất bại
async function handlePaymentFailed() {
  // Lấy thông báo lỗi từ URL
  const urlParams = new URLSearchParams(window.location.search);
  const errorMessage =
    urlParams.get('message') || 'Thanh toán không thành công';

  // Hiển thị thông tin thất bại cho người dùng
  showErrorMessage(errorMessage);

  // Hiển thị các lựa chọn cho người dùng (thử lại, chọn phương thức thanh toán khác, hủy đơn hàng...)
  displayPaymentOptions();
}
```

## Lưu ý Quan Trọng

1. **Xử lý Payment và Order Status**

   - Với thanh toán tiền mặt, cả trạng thái payment và order đều được cập nhật tự động
   - Với thanh toán VNPay, backend tự động cập nhật trạng thái order khi thanh toán thành công
   - Không cần gửi request thủ công để cập nhật trạng thái đơn hàng sau khi thanh toán thành công

2. **Bảo mật**

   - Không lưu trữ thông tin thẻ thanh toán hoặc dữ liệu nhạy cảm
   - Luôn xác thực các thông tin trả về từ VNPay trước khi cập nhật trạng thái thanh toán
   - Kiểm tra tableId từ QR code để đảm bảo hợp lệ

3. **Xử lý lỗi**

   - Luôn kiểm tra và ghi log lỗi
   - Cung cấp thông báo rõ ràng cho người dùng khi có lỗi xảy ra
   - Đặc biệt chú ý các trường hợp mất kết nối trong quá trình thanh toán

4. **Kiểm thử**
   - Sử dụng môi trường sandbox của VNPay để kiểm thử trước khi triển khai
   - Kiểm tra kỹ các trường hợp đặc biệt: thanh toán thất bại, gián đoạn mạng, v.v.
   - Kiểm tra luồng hoàn chỉnh từ quét QR đến hoàn thành đơn hàng
   - Đảm bảo kiểm tra cả hai phương thức thanh toán: tiền mặt và VNPay

## Cấu Hình

Các thông tin cấu hình thanh toán được lưu trong file `.env`:

```
VNPAY_TMN_CODE=VAAJN51S
VNPAY_SECURE_SECRET=UNOBMR165GLWAXUC51RO1I89FWIBH6V8
VNPAY_HOST=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/api/v1/payments/vnpay-return
VNPAY_IPN_URL=http://localhost:3000/api/v1/payments/vnpay-ipn
```

## Tài Liệu Tham Khảo

- [Trang chủ VNPay](https://vnpay.vn)
- [Tài liệu VNPay API](https://vnpay.js.org)
