# 🚀 HƯỚNG DẪN TEST GOOGLE SIGN-IN BUTTON

## **✅ ĐÃ CẬP NHẬT THEO CÁCH 3**

### **🔄 THAY ĐỔI CHÍNH:**
1. **Loại bỏ One Tap prompt** - Không còn sử dụng `window.google.accounts.id.prompt()`
2. **Sử dụng Google Sign-In Button** - Render button trực tiếp từ Google SDK
3. **Tương thích FedCM** - Không còn cảnh báo về deprecated methods
4. **Auto-render** - Button tự động hiển thị khi SDK được tải

### **🎯 CÁCH HOẠT ĐỘNG MỚI:**

#### **1. Khi trang load:**
```typescript
// SDK được tải
loadSDKs() → setSdkLoaded(true)

// Auto-render Google button
useEffect(() => {
  if (sdkLoaded && window.google) {
    handleGoogleLogin(); // Render button
  }
}, [sdkLoaded]);
```

#### **2. Khi user click Google button:**
```typescript
// Google SDK tự động gọi callback
window.google.accounts.id.initialize({
  client_id: clientId,
  callback: (response) => {
    // Xử lý JWT token
    processGoogleLogin(response);
  }
});
```

#### **3. Xử lý đăng nhập:**
```typescript
processGoogleLogin(credential) → 
  AuthService.socialLogin() → 
  Redirect to next page
```

## **🧪 CÁCH TEST**

### **Bước 1: Restart Server**
```bash
# Dừng server hiện tại (Ctrl+C)
# Sau đó chạy lại
npm run dev
```

### **Bước 2: Truy cập Login Page**
```
http://localhost:3000/auth/login
```

### **Bước 3: Kiểm tra Console Logs**
Mở Developer Tools (F12) → Console tab

**Logs mong đợi:**
```
🔄 Loading Google and Facebook SDKs...
📋 Configuration:
  - Google Client ID: 62641073672-3rjbtjt32kkng905ebr2nfebq3i18cl3.apps.googleusercontent.com
  - Facebook App ID: your-facebook-app-id
✅ Google SDK loaded successfully
✅ Facebook SDK loaded successfully
🔄 Auto-rendering Google Sign-In Button...
🔄 Starting Google login process...
🔄 Initializing Google Identity Services...
🔄 Rendering Google Sign-In Button...
✅ Google Sign-In Button rendered
```

### **Bước 4: Kiểm tra UI**
- **Google button** sẽ hiển thị dạng iframe từ Google
- **Không còn cảnh báo** về One Tap prompt
- **Button có style** đẹp với theme outline

### **Bước 5: Test Đăng nhập**
1. Click vào Google button
2. Chọn tài khoản Google
3. Kiểm tra console logs:
   ```
   📧 Google callback triggered
   📧 Google response received: {credential: "eyJ..."}
   ✅ Valid Google credential received
   📤 Processing Google credential...
   📤 Sending login request to backend...
   ✅ Login successful! Backend response: {...}
   🔄 Redirecting to: /
   ```

## **🎨 GIAO DIỆN MỚI**

### **Google Button Container:**
```css
.googleButtonContainer {
  width: 100%;
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 48px;
}

.googleButtonContainer iframe {
  border-radius: 8px !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}
```

### **Button Configuration:**
```typescript
window.google.accounts.id.renderButton(buttonContainer, {
  theme: 'outline',        // Viền ngoài
  size: 'large',           // Kích thước lớn
  type: 'standard',        // Loại chuẩn
  shape: 'rectangular',    // Hình chữ nhật
  text: 'signin_with',     // Text "Sign in with Google"
  width: '100%'            // Chiều rộng 100%
});
```

## **🔍 DEBUGGING**

### **Nếu Google button không hiển thị:**
1. Kiểm tra console có lỗi không
2. Kiểm tra `sdkLoaded` state
3. Kiểm tra `window.google` object
4. Kiểm tra element `#google-login-button`

### **Nếu click không hoạt động:**
1. Kiểm tra callback function
2. Kiểm tra Client ID
3. Kiểm tra network requests
4. Kiểm tra AuthService response

### **Nếu vẫn có cảnh báo:**
- Cảnh báo về One Tap đã được loại bỏ
- Nếu vẫn có cảnh báo khác, kiểm tra Google Cloud Console

## **📋 CHECKLIST TEST**

- [ ] Server restart thành công
- [ ] Trang login load không lỗi
- [ ] Console hiển thị logs đầy đủ
- [ ] Google button hiển thị đẹp
- [ ] Không có cảnh báo One Tap
- [ ] Click button mở popup Google
- [ ] Chọn tài khoản thành công
- [ ] Nhận được JWT token
- [ ] Redirect về trang chủ
- [ ] Debug panel hiển thị thông tin

## **🎉 KẾT QUẢ MONG ĐỢI**

✅ **Không còn cảnh báo** về One Tap prompt  
✅ **Google button đẹp** với theme outline  
✅ **Đăng nhập mượt mà** không cần prompt  
✅ **Tương thích FedCM** cho tương lai  
✅ **UX tốt hơn** với button chuẩn Google  

**Chúc bạn test thành công! 🚀**
