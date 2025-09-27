# API Curl Examples

## Lấy danh sách orders của user

### 1. Lấy tất cả orders (cơ bản)
```bash
curl -X GET "https://foodshare-production-98da.up.railway.app/orders" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### 2. Lấy orders với pagination
```bash
curl -X GET "https://foodshare-production-98da.up.railway.app/orders?page=0&size=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### 3. Lấy orders theo status
```bash
curl -X GET "https://foodshare-production-98da.up.railway.app/orders?page=0&size=10&status=PENDING" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### 4. Lấy order theo ID
```bash
curl -X GET "https://foodshare-production-98da.up.railway.app/orders/123" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

## Các status có thể sử dụng:
- `PENDING` - Đang chờ xử lý
- `CONFIRMED` - Đã xác nhận
- `PREPARING` - Đang chuẩn bị
- `READY` - Sẵn sàng
- `PICKED_UP` - Đã lấy
- `CANCELLED` - Đã hủy
- `EXPIRED` - Đã hết hạn

## Lưu ý:
- Thay `YOUR_TOKEN_HERE` bằng token thực tế
- Token có thể lấy từ localStorage sau khi đăng nhập
- API trả về JSON format

## Tìm kiếm sản phẩm theo tên

### 1. Tìm kiếm cơ bản theo tên sản phẩm
```bash
curl -X GET "https://foodshare-production-98da.up.railway.app/products?q=bánh mì&page=0&size=10" \
  -H "Content-Type: application/json"
```

### 2. Tìm kiếm với phân trang
```bash
curl -X GET "https://foodshare-production-98da.up.railway.app/products?q=phở&page=0&size=20" \
  -H "Content-Type: application/json"
```

### 3. Tìm kiếm với vị trí (latitude, longitude)
```bash
curl -X GET "https://foodshare-production-98da.up.railway.app/products?q=cơm tấm&page=0&size=10&latitude=10.7769&longitude=106.7009" \
  -H "Content-Type: application/json"
```

### 4. Tìm kiếm tất cả sản phẩm (không có tên)
```bash
curl -X GET "https://foodshare-production-98da.up.railway.app/products?page=0&size=10" \
  -H "Content-Type: application/json"
```

### 5. Tìm kiếm với từ khóa tiếng Việt
```bash
curl -X GET "https://foodshare-production-98da.up.railway.app/products?q=bún bò huế&page=0&size=15" \
  -H "Content-Type: application/json"
```

## Tham số tìm kiếm:
- `q`: Tên sản phẩm cần tìm (có thể là từ khóa)
- `page`: Trang hiện tại (bắt đầu từ 0)
- `size`: Số lượng sản phẩm mỗi trang
- `latitude`: Vĩ độ (tùy chọn)
- `longitude`: Kinh độ (tùy chọn)

## Test với Postman:
1. Import các curl commands trên
2. Thay token trong Authorization header (nếu cần)
3. Chạy request để test API

