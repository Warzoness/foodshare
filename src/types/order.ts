// Order types for FoodShare app

export type CreateOrderRequest = {
  userId: number;
  shopId: number;
  productId: number;
  quantity: number;
  pickupTime: string; // ISO 8601 format: "2025-09-28T09:38:42.662Z"
  unitPrice: number;
  totalPrice: number;
};

export type CreateOrderResponse = {
  id: number;
  userId: number;
  shopId: number;
  productId: number;
  quantity: number;
  status: string;
  pickupTime: string;
  expiresAt: string;
  unitPrice: number;
  totalPrice: number;
};

export type Order = {
  id: number;
  userId: number;
  shopId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  pickupTime: string;
  expiresAt: string;
  createdAt?: string;
  updatedAt?: string;
};

export type OrderStatus = 
  | "PENDING"
  | "CONFIRMED" 
  | "PREPARING"
  | "READY"
  | "PICKED_UP"
  | "CANCELLED";

export type ApiResponse<T> = {
  code: string;
  success: boolean;
  data: T;
  message?: string;
};
