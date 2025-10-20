import { apiClient } from "@/lib/apiClient";

export interface FeedbackRequest {
  content: string;
  userId?: number | null;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
}

const FEEDBACK_ENDPOINT = "/feedback";

export const FeedbackService = {
  /**
   * Gửi feedback đến backend
   * @param feedbackData - Dữ liệu feedback
   * @returns Promise<FeedbackResponse>
   */
  async submitFeedback(feedbackData: FeedbackRequest): Promise<FeedbackResponse> {
    try {
      const response = await apiClient.post<FeedbackResponse>(FEEDBACK_ENDPOINT, {
        body: feedbackData,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response;
    } catch (error) {
      console.error('❌ Error submitting feedback:', error);
      throw error;
    }
  }
};
