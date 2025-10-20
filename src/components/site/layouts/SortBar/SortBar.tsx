"use client";

import Select from "react-select";
import styles from "./SortBar.module.css";
import { customSelectStyles } from "@/styles/reactSelectStyles";

export type SortKey = "relevance" | "distance" | "price" | "discount" | "name";

export type SortDirection = "asc" | "desc";

export interface SortOption {
  sortBy: SortKey;
  sortDirection: SortDirection;
  label: string;
}

const sortOptions: SortOption[] = [
  { sortBy: "relevance", sortDirection: "desc", label: "Phù hợp nhất" },
  { sortBy: "distance", sortDirection: "asc", label: "Khoảng cách (gần → xa)" },
  { sortBy: "distance", sortDirection: "desc", label: "Khoảng cách (xa → gần)" },
  { sortBy: "price", sortDirection: "asc", label: "Giá (thấp → cao)" },
  { sortBy: "price", sortDirection: "desc", label: "Giá (cao → thấp)" },
  { sortBy: "discount", sortDirection: "desc", label: "Giảm giá (cao → thấp)" },
  { sortBy: "discount", sortDirection: "asc", label: "Giảm giá (thấp → cao)" },
  { sortBy: "name", sortDirection: "asc", label: "Tên A → Z" },
  { sortBy: "name", sortDirection: "desc", label: "Tên Z → A" },
];

export default function SortBar({
  value, onChange,
}:{
  value: SortOption;
  onChange: (v: SortOption)=>void;
}) {
  return (
    <div className={styles.sortWrap}>
      <label className={styles.label}>Sắp xếp</label>
      <Select
        value={sortOptions.find(option => 
          option.sortBy === value.sortBy && option.sortDirection === value.sortDirection
        )}
        onChange={(selectedOption) => {
          const option = selectedOption as SortOption | null;
          if (option) {
            onChange(option);
          }
        }}
        options={sortOptions}
        styles={customSelectStyles}
        isSearchable={false}
        placeholder="Chọn cách sắp xếp"
        getOptionValue={(option: SortOption) => `${option.sortBy}-${option.sortDirection}`}
        getOptionLabel={(option: SortOption) => option.label}
      />
    </div>
  );
}
