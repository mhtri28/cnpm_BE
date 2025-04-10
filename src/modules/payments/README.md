# Module Thanh Toán VNPAY

Module này cung cấp các API để tích hợp thanh toán VNPay vào hệ thống quản lý cửa hàng đồ uống.

## Luồng Hoạt Động Của Quy Trình Thanh Toán

Quy trình thanh toán được thực hiện theo các bước sau:

1. **Người dùng chọn đồ uống và tạo đơn hàng**

   - Frontend hiển thị danh sách đồ uống và giỏ hàng
   - Người dùng thêm sản phẩm vào giỏ và tiến hành thanh toán

2. **Tạo thanh toán**

   - Frontend gọi API `POST /payments/create-payment` với thông tin đơn hàng
   - Backend tạo bản ghi payment và URL thanh toán VNPay
   - Backend trả về URL thanh toán cho Frontend

3. **Chuyển hướng người dùng đến trang thanh toán VNPay**

   - Frontend nhận URL thanh toán từ backend
   - Frontend chuyển hướng người dùng đến trang thanh toán VNPay
   - Người dùng hoàn thành thanh toán trên cổng thanh toán VNPay

4. **Xử lý kết quả thanh toán**

   - Sau khi thanh toán, VNPay chuyển hướng người dùng về URL Return đã được cấu hình
   - Backend xử lý callback từ VNPay và xác thực thông tin thanh toán
   - Nếu thanh toán thành công, backend cập nhật trạng thái đơn hàng thành "paid"
   - Backend chuyển hướng người dùng đến trang thành công/thất bại tương ứng

5. **Xử lý thông báo IPN (Instant Payment Notification)**

   - VNPay gửi thông báo IPN đến backend
   - Backend xác thực thông báo IPN và cập nhật trạng thái đơn hàng
   - Backend trả về mã xác nhận cho VNPay

6. **Hoàn thành đơn hàng**
   - Các quy trình nghiệp vụ tiếp theo được kích hoạt sau khi đơn hàng đã được thanh toán
   - Frontend hiển thị thông tin xác nhận đơn hàng cho người dùng

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
  "method": "vnpay"
}
```

**Response:**

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
      "transactionId": 1633456789,
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

### 1. Khởi Tạo Thanh Toán

Khi người dùng chọn món và nhấn nút thanh toán, frontend cần thực hiện các bước sau:

```javascript
// Ví dụ sử dụng JavaScript/TypeScript với Axios
async function createPayment(orderId, totalAmount) {
  try {
    const response = await axios.post('/api/payments/create-payment', {
      orderId,
      totalAmount,
      method: 'vnpay',
    });

    if (response.data.success) {
      // Chuyển hướng người dùng đến URL thanh toán VNPay
      window.location.href = response.data.data.paymentUrl;
    } else {
      // Xử lý lỗi
      showError('Không thể tạo thanh toán');
    }
  } catch (error) {
    console.error('Lỗi khi tạo thanh toán:', error);
    showError('Đã xảy ra lỗi khi xử lý thanh toán');
  }
}
```

### 2. Xử Lý Kết Quả Thanh Toán

Frontend cần chuẩn bị các trang để hiển thị kết quả thanh toán:

1. **Trang Thanh Toán Thành Công (`/payment-success`)**

```javascript
// Ví dụ sử dụng JavaScript/TypeScript với React
function PaymentSuccessPage() {
  const [orderDetails, setOrderDetails] = useState(null);
  const { orderId } = useQueryParams();

  useEffect(() => {
    if (orderId) {
      // Lấy thông tin thanh toán từ API
      axios
        .get(`/api/payments/order/${orderId}`)
        .then((response) => {
          setOrderDetails(response.data);
        })
        .catch((error) => {
          console.error('Lỗi khi lấy thông tin thanh toán:', error);
        });
    }
  }, [orderId]);

  return (
    <div className="payment-success">
      <h2>Thanh toán thành công!</h2>
      {orderDetails && (
        <div className="order-details">
          <p>Mã đơn hàng: {orderDetails.orderId}</p>
          <p>Số tiền: {formatCurrency(orderDetails.totalAmount)}</p>
          <p>Thời gian: {formatDate(orderDetails.updatedAt)}</p>
        </div>
      )}
      <button onClick={() => navigate('/orders')}>Xem đơn hàng của tôi</button>
    </div>
  );
}
```

2. **Trang Thanh Toán Thất Bại (`/payment-failed`)**

```javascript
// Ví dụ sử dụng JavaScript/TypeScript với React
function PaymentFailedPage() {
  const { message } = useQueryParams();

  return (
    <div className="payment-failed">
      <h2>Thanh toán không thành công</h2>
      {message && (
        <p className="error-message">{decodeURIComponent(message)}</p>
      )}
      <button onClick={() => navigate('/cart')}>Quay lại giỏ hàng</button>
      <button onClick={() => navigate('/')}>Tiếp tục mua sắm</button>
    </div>
  );
}
```

## Lưu ý Quan Trọng

1. **Bảo mật**

   - Không lưu trữ thông tin thẻ thanh toán hoặc dữ liệu nhạy cảm
   - Luôn xác thực các thông tin trả về từ VNPay trước khi cập nhật trạng thái thanh toán

2. **Xử lý lỗi**

   - Luôn kiểm tra và ghi log lỗi
   - Cung cấp thông báo rõ ràng cho người dùng khi có lỗi xảy ra

3. **Kiểm thử**
   - Sử dụng môi trường sandbox của VNPay để kiểm thử trước khi triển khai
   - Kiểm tra kỹ các trường hợp đặc biệt: thanh toán thất bại, gián đoạn mạng, v.v.

## Cấu Hình

Các thông tin cấu hình thanh toán được lưu trong file `.env`:

```
VNPAY_TMN_CODE=VAAJN51S
VNPAY_SECURE_SECRET=UNOBMR165GLWAXUC51RO1I89FWIBH6V8
VNPAY_HOST=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/api/payments/vnpay-return
VNPAY_IPN_URL=https://sandbox.vnpayment.vn/vnpaygw-sit-testing/user/login
```

## Tài Liệu Tham Khảo

- [Trang chủ VNPay](https://vnpay.vn)
- [Tài liệu VNPay API](https://vnpay.js.org)
