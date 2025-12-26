import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDXHW6GC5CoumpCfTgRFidhd-9YeNnD1rs",
  authDomain: "foodshare-d68ca.firebaseapp.com",
  projectId: "foodshare-d68ca",
  storageBucket: "foodshare-d68ca.firebasestorage.app",
  messagingSenderId: "15820236206",
  appId: "1:15820236206:web:3e824819890571d8a8543f",
  measurementId: "G-40KBTB1VWB"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const messaging = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};

export const fetchToken = async () => {
  try {
    const fcmMessaging = await messaging();
    if (fcmMessaging) {
      const token = await getToken(fcmMessaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_FCM_VAPID_KEY,
      });
      return token;
    }
    return null;
  } catch (err) {
    console.error("An error occurred while fetching the token:", err);
    return null;
  }
};

// Hàm đơn giản để xử lý token sau khi đăng nhập thành công
export const handleFirebaseTokenAfterLogin = async () => {
  if (typeof window === "undefined") return;

  const FIREBASE_TOKEN_KEY = "firebase_fcm_token";

  try {
    // Kiểm tra xem đã có token trong localStorage chưa
    const storedToken = localStorage.getItem(FIREBASE_TOKEN_KEY);
    if (storedToken) {
      console.log("✅ Đã có token trong localStorage, không cần lấy token mới");
      return;
    }

    // Kiểm tra notification permission
    if (!("Notification" in window)) {
      console.warn("⚠️ Trình duyệt không hỗ trợ notifications");
      return;
    }

    // Nếu permission chưa được cấp, không làm gì
    if (Notification.permission !== "granted") {
      console.log("⚠️ Notification permission chưa được cấp");
      return;
    }

    // Lấy token mới từ Firebase
    const token = await fetchToken();
    if (!token) {
      console.warn("⚠️ Không thể lấy token từ Firebase");
      return;
    }

    // Lưu token vào localStorage
    localStorage.setItem(FIREBASE_TOKEN_KEY, token);
    console.log("✅ Đã lấy và lưu token vào localStorage");

    // Gửi token lên server
    await sendTokenToServer(token);
  } catch (error) {
    console.error("❌ Lỗi khi xử lý Firebase token:", error);
  }
};

// Hàm gửi token lên server
const sendTokenToServer = async (token: string) => {
  try {
    // Lấy JWT token từ localStorage (được lưu bởi AuthService)
    const jwtToken = localStorage.getItem("token");
    if (!jwtToken) {
      console.error("❌ Không tìm thấy JWT token để xác thực");
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL || "https://foodshare-production-98da.up.railway.app"}/api/users/firebase-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          firebaseToken: token,
        }),
      }
    );

    if (response.ok) {
      console.log("✅ Token đã được gửi lên server thành công");
    } else {
      console.error("❌ Server trả về lỗi:", response.statusText);
    }
  } catch (error) {
    console.error("❌ Lỗi khi gửi token lên server:", error);
  }
};

export { app, messaging };

