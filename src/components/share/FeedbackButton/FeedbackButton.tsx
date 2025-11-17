"use client";
import { useState, useEffect } from "react";
import styles from "./FeedbackButton.module.css";
import { AuthService } from "@/services/site/auth.service";
import { FeedbackService } from "@/services/site/feedback.service";
import { showToast } from "../Toast/ToastContainer";

interface FeedbackButtonProps {
  onFeedbackSubmit?: (content: string) => void;
}

export default function FeedbackButton({ onFeedbackSubmit }: FeedbackButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kiểm tra xem nút feedback có nên hiển thị không
  useEffect(() => {
    // Mỗi lần mở trang, kiểm tra session storage thay vì localStorage
    const feedbackHiddenThisSession = sessionStorage.getItem('feedback-hidden-session');
    if (!feedbackHiddenThisSession) {
      setIsVisible(true);
    }
  }, []);

  const handleFeedbackClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFeedbackContent("");
  };

  const handleHideFeedback = () => {
    setIsVisible(false);
    sessionStorage.setItem('feedback-hidden-session', 'true');
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackContent.trim()) return;

    setIsSubmitting(true);
    try {
      // Sử dụng FeedbackService với apiClient
      const response = await FeedbackService.submitFeedback({
        content: feedbackContent.trim(),
        userId: getUserId()
      });

      if (response.success) {
        showToast('Cảm ơn bạn đã gửi phản hồi! Chúng tôi sẽ xem xét và cải thiện ứng dụng.', 'success', 4000);
        handleCloseModal();
        handleHideFeedback(); // Ẩn nút sau khi gửi thành công
      } else {
        showToast(`Có lỗi xảy ra khi gửi phản hồi: ${response.message || 'Vui lòng thử lại'}`, 'error');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showToast('Có lỗi xảy ra khi gửi phản hồi. Vui lòng kiểm tra kết nối mạng và thử lại.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lấy userId nếu đã đăng nhập
  const getUserId = () => {
    try {
      const user = AuthService.getCurrentUser();
      return user?.userId || null;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <div className={styles.feedbackContainer}>
        <button 
          className={styles.feedbackButton}
          onClick={handleFeedbackClick}
          aria-label="Gửi phản hồi"
        >
          💬
        </button>
        <button 
          className={styles.closeButton}
          onClick={handleHideFeedback}
          aria-label="Tắt nút feedback"
        >
          ×
        </button>
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Gửi phản hồi</h3>
              <button 
                className={styles.closeButton}
                onClick={handleCloseModal}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <textarea
                className={styles.feedbackTextarea}
                placeholder="Chia sẻ ý kiến của bạn về ứng dụng..."
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <div className={styles.charCount}>
                {feedbackContent.length}/500
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton}
                onClick={handleCloseModal}
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button 
                className={styles.submitButton}
                onClick={handleSubmitFeedback}
                disabled={!feedbackContent.trim() || isSubmitting}
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi phản hồi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
