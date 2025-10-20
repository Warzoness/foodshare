import { apiClient } from "@/lib/apiClient";

// ---------- API Response Schemas ----------
export type SearchProduct = {
  productId: number;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  shopId: number;
  shopName: string;
  shopLatitude: number;
  shopLongitude: number;
  distanceKm: number;
  discountPercentage?: number;
  totalOrders?: number;
};

export type SearchSort = {
  direction: string;
  nullHandling: string;
  ascending: boolean;
  property: string;
  ignoreCase: boolean;
};

export type PageableInfo = {
  offset: number;
  sort: SearchSort[];
  paged: boolean;
  pageNumber: number;
  pageSize: number;
  unpaged: boolean;
};

export type PageEnvelope<T> = {
  totalElements: number;
  totalPages: number;
  size: number;
  content: T[];
  page: number; // API uses 'page' instead of 'number'
  sort?: SearchSort[];
  pageable?: PageableInfo;
};

// ---------- Back-compat types for existing callers ----------
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
  originalPrice?: number;
  imageUrl?: string;
  distanceKm?: number;
  discountPercent?: number;
  totalOrders?: number;
};

// API Response types based on actual API structure
export type ApiProduct = {
  productId: number;
  name: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  imageUrl?: string;
  detailImageUrl?: string;
  shopId: number;
  shopName: string;
  shopLatitude: number;
  shopLongitude: number;
  distanceKm?: number;
  totalOrders?: number;
  quantityAvailable?: number;
};

export type ProductDetail = {
  id: number;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  imageUrl?: string;
  detailImageUrl?: string;
  shopId: number;
  shopName: string;
  shopAddress?: string;
  shopLatitude: number;
  shopLongitude: number;
  distanceKm?: number;
  totalOrders?: number;
  quantityAvailable?: number;
};

export type ApiResponse<T> = {
  code: string;
  success: boolean;
  data: T;
};

// ---------- Query Params ----------
export type ProductSearchParams = {
  q?: string;                    // Product name search query
  lat?: number;                  // Customer latitude
  lon?: number;                  // Customer longitude
  maxDistanceKm?: number;        // Maximum distance in kilometers
  minPrice?: number;             // Minimum price filter
  maxPrice?: number;             // Maximum price filter
  minDiscount?: number;          // Minimum discount percentage
  sortBy?: string;               // Sorting field: 'name', 'price', 'discount', 'distance'
  sortDirection?: 'asc' | 'desc'; // Sorting direction: 'asc' or 'desc'
  page?: number;                 // Page number (0-based)
  size?: number;                 // Page size (max: 100)
};

const SEARCH_ENDPOINT = "/products"; // Adjust easily if backend path differs
const TOP_DISCOUNTS_ENDPOINT = "/products/top-discounts";
const POPULAR_ENDPOINT = "/products/popular";
const NEARBY_ENDPOINT = "/products/nearby";
const PRODUCT_DETAIL_ENDPOINT = "/products";

export const ProductService = {
  /**
   * Search products with advanced filtering and sorting
   * @param params - Search parameters including filters and sorting
   * @returns Promise<ApiResponse<PageEnvelope<SearchProduct>>>
   */
  search(params: ProductSearchParams) {
    // Clean up undefined values to avoid sending them to API
    const cleanParams: Record<string, any> = {};
    
    if (params.q !== undefined && params.q !== '') cleanParams.q = params.q;
    if (params.lat !== undefined) cleanParams.lat = params.lat;
    if (params.lon !== undefined) cleanParams.lon = params.lon;
    if (params.maxDistanceKm !== undefined) cleanParams.maxDistanceKm = params.maxDistanceKm;
    if (params.minPrice !== undefined) cleanParams.minPrice = params.minPrice;
    if (params.maxPrice !== undefined) cleanParams.maxPrice = params.maxPrice;
    if (params.minDiscount !== undefined) cleanParams.minDiscount = params.minDiscount;
    if (params.sortBy !== undefined) cleanParams.sortBy = params.sortBy;
    if (params.sortDirection !== undefined) cleanParams.sortDirection = params.sortDirection;
    if (params.page !== undefined) cleanParams.page = params.page;
    if (params.size !== undefined) cleanParams.size = params.size;

    console.log('🔍 ProductService.search called with params:', cleanParams);
    
    return apiClient.get<ApiResponse<PageEnvelope<SearchProduct>>>(SEARCH_ENDPOINT, {
      query: cleanParams,
    });
  },
  async topDiscounts(params: { page?: number; size?: number; lat?: number; lon?: number } = {}) {
    const { page = 0, size = 12, lat, lon } = params;
    const res = await apiClient.get<ApiResponse<{ content: ApiProduct[] }>>(TOP_DISCOUNTS_ENDPOINT, {
      query: { page, size, lat, lon },
    });
    const products = res.data?.content || [];
    return products.map(mapApiProductToProduct);
  },
  async popular(params: { page?: number; size?: number; lat?: number; lon?: number } = {}) {
    const { page = 0, size = 12, lat, lon } = params;
    const res = await apiClient.get<ApiResponse<{ content: ApiProduct[] }>>(POPULAR_ENDPOINT, {
      query: { page, size, lat, lon },
    });
    const products = res.data?.content || [];
    return products.map(mapApiProductToProduct);
  },
  async nearby(params: { page?: number; size?: number; lat?: number; lon?: number } = {}) {
    const { page = 0, size = 12, lat, lon } = params;
    const res = await apiClient.get<ApiResponse<{ content: ApiProduct[] }>>(NEARBY_ENDPOINT, {
      query: {
        page,
        size,
        lat,
        lon,
      },
    });
    const products = res.data?.content || [];
    return products.map(mapApiProductToProduct);
  },
  async getDetail(productId: number): Promise<ProductDetail> {
    const res = await apiClient.get<ApiResponse<ApiProduct>>(`${PRODUCT_DETAIL_ENDPOINT}/${productId}`);
    const product = res.data;
    if (!product) {
      throw new Error("Product not found");
    }
    return mapApiProductToProductDetail(product);
  },
  // Back-compat adapter used by Home page and others
  async list(params: {
    page?: number;
    size?: number;
    priceSort?: "asc" | "desc";
    lat?: number;
    lon?: number;
    maxDistanceKm?: number;
  } = {}): Promise<PageResult<Product>> {
    const { page = 0, size = 12, lat, lon, maxDistanceKm, priceSort } = params;
    
    const searchParams: ProductSearchParams = {
      q: "", // Empty query for listing all products
      page,
      size,
      lat,
      lon,
      maxDistanceKm,
    };

    // Add sorting if specified
    if (priceSort) {
      searchParams.sortBy = 'price';
      searchParams.sortDirection = priceSort;
    }

    const res = await this.search(searchParams);
    const pg = res.data; // PageEnvelope<SearchProduct>
    return {
      content: (pg.content || []).map(mapSearchToProduct),
      totalElements: pg.totalElements,
      totalPages: pg.totalPages,
      size: pg.size,
      number: pg.page, // Use 'page' from API response
    };
  },
};

function mapSearchToProduct(p: SearchProduct): Product {
  return {
    id: p.productId,
    name: p.name,
    price: p.price,
    imageUrl: p.imageUrl,
    distanceKm: p.distanceKm,
    // discountPercent is not part of search response
  };
}

function mapApiProductToProduct(p: ApiProduct): Product {
  return {
    id: p.productId,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice,
    imageUrl: p.imageUrl,
    distanceKm: p.distanceKm,
    discountPercent: p.discountPercentage,
    totalOrders: p.totalOrders,
  };
}

function mapApiProductToProductDetail(p: ApiProduct): ProductDetail {
  return {
    id: p?.productId || 0,
    name: p?.name || "",
    description: undefined, // API không có field này
    price: p?.price || 0,
    originalPrice: p?.originalPrice,
    discountPercent: p?.discountPercentage,
    imageUrl: p?.imageUrl,
    detailImageUrl: p?.detailImageUrl,
    shopId: p?.shopId || 0,
    shopName: p?.shopName || "",
    shopAddress: undefined, // API không có field này
    shopLatitude: p?.shopLatitude || 0.99,
    shopLongitude: p?.shopLongitude || 0.99,
    distanceKm: p?.distanceKm,
    totalOrders: p?.totalOrders,
    quantityAvailable: p?.quantityAvailable,
  };
}
