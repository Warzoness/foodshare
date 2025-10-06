"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./styles.module.css";
import FlashDealTag from "@/components/share/FlashDealTag/FlashDealTag";

export type FoodResult = {
  id: number | string;
  name: string;
  price?: number;         // đ
  distanceKm?: number;    // km
  flashDealPercent?: number; // %
  totalOrders?: number;  // số đơn đã bán
  imgUrl?: string;
  vendor?: string;
  category?: string;
};

export default function ResultItem({ item }: { item: FoodResult }) {
  const router = useRouter();
  
  const metaParts = [
    item.price && item.price > 0 ? `${item.price.toLocaleString()}đ` : null,
    item.distanceKm && item.distanceKm > 0 ? `${item.distanceKm} km` : null,
  ].filter(Boolean) as string[];

  // Ensure no "0" values are displayed
  const safeMetaParts = metaParts.filter(part => part && part !== "0" && part !== "0đ" && part !== "0 km");

  const handleItemClick = () => {
    // Navigate to product detail page
    if (item.id && item.id !== 0) {
      router.push(`/items/${item.id}`);
    }
  };

  return (
    <li className={styles.row} onClick={handleItemClick} style={{ cursor: 'pointer' }}>
      <div className={styles.thumbContainer}>
        <Image src={item.imgUrl && item.imgUrl.trim() ? item.imgUrl : "/food/placeholder.jpg"} alt="" width={60} height={60} className={styles.thumb} />
        {item.flashDealPercent && item.flashDealPercent > 0 && (
          <FlashDealTag discountPercentage={item.flashDealPercent} />
        )}
      </div>
      <div className={styles.mid}>
        <div className={styles.title} title={item.name}>{item.name || "Sản phẩm"}</div>
        {(item.vendor || item.category) && (
          <div className={styles.sub}>
            {item.vendor && item.vendor.trim() ? item.vendor : "Quán"}{item.totalOrders && item.totalOrders > 0 ? ` (đã bán ${item.totalOrders})` : ""}{item.category && item.category.trim() ? ` · ${item.category}` : ""}
          </div>
        )}
        <div className={styles.meta}>
          {safeMetaParts.map((t, idx) => (
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
