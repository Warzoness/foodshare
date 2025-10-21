"use client";

import styles from "./LoadingSpinner.module.css";

interface LoadingSpinnerProps {
  message?: string;
  size?: "small" | "medium" | "large" | "inline";
  variant?: "default" | "white" | "dark";
  className?: string;
  showMessage?: boolean;
}

export default function LoadingSpinner({ 
  message = "Đang tải...", 
  size = "medium",
  variant = "default",
  className = "",
  showMessage = true
}: LoadingSpinnerProps) {
  const spinnerClasses = [
    styles.loadingSpinner,
    styles[size],
    styles[variant]
  ].join(" ");

  if (size === "inline") {
    return (
      <div className={`${styles.inlineContainer} ${className}`}>
        <div className={spinnerClasses}></div>
        {showMessage && message && (
          <span className={styles.inlineMessage}>{message}</span>
        )}
      </div>
    );
  }

  return (
    <div className={`${styles.loadingContainer} ${className}`}>
      <div className={spinnerClasses}></div>
      {showMessage && <div className={styles.notice}>{message}</div>}
    </div>
  );
}
