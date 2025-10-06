"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./styles.module.css";
import FlashDealTag from "@/components/share/FlashDealTag/FlashDealTag";

export type FoodResult = {
  id: number | string;
  name: string;
  price: number;         // đ
  distanceKm: number;    // km
  flashDealPercent?: number; // %
  totalOrders?: number;  // số đơn đã bán
  imgUrl?: string;
  vendor?: string;
  category?: string;
};

export default function ResultItem({ item }: { item: FoodResult }) {
  const router = useRouter();
  
  const metaParts = [
    `${item.price.toLocaleString()}đ`,
    `${item.distanceKm} km`,
  ].filter(Boolean) as string[];

  const handleItemClick = () => {
    // Navigate to product detail page
    router.push(`/items/${item.id}`);
  };

  return (
    <li className={styles.row} onClick={handleItemClick} style={{ cursor: 'pointer' }}>
      <div className={styles.thumbContainer}>
        <Image src={item.imgUrl ?? "/food/placeholder.jpg"} alt="" width={60} height={60} className={styles.thumb} />
        {item.flashDealPercent && (
          <FlashDealTag discountPercentage={item.flashDealPercent} />
        )}
      </div>
      <div className={styles.mid}>
        <div className={styles.title} title={item.name}>{item.name}</div>
        {(item.vendor || item.category) && (
          <div className={styles.sub}>
            {item.vendor ?? "Quán"}{item.totalOrders ? ` (đã bán ${item.totalOrders})` : ""}{item.category ? ` · ${item.category}` : ""}
          </div>
        )}
        <div className={styles.meta}>
          {metaParts.map((t, idx) => (
            <span key={idx} className={idx === 0 ? styles.price : styles.metaPart}>
              {idx > 0 && <span className={styles.dot} aria-hidden>•</span>}{t}
            </span>
          ))}
        </div>
      </div>
      {/*<button */}
      {/*  className={styles.more} */}
      {/*  aria-label="Tuỳ chọn"*/}
      {/*  onClick={(e) => {*/}
      {/*    e.stopPropagation(); // Prevent triggering parent click*/}
      {/*    // TODO: Add options menu*/}
      {/*  }}*/}
      {/*>▾</button>*/}
    </li>
  );
}
