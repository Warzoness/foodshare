import { fetchToken } from "@/lib/firebase";
import { apiClient } from "@/lib/apiClient";
import { AuthService } from "./auth.service";

const FIREBASE_TOKEN_STORAGE_KEY = "firebase_fcm_token";
const FIREBASE_TOKEN_REQUESTED_KEY = "firebase_token_requested_session"; // Dùng sessionStorage thay vì localStorage
const SAVE_FIREBASE_TOKEN_ENDPOINT = "/api/users/firebase-token";

export interface FirebaseTokenResponse {
  success: boolean;
  message?: string;
}

export const FirebaseTokenService = {
  /**
   * Lấy token từ localStorage
   */
  getStoredToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(FIREBASE_TOKEN_STORAGE_KEY);
  },

  /**
   * Lưu token vào localStorage
   */
  storeToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(FIREBASE_TOKEN_STORAGE_KEY, token);
  },

  /**
   * Xóa token khỏi localStorage và sessionStorage
   */
  clearToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(FIREBASE_TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(FIREBASE_TOKEN_REQUESTED_KEY);
  },

  /**
   * Kiểm tra xem đã yêu cầu token trong phiên này chưa (dùng sessionStorage)
   */
  hasRequestedToken(): boolean {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(FIREBASE_TOKEN_REQUESTED_KEY) === "true";
  },

  /**
   * Đánh dấu đã yêu cầu token trong phiên này (dùng sessionStorage)
   */
  markTokenRequested(): void {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(FIREBASE_TOKEN_REQUESTED_KEY, "true");
  },

  /**
   * Lấy FCM token MỚI từ Firebase (không kiểm tra localStorage)
   * Chỉ lấy 1 lần trong phiên để tránh tạo nhiều token không cần thiết
   */
  async getFirebaseToken(): Promise<string | null> {
    // Kiểm tra xem đã yêu cầu token trong phiên này chưa
    if (this.hasRequestedToken()) {
      console.log("⚠️ Đã yêu cầu token trong phiên này, không tạo token mới");
      return null;
    }

    // Kiểm tra notification permission
    if (!("Notification" in window)) {
      console.warn("⚠️ Trình duyệt không hỗ trợ notifications");
      return null;
    }

    // Nếu permission đã được cấp, lấy token mới từ Firebase
    if (Notification.permission === "granted") {
      try {
        this.markTokenRequested();
        const token = await fetchToken();
        if (token) {
          this.storeToken(token);
          console.log("✅ Đã lấy token mới từ Firebase và lưu vào localStorage");
          return token;
        }
      } catch (error) {
        console.error("❌ Lỗi khi lấy Firebase token:", error);
      }
    }

    return null;
  },

  /**
   * Yêu cầu permission và lấy token mới
   * Chỉ gọi khi chưa có token trong localStorage
   */
  async requestPermissionAndGetToken(): Promise<string | null> {
    if (!("Notification" in window)) {
      console.warn("⚠️ Trình duyệt không hỗ trợ notifications");
      return null;
    }

    // Nếu đã có permission, lấy token mới ngay
    if (Notification.permission === "granted") {
      return await this.getFirebaseToken();
    }

    // Nếu permission bị từ chối, không làm gì
    // Lưu ý: Khi permission = "denied", trình duyệt sẽ KHÔNG cho phép gọi requestPermission() nữa
    // Người dùng phải tự vào cài đặt trình duyệt để bật lại notification
    if (Notification.permission === "denied") {
      console.warn("⚠️ Notification permission đã bị từ chối - không thể yêu cầu lại bằng code");
      return null;
    }

    // Yêu cầu permission
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        this.markTokenRequested();
        const token = await fetchToken();
        if (token) {
          this.storeToken(token);
          console.log("✅ Đã lấy token mới sau khi được cấp permission");
          return token;
        }
      } else {
        console.warn("⚠️ Người dùng từ chối notification permission");
      }
    } catch (error) {
      console.error("❌ Lỗi khi yêu cầu permission:", error);
    }

    return null;
  },

  /**
   * Gửi token lên server
   */
  async sendTokenToServer(token: string): Promise<boolean> {
    try {
      const jwtToken = AuthService.getStoredToken();
      if (!jwtToken) {
        console.error("❌ Không tìm thấy JWT token để xác thực");
        return false;
      }

      const response = await apiClient.post<FirebaseTokenResponse>(
        SAVE_FIREBASE_TOKEN_ENDPOINT,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
          body: {
            firebaseToken: token,
          },
        }
      );

      if (response.success) {
        console.log("✅ Token đã được gửi lên server thành công");
        return true;
      } else {
        console.error("❌ Server trả về lỗi:", response.message);
        return false;
      }
    } catch (error) {
      console.error("❌ Lỗi khi gửi token lên server:", error);
      return false;
    }
  },

  /**
   * Xử lý toàn bộ quy trình: lấy token và gửi lên server
   * Logic: 
   * - Nếu đã có token trong localStorage → KHÔNG làm gì cả (không gửi lên server)
   * - Nếu chưa có token và chưa yêu cầu trong phiên này → lấy token mới và gửi lên server
   * - Token được lưu vào localStorage để dùng lại ở các lần đăng nhập sau
   */
  async handleTokenAfterLogin(): Promise<void> {
    try {
      // Kiểm tra xem đã có token trong localStorage chưa
      const storedToken = this.getStoredToken();
      if (storedToken) {
        console.log("✅ Đã có token trong localStorage, không cần gửi lên server nữa");
        return; // Không gửi lên server nếu đã có token
      }

      // Nếu chưa có token trong localStorage và chưa yêu cầu trong phiên này
      // (có nghĩa là lần đăng nhập này chưa tạo token mới)
      if (!this.hasRequestedToken()) {
        // Nếu permission đã được cấp, lấy token ngay
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          const token = await this.getFirebaseToken();
          if (token) {
            // Chỉ gửi lên server khi lấy được token mới
            await this.sendTokenToServer(token);
          }
        }
        // Nếu permission chưa được cấp, đợi popup xử lý (popup sẽ gọi requestPermissionAndGetToken)
      }
    } catch (error) {
      console.error("❌ Lỗi trong handleTokenAfterLogin:", error);
    }
  },
};

