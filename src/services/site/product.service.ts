import { apiClient } from "@/lib/apiClient";

export type PageResult<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // current page (0-based)
};

export type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  distanceKm?: number;
  discountPercent?: number;
};

export type ProductQuery = {
  q?: string;
  lat?: number;
  lon?: number;
  maxDistanceKm?: number;
  minPrice?: number;
  maxPrice?: number;
  priceSort?: "asc" | "desc";
  page?: number;
  size?: number;
};

export const ProductService = {
  list(params: ProductQuery = {}) {
    return apiClient.get<PageResult<Product>>("/products", { query: params });
  },
  getById(id: number) {
    return apiClient.get<Product>(`/products/${id}`);
  },
};
