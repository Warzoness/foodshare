# Hướng dẫn cấu hình Google OAuth

## Lỗi redirect_uri_mismatch

Lỗi này xảy ra khi redirect URI trong Google OAuth console không khớp với URI được sử dụng trong code.

## Cách sửa:

### 1. Truy cập Google Cloud Console
- Đi đến [Google Cloud Console](https://console.cloud.google.com/)
- Chọn project của bạn
- Vào "APIs & Services" > "Credentials"

### 2. Cấu hình OAuth 2.0 Client ID
- Tìm OAuth 2.0 Client ID của bạn
- Click "Edit" (biểu tượng bút chì)

### 3. Thêm Authorized redirect URIs
Thêm các URI sau vào "Authorized redirect URIs":

```
http://localhost:3000/auth/google/callback
https://yourdomain.com/auth/google/callback
```

### 4. Thêm Authorized JavaScript origins
Thêm các origin sau vào "Authorized JavaScript origins":

```
http://localhost:3000
https://yourdomain.com
```

### 5. Lưu cấu hình
- Click "Save"
- Đợi vài phút để cấu hình có hiệu lực

## Lưu ý:
- Thay `yourdomain.com` bằng domain thực tế của bạn
- Đảm bảo protocol (http/https) khớp với môi trường
- Cấu hình có thể mất vài phút để có hiệu lực

## Test:
Sau khi cấu hình, thử đăng nhập lại. Lỗi `redirect_uri_mismatch` sẽ biến mất.
