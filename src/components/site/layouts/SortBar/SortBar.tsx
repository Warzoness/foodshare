"use client";

import Select from "react-select";
import styles from "./SortBar.module.css";
import { customSelectStyles } from "@/styles/reactSelectStyles";

export type SortKey = "relevance" | "distanceAsc" | "priceAsc" | "priceDesc" | "flashDesc" | "ordersDesc";

const sortOptions = [
  { value: "relevance", label: "Phù hợp nhất" },
  { value: "distanceAsc", label: "Khoảng cách (gần → xa)" },
  { value: "priceAsc", label: "Giá (thấp → cao)" },
  { value: "priceDesc", label: "Giá (cao → thấp)" },
  { value: "flashDesc", label: "Flash deal (cao → thấp)" },
  { value: "ordersDesc", label: "Mua nhiều (cao → thấp)" },
];

export default function SortBar({
  value, onChange,
}:{
  value: SortKey;
  onChange: (v: SortKey)=>void;
}) {
  return (
    <div className={styles.sortWrap}>
      <label className={styles.label}>Sắp xếp</label>
      <Select
        value={sortOptions.find(option => option.value === value)}
        onChange={(selectedOption) => onChange((selectedOption as { value: string; label: string } | null)?.value as SortKey)}
        options={sortOptions}
        styles={customSelectStyles}
        isSearchable={false}
        placeholder="Chọn cách sắp xếp"
      />
    </div>
  );
}
