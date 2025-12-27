"use client";

import { useEffect, useRef } from "react";
import { getCurrentCoordinates, updateUserLocation } from "@/lib/location";
import { AuthService } from "@/services/site/auth.service";

/**
 * Component để cập nhật location của user lên server
 * Chỉ gọi 1 lần duy nhất trong phiên khi user đã đăng nhập
 */
export default function UserLocationUpdater() {
  const hasUpdatedRef = useRef(false);

  useEffect(() => {
    // Chỉ chạy trên client
    if (typeof window === "undefined") return;
    
    // Kiểm tra xem đã cập nhật chưa
    if (hasUpdatedRef.current) return;
    
    // Kiểm tra xem user đã đăng nhập chưa
    const isLoggedIn = AuthService.isLoggedIn();
    if (!isLoggedIn) {
      console.log("📍 User chưa đăng nhập, bỏ qua cập nhật location");
      return;
    }

    // Kiểm tra xem đã cập nhật trong session chưa
    const sessionKey = "location_updated_in_session";
    if (sessionStorage.getItem(sessionKey)) {
      console.log("📍 Location đã được cập nhật trong phiên này");
      hasUpdatedRef.current = true;
      return;
    }

    // Lấy location và cập nhật lên server
    const updateLocation = async () => {
      try {
        const coords = await getCurrentCoordinates();
        await updateUserLocation(coords);
        hasUpdatedRef.current = true;
      } catch (error) {
        console.error("❌ Lỗi khi lấy hoặc cập nhật location:", error);
      }
    };

    // Gọi với delay nhỏ để đảm bảo app đã load xong
    const timer = setTimeout(() => {
      updateLocation();
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return null; // Component không render gì
}

