# Hướng Dẫn Tích Hợp Stripe Payment

Module này sử dụng Stripe để xử lý thanh toán. Dưới đây là hướng dẫn chi tiết về cách cấu hình và luồng hoạt động.

## 1. Cấu Hình Stripe

### Bước 1: Tạo tài khoản Stripe

1. Đăng ký tại [dashboard.stripe.com](https://dashboard.stripe.com/register).
2. Sau khi đăng nhập, chuyển sang chế độ **Test Mode** (góc trên bên phải).

### Bước 2: Lấy API Keys

1. Vào **Developers** -> **API keys**.
2. Copy **Secret key** (bắt đầu bằng `sk_test_...`).

### Bước 3: Cấu hình biến môi trường

Thêm vào file `.env` của dự án:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

**Lưu ý:** Đảm bảo `STRIPE_SECRET_KEY` đã được thêm vào `src/common/configs/env.validation.ts` để validation hoạt động đúng (Bạn đã làm bước này).

## 2. Luồng Thanh Toán (Payment Flow)

### Bước 1: Tạo Payment Intent (Client -> Server)

Khi người dùng ở trang Checkout và nhấn "Thanh toán":

1. Client gọi API `POST /api/v1/payments/create-intent`.
2. Gửi body:
    ```json
    {
        "orderId": "id_don_hang",
        "amount": 100.5,
        "currency": "usd"
    }
    ```
3. Server trả về `clientSecret` và `paymentId`.

### Bước 2: Xác nhận thanh toán ở Client (Client -> Stripe)

Sử dụng thư viện `stripe-js` hoặc `react-stripe-js` ở Frontend:

```javascript
// Ví dụ React
const stripe = useStripe();
const elements = useElements();

const result = await stripe.confirmPayment({
    elements,
    confirmParams: {
        return_url: 'https://your-website.com/checkout/success',
    },
    redirect: 'if_required',
});

if (result.error) {
    // Xử lý lỗi
} else {
    // Thanh toán thành công!
    // result.paymentIntent.id là Transaction ID
}
```

### Bước 3: Xác nhận với Server (Client -> Server)

Sau khi Stripe xác nhận thành công (ở bước 2), Client gọi API `POST /api/v1/payments/confirm` để cập nhật trạng thái đơn hàng:

```json
{
    "orderId": "id_don_hang",
    "paymentIntentId": "pi_..." // Lấy từ kết quả bước 2
}
```

Server sẽ:

1. Kiểm tra lại trạng thái payment với Stripe.
2. Cập nhật `Payment` status thành `COMPLETED`.
3. Cập nhật `Order` status thành `PROCESSING`.

## 3. Testing

Bạn có thể sử dụng các thẻ test của Stripe để thử nghiệm:

| Loại thẻ          | Số thẻ                | CVC    | Ngày hết hạn | ZIP    |
| ----------------- | --------------------- | ------ | ------------ | ------ |
| Visa (Thành công) | `4242 4242 4242 4242` | Bất kỳ | Tương lai    | Bất kỳ |
| Thẻ bị từ chối    | `4000 0566 5566 5556` | Bất kỳ | Tương lai    | Bất kỳ |

Chi tiết thêm tại: [Stripe Testing Docs](https://stripe.com/docs/testing)
