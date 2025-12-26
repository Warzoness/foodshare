"use client";

import { useEffect, useState } from "react";
import { FirebaseTokenService } from "@/services/site/firebase-token.service";
import { AuthService } from "@/services/site/auth.service";
import NotificationPermissionPrompt from "../NotificationPermissionPrompt/NotificationPermissionPrompt";

export default function FirebaseTokenManager() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Chỉ chạy khi đã đăng nhập
    if (!AuthService.isLoggedIn()) {
      return;
    }

    // Kiểm tra xem đã có token trong localStorage chưa
    const hasToken = FirebaseTokenService.getStoredToken();
    
    // Nếu đã có token, không cần làm gì
    if (hasToken) {
      console.log("✅ Đã có token, không cần xử lý");
      setHasChecked(true);
      return;
    }

    // Nếu chưa có token, cần xử lý
    if (typeof window !== "undefined" && "Notification" in window) {
      // Nếu permission chưa được cấp (default), hiển thị popup để xin phép
      if (Notification.permission === "default") {
        // Kiểm tra xem đã hiển thị prompt chưa (để tránh hiển thị nhiều lần)
        const promptShown = localStorage.getItem("notification_prompt_shown");
        if (!promptShown) {
          console.log("📢 Hiển thị popup xin phép notification");
          setShowPrompt(true);
          setHasChecked(true);
          return;
        }
      }
      
      // Nếu permission đã được cấp, lấy token ngay
      if (Notification.permission === "granted") {
        console.log("✅ Permission đã được cấp, lấy token ngay");
        FirebaseTokenService.handleTokenAfterLogin();
      }
      
      // Nếu permission bị từ chối, không làm gì
      if (Notification.permission === "denied") {
        console.log("⚠️ Permission đã bị từ chối");
      }
    }

    setHasChecked(true);
  }, []);

  const handleAllow = async () => {
    try {
      // Yêu cầu permission và lấy token
      const token = await FirebaseTokenService.requestPermissionAndGetToken();
      if (token) {
        // Gửi token lên server
        await FirebaseTokenService.sendTokenToServer(token);
      }
    } catch (error) {
      console.error("❌ Lỗi khi xử lý token sau khi cho phép:", error);
    }
  };

  const handleDeny = () => {
    console.log("Người dùng từ chối notification permission");
  };

  // Chỉ hiển thị popup khi đã check và cần hiển thị
  if (!hasChecked) {
    return null;
  }

  if (!showPrompt) {
    return null;
  }

  return (
    <NotificationPermissionPrompt onAllow={handleAllow} onDeny={handleDeny} />
  );
}

