// Utilities to get current geolocation and reverse geocode to a human-readable address

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

async function getQuickCoordinates(): Promise<Coordinates | null> {
  // 1️⃣ Lấy cache nhanh nếu có
  try {
    const cached = localStorage.getItem("coords_cache");
    if (cached) {
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < 1000 * 60 * 10) { // cache trong 10 phút
        return { latitude: data.lat, longitude: data.lon, accuracy: data.accuracy };
      }
    }
  } catch (_) {}

  // 2️⃣ Nếu không có cache, thử lấy từ IP (rất nhanh, sai lệch vài km)
  try {
    const res = await fetch("https://ipapi.co/json/");
    const json = await res.json();
    if (json && json.latitude && json.longitude) {
      return {
        latitude: json.latitude,
        longitude: json.longitude,
        accuracy: 5000,
      };
    }
  } catch (_) {}

  return null;
}

async function getAccurateCoordinates(options?: PositionOptions): Promise<Coordinates> {
  if (typeof window === "undefined") throw new Error("Không chạy trên client");
  if (!window.isSecureContext) throw new Error("Yêu cầu kết nối bảo mật (HTTPS hoặc localhost)");
  if (!("geolocation" in navigator)) throw new Error("Thiết bị không hỗ trợ định vị địa lý");

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          // 💾 Lưu cache cho lần sau
          localStorage.setItem("coords_cache", JSON.stringify({
            lat: coords.latitude,
            lon: coords.longitude,
            accuracy: coords.accuracy,
            timestamp: Date.now(),
          }));
          resolve(coords);
        },
        (err) => {
          reject(new Error(err.message || "Không thể lấy vị trí hiện tại"));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
          ...options,
        }
    );
  });
}

export async function reverseGeocodeOSM(
    coords: Coordinates,
    locale: string = "vi"
): Promise<ReverseGeocodeAddress> {
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

export async function getCurrentAddress(locale: string = "vi") {
  // 🏃‍♂️ Bước 1: Lấy vị trí nhanh (cache hoặc IP)
  const quick = await getQuickCoordinates();
  if (quick) {
    // Trả ngay vị trí gần đúng cho UI hiển thị trước
    const address = await reverseGeocodeOSM(quick, locale);
    // 🔄 Đồng thời chạy ngầm cập nhật vị trí chính xác hơn
    getAccurateCoordinates().then(() => {}).catch(() => {});
    return { coords: quick, address, source: "fast" as const };
  }

  // 🧭 Bước 2: Nếu không có cache/IP, fallback qua geolocation
  const coords = await getAccurateCoordinates();
  const address = await reverseGeocodeOSM(coords, locale);
  return { coords, address, source: "accurate" as const };
}
