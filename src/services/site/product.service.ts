import { apiClient } from "@/lib/apiClient";

// ---------- API Response Schemas ----------
export type SearchProduct = {
  productId: number;
  name: string;
  price: number;
  imageUrl: string;
  shopId: number;
  shopName: string;
  shopLatitude: number;
  shopLongitude: number;
  distanceKm: number;
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
  number: number;
  sort: SearchSort[];
  pageable: PageableInfo;
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
  imageUrl?: string;
  distanceKm?: number;
  discountPercent?: number;
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
  distancekm?: number;
  totalorders?: number;
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
};

export type ApiResponse<T> = {
  code: string;
  success: boolean;
  data: T;
};

// ---------- Query Params ----------
export type ProductSearchParams = {
  name?: string;
  page?: number; // 0-based
  size?: number;
  latitude?: number;
  longitude?: number;
};

const SEARCH_ENDPOINT = "/products"; // Adjust easily if backend path differs
const TOP_DISCOUNTS_ENDPOINT = "/products/top-discounts";
const POPULAR_ENDPOINT = "/products/popular";
const NEARBY_ENDPOINT = "/products/nearby";
const PRODUCT_DETAIL_ENDPOINT = "/products";

export const ProductService = {
  search(params: ProductSearchParams) {
    return apiClient.get<{ data: PageEnvelope<SearchProduct> }>(SEARCH_ENDPOINT, {
      query: params as Record<string, any>,
    });
  },
  async topDiscounts(params: { page?: number; size?: number } = {}) {
    const { page = 0, size = 12 } = params;
    const res = await apiClient.get<ApiResponse<{ content: ApiProduct[] }>>(TOP_DISCOUNTS_ENDPOINT, {
      query: { page, size },
    });
    const products = res.data?.content || [];
    return products.map(mapApiProductToProduct);
  },
  async popular(params: { page?: number; size?: number } = {}) {
    const { page = 0, size = 12 } = params;
    const res = await apiClient.get<ApiResponse<{ content: ApiProduct[] }>>(POPULAR_ENDPOINT, {
      query: { page, size },
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
    priceSort?: "asc" | "desc"; // currently unused by API
    lat?: number;
    lon?: number;
    maxDistanceKm?: number; // currently unused by API
  } = {}): Promise<PageResult<Product>> {
    const { page = 0, size = 12, lat, lon } = params;
    const res = await this.search({
      page,
      size,
      latitude: lat,
      longitude: lon,
    });
    const pg = res.data; // PageEnvelope<SearchProduct>
    return {
      content: (pg.content || []).map(mapSearchToProduct),
      totalElements: pg.totalElements,
      totalPages: pg.totalPages,
      size: pg.size,
      number: pg.number,
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
    imageUrl: p.imageUrl,
    distanceKm: p.distancekm,
    discountPercent: p.discountPercentage,
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
    distanceKm: p?.distancekm,
  };
}
