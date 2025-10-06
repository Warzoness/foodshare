import styles from "./FlashDealTag.module.css";

interface FlashDealTagProps {
  discountPercentage: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function FlashDealTag({ discountPercentage, className, size = "sm" }: FlashDealTagProps) {
  // Don't render if discountPercentage is falsy, 0, or negative
  if (!discountPercentage || discountPercentage <= 0) {
    return null;
  }

  return (
    <div className={`${styles.flashDealTag} ${size === "md" ? styles.large : ""} ${size === "lg" ? styles.extraLarge : ""} ${className || ""}`}>
      {(size === "md" || size === "lg") && <span className={styles.flashIcon}>⚡</span>}
      <span className={styles.percentage}>-{discountPercentage}%</span>
    </div>
  );
}
