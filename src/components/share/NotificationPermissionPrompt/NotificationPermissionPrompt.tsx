"use client";

import styles from "./NotificationPermissionPrompt.module.css";

interface NotificationPermissionPromptProps {
  onAllow: () => void;
  onDeny: () => void;
}

export default function NotificationPermissionPrompt({
  onAllow,
  onDeny,
}: NotificationPermissionPromptProps) {
  const handleAllow = () => {
    onAllow();
  };

  const handleDeny = () => {
    onDeny();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.iconContainer}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        <h3 className={styles.title}>Bật thông báo để không bỏ lỡ</h3>
        <p className={styles.description}>
          Chúng tôi sẽ gửi thông báo về đơn hàng, khuyến mãi và các cập nhật
          quan trọng để bạn có trải nghiệm mua sắm thuận tiện hơn.
        </p>
        <div className={styles.buttonGroup}>
          <button

            className={styles.denyButton}
            onClick={handleDeny}
            type="button"
          >
            Không, cảm ơn
          </button>
          <button
            className={styles.allowButton}
            onClick={handleAllow}
            type="button"
          >
            Bật thông báo
          </button>
        </div>
      </div>
    </div>
  );
}

