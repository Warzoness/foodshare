import { apiClient } from "@/lib/apiClient";
import { CreateOrderRequest, CreateOrderResponse, Order, OrderStatus, ApiResponse } from "@/types/order";
import { AuthService } from "./auth.service";

const ORDER_ENDPOINT = "/orders";

export const OrderService = {
  /**
   * Check if user is authenticated and get token
   * @returns Token or throws error
   */
  getAuthToken(): string {
    const token = AuthService.getStoredToken();
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    return token;
  },
  /**
   * Create a new order
   * @param orderData - Order creation data
   * @returns Promise<CreateOrderResponse>
   */
  async createOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      const token = this.getAuthToken();

      const response = await apiClient.post<ApiResponse<CreateOrderResponse>>(ORDER_ENDPOINT, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: orderData
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to create order');
      }

      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  /**
   * Get order by ID
   * @param orderId - Order ID
   * @returns Promise<Order>
   */
  async getOrder(orderId: number): Promise<Order> {
    try {
      const token = this.getAuthToken();

      const response = await apiClient.get<ApiResponse<Order>>(`${ORDER_ENDPOINT}/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.success) {
        throw new Error(response.message || 'Order not found');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  /**
   * Get user's orders
   * @param params - Query parameters
   * @returns Promise<Order[]>
   */
  async getUserOrders(params: {
    page?: number;
    size?: number;
    status?: OrderStatus;
  } = {}): Promise<Order[]> {
    try {
      const token = this.getAuthToken();

      const { page = 0, size = 10, status } = params;
      
      const queryParams: Record<string, any> = { page, size };
      if (status) {
        queryParams.status = status;
      }

      const response = await apiClient.get<ApiResponse<Order[]>>(ORDER_ENDPOINT, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        query: queryParams
      });

      if (!response.success) {
        // Check if it's an authentication error
        if (response.message?.includes('Unauthorized') || response.message?.includes('token')) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(response.message || 'Failed to fetch orders');
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      
      // If it's a network error or authentication error, provide more context
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          throw new Error('Network error. Please check your connection and try again.');
        }
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          throw new Error('Authentication failed. Please log in again.');
        }
      }
      
      throw error;
    }
  },

  /**
   * Cancel an order
   * @param orderId - Order ID to cancel
   * @returns Promise<Order>
   */
  async cancelOrder(orderId: number): Promise<Order> {
    try {
      const token = this.getAuthToken();

      const response = await apiClient.patch<ApiResponse<Order>>(`${ORDER_ENDPOINT}/${orderId}/cancel`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to cancel order');
      }

      return response.data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  },

  /**
   * Update order status (for testing purposes)
   * @param orderId - Order ID
   * @param status - New status
   * @returns Promise<Order>
   */
  async updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order> {
    try {
      const token = this.getAuthToken();

      const response = await apiClient.patch<ApiResponse<Order>>(`${ORDER_ENDPOINT}/${orderId}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: { status }
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to update order status');
      }

      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  /**
   * Delete an order
   * @param orderId - Order ID to delete
   * @returns Promise<boolean>
   */
  async deleteOrder(orderId: number): Promise<boolean> {
    try {
      const token = this.getAuthToken();

      const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`${ORDER_ENDPOINT}/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.success) {
        return response.data.deleted;
      } else {
        throw new Error(response.message || 'Failed to delete order');
      }
    } catch (error) {
      console.error('❌ Error deleting order:', error);
      throw error;
    }
  }
};
