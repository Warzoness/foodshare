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

export async function getCurrentCoordinates(options?: PositionOptions): Promise<Coordinates> {
  if (typeof window === "undefined") throw new Error("Không chạy trên client");
  if (!window.isSecureContext) throw new Error("Yêu cầu kết nối bảo mật (HTTPS hoặc localhost)");
  if (!("geolocation" in navigator)) throw new Error("Thiết bị không hỗ trợ định vị địa lý");

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        (err) => {
          reject(new Error(err.message || "Không thể lấy vị trí hiện tại"));
        },
        {
          enableHighAccuracy: false, // ⚡ dùng Wi-Fi / mạng di động — nhanh hơn GPS nhiều
          timeout: 5000,             // ⏱ chỉ chờ tối đa 5 giây
          maximumAge: 60000,         // 💾 dùng lại dữ liệu trong vòng 1 phút nếu có
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
    headers: {
      // Some browsers will ignore/override UA; Accept-Language helps localization
      "Accept": "application/json",
    },
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
  const coords = await getCurrentCoordinates();
  const address = await reverseGeocodeOSM(coords, locale);
  return { coords, address };
}


