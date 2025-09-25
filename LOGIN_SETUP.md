# 🔐 HƯỚNG DẪN CẤU HÌNH LOGIN

## 1. Tạo file `.env.local` trong root project

```bash
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here

# Facebook OAuth Configuration  
NEXT_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id-here

# API Configuration
API_BASE_URLS=https://foodshare-production-98da.up.railway.app
API_PROXY_TIMEOUT=8000
API_PROXY_MAX_RETRIES=1

# JWT Secret (for server-side verification)
JWT_SECRET=your-jwt-secret-key-here
```

## 2. Cấu hình Google OAuth

### Bước 1: Tạo Google Cloud Project
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Bật Google+ API

### Bước 2: Tạo OAuth 2.0 Credentials
1. Vào **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Chọn **Web application**
4. Thêm **Authorized JavaScript origins**:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
5. Thêm **Authorized redirect URIs**:
   - `http://localhost:3000/auth/login` (development)
   - `https://yourdomain.com/auth/login` (production)
6. Copy **Client ID** và paste vào `.env.local`

## 3. Cấu hình Facebook OAuth

### Bước 1: Tạo Facebook App
1. Truy cập [Facebook Developers](https://developers.facebook.com/)
2. Click **Create App** > **Consumer** > **Next**
3. Điền thông tin app:
   - **App Name**: FoodShare
   - **App Contact Email**: your-email@example.com
   - **App Purpose**: Other

### Bước 2: Cấu hình Facebook Login
1. Vào **Products** > **Facebook Login** > **Set Up**
2. Chọn **Web** platform
3. Thêm **Site URL**:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
4. Vào **Settings** > **Basic**
5. Copy **App ID** và paste vào `.env.local`

## 4. Cấu hình Backend API

### Cập nhật AuthService để gọi API thật:

```typescript
// src/services/site/auth.service.ts
const AUTH_ENDPOINT = "/api/auth"; // Thay đổi endpoint nếu cần
```

### Backend cần hỗ trợ endpoints:
- `POST /api/auth/social` - Social login
- `GET /api/users/{id}` - Get user info
- `PUT /api/users/{id}` - Update user info

## 5. Test Login

### Chạy ứng dụng:
```bash
npm run dev
```

### Truy cập:
- `http://localhost:3000/auth/login`

### Kiểm tra Console:
- Mở Developer Tools > Console
- Click "Đăng nhập với Google/Facebook"
- Xem logs để debug

## 6. Debug Information

Login page sẽ hiển thị:
- ✅ **SDK Loading Status**
- ✅ **Login Response Data**
- ✅ **Error Messages**
- ✅ **Debug Panel** với JSON response

## 7. Troubleshooting

### Lỗi thường gặp:

1. **"Google SDK chưa được tải"**
   - Kiểm tra `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - Kiểm tra network connection

2. **"Facebook SDK chưa được tải"**
   - Kiểm tra `NEXT_PUBLIC_FACEBOOK_APP_ID`
   - Kiểm tra Facebook App settings

3. **"Invalid client_id"**
   - Kiểm tra Google OAuth configuration
   - Đảm bảo domain được thêm vào authorized origins

4. **"App Not Setup"**
   - Kiểm tra Facebook App status
   - Đảm bảo Facebook Login được enable

## 8. Production Deployment

### Cập nhật OAuth settings:
1. **Google**: Thêm production domain vào authorized origins
2. **Facebook**: Thêm production domain vào Site URL
3. **Environment Variables**: Cập nhật production values

### Security:
- Sử dụng HTTPS trong production
- Bảo mật JWT_SECRET
- Validate tokens trên server-side
