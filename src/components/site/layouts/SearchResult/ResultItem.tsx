"use client";
import styles from "./styles.module.css";

export type FoodResult = {
  id: number | string;
  name: string;
  price: number;         // đ
  distanceKm: number;    // km
  flashDealPercent?: number; // %
  imgUrl?: string;
  vendor?: string;
  category?: string;
};

export default function ResultItem({ item }: { item: FoodResult }) {
  const metaParts = [
    `${item.price.toLocaleString()}đ`,
    `${item.distanceKm} km`,
    item.flashDealPercent ? `Flash -${item.flashDealPercent}%` : undefined,
  ].filter(Boolean) as string[];

  return (
    <li className={styles.row}>
      <img src={item.imgUrl ?? "/food/placeholder.jpg"} alt="" className={styles.thumb} />
      <div className={styles.mid}>
        <div className={styles.title} title={item.name}>{item.name}</div>
        {(item.vendor || item.category) && (
          <div className={styles.sub}>
            {item.vendor ?? "Quán"}{item.category ? ` · ${item.category}` : ""}
          </div>
        )}
        <div className={styles.meta}>
          {metaParts.map((t, idx) => (
            <span key={idx} className={styles.metaPart}>
              {idx > 0 && <span className={styles.dot} aria-hidden>•</span>}{t}
            </span>
          ))}
        </div>
      </div>
      <button className={styles.more} aria-label="Tuỳ chọn">▾</button>
    </li>
  );
}
