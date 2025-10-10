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

// ✅ getCurrentCoordinates: tự động lấy nhanh trước, rồi update chính xác ngầm
export async function getCurrentCoordinates(options?: PositionOptions): Promise<Coordinates> {
  if (typeof window === "undefined") throw new Error("Không chạy trên client");
  if (!window.isSecureContext) throw new Error("Yêu cầu kết nối bảo mật (HTTPS hoặc localhost)");

  // 1️⃣ Ưu tiên cache
  try {
    const cached = localStorage.getItem("coords_cache");
    if (cached) {
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < 1000 * 60 * 10) { // cache 10 phút
        // chạy ngầm để cập nhật tọa độ chính xác hơn
        updateAccurateCoordinates(options);
        return { latitude: data.lat, longitude: data.lon, accuracy: data.accuracy };
      }
    }
  } catch (_) {}

  // 2️⃣ Nếu không có cache, thử IP nhanh
  try {
    const ipRes = await fetch("https://ipapi.co/json/");
    const ipData = await ipRes.json();
    if (ipData && ipData.latitude && ipData.longitude) {
      // chạy ngầm cập nhật chính xác
      updateAccurateCoordinates(options);
      return {
        latitude: ipData.latitude,
        longitude: ipData.longitude,
        accuracy: 5000,
      };
    }
  } catch (_) {}

  // 3️⃣ Cuối cùng fallback sang geolocation thật
  return await updateAccurateCoordinates(options);
}

// 🎯 Hàm chạy ngầm để cập nhật cache + toạ độ chính xác
async function updateAccurateCoordinates(options?: PositionOptions): Promise<Coordinates> {
  if (!("geolocation" in navigator)) throw new Error("Thiết bị không hỗ trợ định vị địa lý");

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          localStorage.setItem("coords_cache", JSON.stringify({
            lat: coords.latitude,
            lon: coords.longitude,
            accuracy: coords.accuracy,
            timestamp: Date.now(),
          }));
          resolve(coords);
        },
        (err) => reject(new Error(err.message || "Không thể lấy vị trí hiện tại")),
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
          ...options,
        }
    );
  });
}

// 🌍 Reverse geocode
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

// 📍 getCurrentAddress: giữ nguyên signature cũ, nhưng nhanh hơn
export async function getCurrentAddress(locale: string = "vi") {
  const coords = await getCurrentCoordinates();
  const address = await reverseGeocodeOSM(coords, locale);
  return { coords, address };
}
