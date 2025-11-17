// Product types for the application
export type MockProduct = {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  distanceKm?: number;
  discountPercent?: number; // ví dụ 20 => giảm 20%
};
