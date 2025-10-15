import { apiClient } from "@/lib/apiClient";
import { Store, StoreApiResponse, StoreSearchParams, ProductPaginationResponse, ProductApiResponse } from "@/types/store";

const STORE_ENDPOINT = "/shops";
const STORE_DETAIL_ENDPOINT = "/shops";

export const StoreService = {
  /**
   * Get store detail by ID
   */
  async getStoreDetail(storeId: number): Promise<Store> {
    const res = await apiClient.get<StoreApiResponse>(`${STORE_DETAIL_ENDPOINT}/${storeId}`);
    
    if (!res.success || !res.data) {
      throw new Error(res.message || "Store not found");
    }
    
    return res.data;
  },

  /**
   * Search stores with pagination and location
   */
  async searchStores(params: StoreSearchParams = {}) {
    const { page = 0, size = 12, latitude, longitude, name } = params;
    
    return apiClient.get<StoreApiResponse>(STORE_ENDPOINT, {
      query: {
        page,
        size,
        latitude,
        longitude,
        name,
      },
    });
  },

  /**
   * Get nearby stores
   */
  async getNearbyStores(params: { 
    page?: number; 
    size?: number; 
    lat: number; 
    lon: number;
    maxDistanceKm?: number;
  }) {
    const { page = 0, size = 12, lat, lon, maxDistanceKm } = params;
    
    return apiClient.get<StoreApiResponse>(`${STORE_ENDPOINT}/nearby`, {
      query: {
        page,
        size,
        latitude: lat,
        longitude: lon,
        maxDistance: maxDistanceKm,
      },
    });
  },

  /**
   * Get stores by category
   */
  async getStoresByCategory(categoryId: number, params: { page?: number; size?: number } = {}) {
    const { page = 0, size = 12 } = params;
    
    return apiClient.get<StoreApiResponse>(`${STORE_ENDPOINT}/category/${categoryId}`, {
      query: { page, size },
    });
  },

  /**
   * Get products by shop ID with pagination
   */
  async getShopProducts(shopId: number, params: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  } = {}) {
    const { page = 0, size = 20, sortBy = 'createdAt', sortDirection = 'desc' } = params;
    
    return apiClient.get<ProductApiResponse>(`${STORE_ENDPOINT}/${shopId}/products`, {
      query: { page, size, sortBy, sortDirection },
    });
  },
};
