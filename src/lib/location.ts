export type Coordinates = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

export type ReverseGeocodeAddress = {
  displayName: string;
  road?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  postcode?: string;
  country?: string;
};

// ✅ getCurrentCoordinates: chỉ dùng cache + IP (không cần quyền vị trí)
export async function getCurrentCoordinates(): Promise<Coordinates> {
  if (typeof window === "undefined") throw new Error("Không chạy trên client");
  if (!window.isSecureContext) throw new Error("Yêu cầu kết nối bảo mật (HTTPS hoặc localhost)");

  // 1️⃣ Ưu tiên cache
  try {
    const cached = localStorage.getItem("coords_cache");
    if (cached) {
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < 1000 * 60 * 10) { // cache 10 phút
        return { latitude: data.lat, longitude: data.lon, accuracy: data.accuracy };
      }
    }
  } catch (_) {}

  // 2️⃣ Nếu không có cache, thử IP nhanh qua ipwho.is (miễn phí, không giới hạn)
  try {
    const ipRes = await fetch("https://ipwho.is/");
    const ipData = await ipRes.json();
    console.log("IP lookup:", ipData);

    if (ipData && ipData.latitude && ipData.longitude) {
      // Lưu cache
      localStorage.setItem("coords_cache", JSON.stringify({
        lat: ipData.latitude,
        lon: ipData.longitude,
        accuracy: 5000,
        timestamp: Date.now(),
      }));

      return {
        latitude: ipData.latitude,
        longitude: ipData.longitude,
        accuracy: 5000,
      };
    } else {
      throw new Error("Không lấy được vị trí qua IP");
    }
  } catch (err) {
    throw new Error("Không thể xác định vị trí hiện tại (qua IP)");
  }
}

// 🌍 Reverse geocode (giữ nguyên)
export async function reverseGeocodeOSM(coords: Coordinates, locale: string = "vi"): Promise<ReverseGeocodeAddress> {
  const { latitude, longitude } = coords;
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  url.searchParams.set("accept-language", locale);
  url.searchParams.set("addressdetails", "1");

  const res = await fetch(url.toString(), {
    headers: { "Accept": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Reverse geocode lỗi: HTTP ${res.status}`);
  const data: any = await res.json();

  const addr = data.address || {};
  const displayName: string = data.display_name ||
      [addr.road, addr.suburb, addr.city || addr.town || addr.village, addr.state, addr.postcode, addr.country]
          .filter(Boolean)
          .join(", ");

  return {
    displayName,
    road: addr.road,
    suburb: addr.suburb,
    city: addr.city,
    town: addr.town,
    village: addr.village,
    state: addr.state,
    postcode: addr.postcode,
    country: addr.country,
  };
}

// 📍 getCurrentAddress (giữ nguyên signature)
export async function getCurrentAddress(locale: string = "vi") {
  const coords = await getCurrentCoordinates();
  const address = await reverseGeocodeOSM(coords, locale);
  return { coords, address };
}

// 🔄 Cập nhật địa chỉ khách hàng lên server
export async function updateUserLocation(coords: Coordinates): Promise<void> {
  if (typeof window === "undefined") return;
  
  // Kiểm tra xem đã gọi API trong phiên này chưa
  const sessionKey = "location_updated_in_session";
  if (sessionStorage.getItem(sessionKey)) {
    console.log("📍 Location đã được cập nhật trong phiên này, bỏ qua");
    return;
  }

  try {
    // Lấy JWT token từ AuthService
    const { AuthService } = await import("@/services/site/auth.service");
    const jwtToken = AuthService.getStoredToken();
    
    if (!jwtToken) {
      console.log("📍 Không tìm thấy JWT token, bỏ qua cập nhật location");
      return;
    }

    const { apiClient } = await import("@/lib/apiClient");
    await apiClient.put("/api/users/location", {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      body: {
        latitude: coords.latitude,
        longitude: coords.longitude,
      },
    });
    
    // Đánh dấu đã cập nhật trong phiên này
    sessionStorage.setItem(sessionKey, "true");
    console.log("✅ Đã cập nhật location lên server:", coords);
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật location:", error);
    // Không throw error để không ảnh hưởng đến flow chính
  }
}