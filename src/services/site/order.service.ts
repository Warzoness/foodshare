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
      throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
    }
    return token;
  },

  /**
   * Translate error messages to Vietnamese
   * @param message - English error message
   * @returns Vietnamese error message
   */
  translateErrorMessage(message: string): string {
    const translations: Record<string, string> = {
      'Insufficient stock': 'Không đủ hàng trong kho',
      'Not enough stock': 'Không đủ hàng trong kho',
      'Stock not available': 'Không đủ hàng trong kho',
      'Out of stock': 'Hết hàng',
      'Product not found': 'Không tìm thấy sản phẩm',
      'Shop not found': 'Không tìm thấy cửa hàng',
      'User not found': 'Không tìm thấy người dùng',
      'Invalid quantity': 'Số lượng không hợp lệ',
      'Invalid pickup time': 'Thời gian lấy hàng không hợp lệ',
      'Order already exists': 'Đơn hàng đã tồn tại',
      'Payment failed': 'Thanh toán thất bại',
      'Network error': 'Lỗi mạng',
      'Server error': 'Lỗi máy chủ',
      'Authentication failed': 'Xác thực thất bại',
      'Unauthorized': 'Không có quyền truy cập',
      'Forbidden': 'Bị cấm truy cập',
      'Not found': 'Không tìm thấy',
      'Bad request': 'Yêu cầu không hợp lệ',
      'Internal server error': 'Lỗi máy chủ nội bộ',
      'Service unavailable': 'Dịch vụ không khả dụng',
      'Timeout': 'Hết thời gian chờ',
      'Failed to create order': 'Không thể tạo đơn hàng',
      'Order creation failed': 'Tạo đơn hàng thất bại',
      'Product unavailable': 'Sản phẩm không khả dụng',
      'Quantity exceeds available stock': 'Số lượng vượt quá hàng có sẵn'
    };

    // Check for exact match first
    if (translations[message]) {
      return translations[message];
    }

    // Check for partial matches (case insensitive)
    const lowerMessage = message.toLowerCase();
    for (const [english, vietnamese] of Object.entries(translations)) {
      if (lowerMessage.includes(english.toLowerCase())) {
        return vietnamese;
      }
    }

    // Return original message if no translation found
    return message;
  },
  /**
   * Create a new order (POST /orders)
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


      // Check if response exists and has the expected structure
      if (!response) {
        console.error('❌ No response received from API');
        throw new Error('Không nhận được phản hồi từ máy chủ. Vui lòng thử lại.');
      }

      if (!response.success) {
        // Translate common error messages to Vietnamese
        const errorMessage = response.message || 'Không thể tạo đơn hàng';
        const translatedMessage = this.translateErrorMessage(errorMessage);
        
        // Log detailed error information for debugging
        console.error('❌ Order creation failed:', {
          responseType: typeof response,
          responseKeys: Object.keys(response || {}),
          success: response.success,
          message: response.message,
          translatedMessage,
          code: response.code,
          fullResponse: response,
          orderData
        });
        
        throw new Error(translatedMessage);
      }

      return response.data;
    } catch (error) {
      console.error('❌ Error creating order:', error);
      
      // Handle different types of errors
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        // Check if it's an HTTP error from the API client
        if (errorMessage.includes('http 4') || errorMessage.includes('http 5')) {
          // Extract status code and provide appropriate message
          const statusMatch = errorMessage.match(/http (\d+)/);
          const statusCode = statusMatch ? statusMatch[1] : 'unknown';
          
          console.error('❌ HTTP Error details:', {
            statusCode,
            errorMessage,
            fullError: error
          });
          
          // Provide specific error messages based on status code
          switch (statusCode) {
            case '400':
              throw new Error('Yêu cầu không hợp lệ. Vui lòng kiểm tra thông tin đơn hàng.');
            case '401':
              throw new Error('Xác thực thất bại. Vui lòng đăng nhập lại.');
            case '403':
              throw new Error('Không có quyền thực hiện thao tác này.');
            case '404':
              throw new Error('Không tìm thấy sản phẩm hoặc cửa hàng.');
            case '409':
              throw new Error('Xung đột dữ liệu. Có thể sản phẩm đã hết hàng.');
            case '422':
              throw new Error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.');
            case '500':
              throw new Error('Lỗi máy chủ. Vui lòng thử lại sau.');
            default:
              throw new Error('Không thể tạo đơn hàng. Vui lòng thử lại.');
          }
        }
        
        // Handle other error types
        if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          throw new Error('Lỗi mạng. Vui lòng kiểm tra kết nối và thử lại.');
        }
        
        if (errorMessage.includes('timeout')) {
          throw new Error('Hết thời gian chờ. Vui lòng thử lại.');
        }
        
        // If it's already a translated error, re-throw it
        if (errorMessage.includes('không') || errorMessage.includes('vui lòng')) {
          throw error;
        }
      }
      
      // For any other errors, provide a generic message
      throw new Error('Không thể tạo đơn hàng. Vui lòng thử lại.');
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
        const errorMessage = response.message || 'Không tìm thấy đơn hàng';
        const translatedMessage = this.translateErrorMessage(errorMessage);
        throw new Error(translatedMessage);
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
        const message = (response.message || '').toLowerCase();
        const code = (response.code || '').toLowerCase();
        
        if (message.includes('unauthorized') || 
            message.includes('token') || 
            message.includes('authentication') ||
            code.includes('401') ||
            code.includes('unauthorized')) {
          throw new Error('Xác thực thất bại. Vui lòng đăng nhập lại.');
        }
        
        const errorMessage = response.message || 'Không thể tải danh sách đơn hàng';
        const translatedMessage = this.translateErrorMessage(errorMessage);
        throw new Error(translatedMessage);
      }

      return response.data || [];
    } catch (error) {
      console.error('❌ Error fetching user orders:', error);
      
      // If it's a network error or authentication error, provide more context
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        
        // HTTP 401 Unauthorized
        if (errorMessage.includes('401') || 
            errorMessage.includes('unauthorized')) {
          throw new Error('Xác thực thất bại. Vui lòng đăng nhập lại.');
        }
        
        // Network errors
        if (errorMessage.includes('fetch') || 
            errorMessage.includes('network') ||
            errorMessage.includes('connection')) {
          throw new Error('Lỗi mạng. Vui lòng kiểm tra kết nối và thử lại.');
        }
        
        // Authentication errors from API response
        if (errorMessage.includes('authentication') ||
            errorMessage.includes('token')) {
          throw new Error('Xác thực thất bại. Vui lòng đăng nhập lại.');
        }
        
        // If it's already our custom error, re-throw it
        if (errorMessage.includes('xác thực thất bại') || 
            errorMessage.includes('lỗi mạng')) {
          throw error;
        }
      }
      
      // For any other errors, provide a generic message
      throw new Error('Không thể tải danh sách đơn hàng. Vui lòng thử lại.');
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
        const errorMessage = response.message || 'Không thể hủy đơn hàng';
        const translatedMessage = this.translateErrorMessage(errorMessage);
        throw new Error(translatedMessage);
      }

      return response.data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  },

  /**
   * Update order status
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
        const errorMessage = response.message || 'Không thể cập nhật trạng thái đơn hàng';
        const translatedMessage = this.translateErrorMessage(errorMessage);
        throw new Error(translatedMessage);
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
        const errorMessage = response.message || 'Không thể xóa đơn hàng';
        const translatedMessage = this.translateErrorMessage(errorMessage);
        throw new Error(translatedMessage);
      }
    } catch (error) {
      console.error('❌ Error deleting order:', error);
      throw error;
    }
  },

  /**
   * Get user's order statistics
   * @returns Promise<OrderStats>
   */
  async getOrderStats(): Promise<{
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
  }> {
    try {
      const token = this.getAuthToken();

      // Get all orders with a large page size to get complete stats
      const response = await apiClient.get<ApiResponse<Order[]>>(ORDER_ENDPOINT, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        query: { page: 0, size: 1000 } // Get all orders
      });


      if (!response.success) {
        
        // Check if it's an authentication error
        const message = (response.message || '').toLowerCase();
        
        if (message.includes('unauthorized') || 
            message.includes('token') || 
            message.includes('authentication')) {
          throw new Error('Xác thực thất bại. Vui lòng đăng nhập lại.');
        }
        
        const errorMessage = response.message || 'Không thể tải thống kê đơn hàng';
        const translatedMessage = this.translateErrorMessage(errorMessage);
        throw new Error(translatedMessage);
      }

      const orders = response.data || [];
      
      // Calculate statistics based on new status mapping
      const stats = {
        total: orders.length,
        completed: orders.filter(order => order.status === '4').length, // Hoàn thành
        pending: orders.filter(order => 
          order.status === '1' || order.status === '2' // Chờ xác nhận + Đã xác nhận
        ).length,
        cancelled: orders.filter(order => order.status === '3').length // Đã hủy
      };

      return stats;
    } catch (error) {
      console.error('❌ Error fetching order stats:', error);
      
      // If it's a network error or authentication error, provide more context
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        // HTTP 401 Unauthorized
        if (errorMessage.includes('401') || 
            errorMessage.includes('unauthorized')) {
          throw new Error('Xác thực thất bại. Vui lòng đăng nhập lại.');
        }
        
        // Network errors
        if (errorMessage.includes('fetch') || 
            errorMessage.includes('network') ||
            errorMessage.includes('connection')) {
          throw new Error('Lỗi mạng. Vui lòng kiểm tra kết nối và thử lại.');
        }
        
        // Authentication errors from API response
        if (errorMessage.includes('authentication') ||
            errorMessage.includes('token')) {
          throw new Error('Xác thực thất bại. Vui lòng đăng nhập lại.');
        }
        
        // If it's already our custom error, re-throw it
        if (errorMessage.includes('xác thực thất bại') || 
            errorMessage.includes('lỗi mạng')) {
          throw error;
        }
      }
      
      // For any other errors, provide a generic message
      throw new Error('Không thể tải thống kê đơn hàng. Vui lòng thử lại.');
    }
  }
};
