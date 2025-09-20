// Store types based on the provided API response structure
export type StoreProduct = {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  quantityAvailable: number;
  quantityPending: number;
  status: string; // "1" = Đang bán, "0" = Ngừng bán
};

export type Store = {
  id: number;
  name: string;
  address: string;
  phone: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  description: string;
  rating: number;
  status: string; // "1" = Đang mở, "0" = Đã đóng cửa
  products: StoreProduct[];
};

export type StoreApiResponse = {
  code: string;
  success: boolean;
  data: Store;
  message: string;
};

export type StoreSearchParams = {
  page?: number;
  size?: number;
  latitude?: number;
  longitude?: number;
  name?: string;
};
