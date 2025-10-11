"use client";

import styles from "./LoadingSpinner.module.css";

interface LoadingSpinnerProps {
  message?: string;
  size?: "small" | "medium" | "large";
  className?: string;
}

export default function LoadingSpinner({ 
  message = "Đang tải...", 
  size = "medium",
  className = ""
}: LoadingSpinnerProps) {
  return (
    <div className={`${styles.loadingContainer} ${className}`}>
      <div className={`${styles.loadingSpinner} ${styles[size]}`}></div>
      <div className={styles.notice}>{message}</div>
    </div>
  );
}
