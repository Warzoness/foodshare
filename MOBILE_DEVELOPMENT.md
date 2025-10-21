# Hướng dẫn phát triển trên điện thoại

## Vấn đề
Quyền truy cập vị trí (Geolocation API) chỉ hoạt động trên:
- HTTPS (https://)
- Localhost (http://localhost)

Khi dùng điện thoại truy cập localhost của máy tính, nó không được coi là "localhost" nên bị chặn.

## Giải pháp

### 1. Sử dụng IP thực của máy tính (Đơn giản nhất)

#### Bước 1: Tìm IP của máy tính
```bash
# Windows
ipconfig

# macOS/Linux
ifconfig
```

Tìm dòng có dạng: `IPv4 Address. . . . . . . . . . . : 192.168.1.100`

#### Bước 2: Chạy Next.js với network access
```bash
# Cách 1: Sử dụng script có sẵn
npm run dev:network

# Cách 2: Chạy trực tiếp
npx next dev -H 0.0.0.0
```

#### Bước 3: Truy cập từ điện thoại
Thay vì `http://localhost:3000`, dùng:
`http://192.168.1.100:3000` (thay IP thực của bạn)

### 2. Sử dụng ngrok (Khuyến nghị cho production)

#### Bước 1: Cài đặt ngrok
```bash
npm install -g ngrok
```

#### Bước 2: Tạo HTTPS tunnel
```bash
# Terminal 1: Chạy Next.js
npm run dev

# Terminal 2: Tạo tunnel
ngrok http 3000
```

#### Bước 3: Sử dụng URL ngrok
Ngrok sẽ tạo URL như: `https://abc123.ngrok.io`

### 3. Cấu hình Chrome trên điện thoại (Tạm thời)

#### Android Chrome:
1. Mở Chrome
2. Vào `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
3. Thêm IP của máy tính: `http://192.168.1.100:3000`
4. Restart Chrome

## Kiểm tra

### 1. Xem console log
Mở Developer Tools trên điện thoại để xem:
- `🌍 Geolocation not available - requires HTTPS or localhost`
- Các lỗi liên quan đến vị trí

### 2. Kiểm tra network
Đảm bảo điện thoại và máy tính cùng mạng WiFi.

### 3. Test tính năng vị trí
- Vào trang có tính năng vị trí
- Xem có thông báo cảnh báo không
- Kiểm tra xem có thể lấy vị trí không

## Troubleshooting

### Lỗi "Geolocation not available"
- Kiểm tra URL có đúng format không
- Đảm bảo đang dùng HTTPS hoặc localhost
- Kiểm tra kết nối mạng

### Không thể truy cập từ điện thoại
- Kiểm tra firewall của máy tính
- Đảm bảo cùng mạng WiFi
- Thử restart Next.js server

### Vị trí không chính xác
- Kiểm tra quyền truy cập vị trí trên điện thoại
- Đảm bảo GPS được bật
- Thử di chuyển ra ngoài trời

## Lưu ý

1. **Bảo mật**: Chỉ dùng IP thực trong môi trường development
2. **Performance**: Ngrok có thể chậm hơn localhost
3. **Stability**: IP có thể thay đổi khi restart router
4. **HTTPS**: Ngrok tự động cung cấp HTTPS

## Scripts có sẵn

```bash
# Chạy với network access
npm run dev:network

# Chạy bình thường
npm run dev
```

Script `dev:network` sẽ:
- Tự động tìm IP của máy tính
- Hiển thị URL để truy cập từ điện thoại
- Chạy Next.js với host 0.0.0.0



