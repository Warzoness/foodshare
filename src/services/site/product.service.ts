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

// ---------- Query Params ----------
export type ProductSearchParams = {
  name?: string;
  page?: number; // 0-based
  size?: number;
  latitude?: number;
  longitude?: number;
};

const SEARCH_ENDPOINT = "/products/search"; // Adjust easily if backend path differs

export const ProductService = {
  search(params: ProductSearchParams) {
    return apiClient.get<{ data: PageEnvelope<SearchProduct> }>(SEARCH_ENDPOINT, {
      query: params as Record<string, any>,
    });
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
