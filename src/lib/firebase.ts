import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getMessaging, getToken, Messaging, onMessage } from "firebase/messaging";

// Cấu hình Firebase từ service worker
const firebaseConfig = {
  apiKey: "AIzaSyDXHW6GC5CoumpCfTgRFidhd-9YeNnD1rs",
  authDomain: "foodshare-d68ca.firebaseapp.com",
  projectId: "foodshare-d68ca",
  storageBucket: "foodshare-d68ca.firebasestorage.app",
  messagingSenderId: "15820236206",
  appId: "1:15820236206:web:3e824819890571d8a8543f",
  measurementId: "G-40KBTB1VWB"
};

// Khởi tạo Firebase app
let app: FirebaseApp;
if (typeof window !== "undefined" && getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else if (typeof window !== "undefined") {
  app = getApps()[0];
}

// VAPID key cho web push notifications
const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "BK8xJ3K5LmNpQrStUvWxYz123456789";

// Lấy messaging instance
export const messaging = async (): Promise<Messaging | null> => {
  if (typeof window === "undefined") return null;
  
  try {
    return getMessaging(app);
  } catch (error) {
    console.error("Lỗi khi khởi tạo Firebase Messaging:", error);
    return null;
  }
};

// Lấy FCM token
export const fetchToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null;

  try {
    const messagingInstance = await messaging();
    if (!messagingInstance) {
      console.error("Messaging instance không khả dụng");
      return null;
    }

    // Kiểm tra service worker đã đăng ký chưa
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      
      const token = await getToken(messagingInstance, {
        vapidKey: vapidKey,
        serviceWorkerRegistration: registration,
      });

      if (token) {
        console.log("✅ FCM Token đã được lấy thành công:", token);
        return token;
      } else {
        console.warn("⚠️ Không thể lấy FCM token. Có thể do permission chưa được cấp.");
        return null;
      }
    } else {
      console.warn("⚠️ Service Worker không được hỗ trợ trên trình duyệt này");
      return null;
    }
  } catch (error) {
    console.error("❌ Lỗi khi lấy FCM token:", error);
    return null;
  }
};

// Export onMessage để sử dụng trong components
export { onMessage };

