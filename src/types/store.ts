// Store types based on the provided API response structure
export type StoreProduct = {
  id: number;
  shopId: number;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  detailImageUrl?: string;
  quantityAvailable: number;
  quantityPending: number;
  status: string; // "1" = Đang bán, "0" = Ngừng bán
  createdAt: string;
  updatedAt: string;
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
};

// Pagination response for products
export type ProductPaginationResponse = {
  content: StoreProduct[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  empty: boolean;
};

export type StoreApiResponse = {
  code: string;
  success: boolean;
  data: Store;
  message: string;
};

export type ProductApiResponse = {
  code: string;
  success: boolean;
  data: ProductPaginationResponse;
  message: string;
};

export type StoreSearchParams = {
  page?: number;
  size?: number;
  latitude?: number;
  longitude?: number;
  name?: string;
};
