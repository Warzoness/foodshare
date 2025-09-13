"use client";

import styles from "./SortBar.module.css";

export type SortKey = "relevance" | "distanceAsc" | "priceAsc" | "priceDesc" | "flashDesc";

export default function SortBar({
  value, onChange,
}:{
  value: SortKey;
  onChange: (v: SortKey)=>void;
}) {
  return (
    <div className={styles.sortWrap}>
      <label className={styles.label} htmlFor="sort">Sắp xếp</label>
      <select
        id="sort"
        className={styles.select}
        value={value}
        onChange={(e)=>onChange(e.target.value as SortKey)}
      >
        <option value="relevance">Phù hợp nhất</option>
        <option value="distanceAsc">Khoảng cách (gần → xa)</option>
        <option value="priceAsc">Giá (thấp → cao)</option>
        <option value="priceDesc">Giá (cao → thấp)</option>
        <option value="flashDesc">Flash deal (cao → thấp)</option>
      </select>
    </div>
  );
}
