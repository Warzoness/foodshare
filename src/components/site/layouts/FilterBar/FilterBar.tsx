"use client";

import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import styles from "./FilterBar.module.css";
import { customSelectStyles } from "@/styles/reactSelectStyles";

export type FilterValues = {
  maxDistanceKm?: number;        // Maximum distance in kilometers
  minDiscount?: number;          // Minimum discount percentage
  minPrice?: number;             // Minimum price filter
  maxPrice?: number;             // Maximum price filter
};

const DISTANCES = [1, 2, 3, 5, 10];
const DISCOUNTS = [10, 20, 30, 40, 50];
const PRICE_RANGES = [
  { min: 0, max: 50000, label: "Dưới 50k" },
  { min: 50000, max: 100000, label: "50k - 100k" },
  { min: 100000, max: 200000, label: "100k - 200k" },
  { min: 200000, max: 500000, label: "200k - 500k" },
];

// Tạo options cho React Select
const distanceOptions = [
  { value: "", label: "Tất cả" },
  ...DISTANCES.map(km => ({ value: km.toString(), label: `≤ ${km} km` }))
];

const discountOptions = [
  { value: "", label: "Tất cả" },
  ...DISCOUNTS.map(p => ({ value: p.toString(), label: `≥ ${p}%` }))
];

const priceRangeOptions = [
  { value: "", label: "Tất cả" },
  ...PRICE_RANGES.map(range => ({ 
    value: `${range.min}-${range.max}`, 
    label: range.label 
  }))
];

export default function FilterBar({
  value, onApply, onRemoveTag, onClearAll,
}:{
  value: FilterValues;
  onApply: (v: FilterValues)=>void;
  onRemoveTag?: (k: keyof FilterValues)=>void;
  onClearAll: ()=>void;
}) {
  const [draft, setDraft] = useState<FilterValues>(value);
  const [activeButton, setActiveButton] = useState<'filter' | 'clear' | null>(null);
  useEffect(()=>setDraft(value), [value]);

  const tags = useMemo(()=> {
    const t: {key:keyof FilterValues; label:string}[] = [];
    if (value.maxDistanceKm != null) t.push({ key:"maxDistanceKm", label:`≤ ${value.maxDistanceKm} km` });
    if (value.minDiscount != null) t.push({ key:"minDiscount", label:`Giảm ≥ ${value.minDiscount}%` });
    if (value.minPrice != null || value.maxPrice != null) {
      const min = value.minPrice ? `${value.minPrice.toLocaleString()}đ` : '0đ';
      const max = value.maxPrice ? `${value.maxPrice.toLocaleString()}đ` : '∞';
      // Use minPrice as the key since it's a valid FilterValues property
      t.push({ key:"minPrice", label:`${min} - ${max}` });
    }
    return t;
  }, [value]);

  return (
    <div className={styles.wrap}>
      <div className={styles.horizontalBar}>
        <div className={styles.filterRow}>
          {/* Khoảng cách */}
          <div className={styles.filterItem}>
            <label className={styles.label}>Khoảng cách</label>
            <Select
              value={distanceOptions.find(option => option.value === (draft.maxDistanceKm?.toString() ?? ""))}
              onChange={(selectedOption) => 
                setDraft(d => ({ 
                  ...d, 
                  maxDistanceKm: (selectedOption as { value: string; label: string } | null)?.value === "" ? undefined : Number((selectedOption as { value: string; label: string } | null)?.value) 
                }))
              }
              options={distanceOptions}
              styles={customSelectStyles}
              isSearchable={false}
              placeholder="Chọn khoảng cách"
            />
          </div>

          {/* Giảm giá */}
          <div className={styles.filterItem}>
            <label className={styles.label}>Giảm giá</label>
            <Select
              value={discountOptions.find(option => option.value === (draft.minDiscount?.toString() ?? ""))}
              onChange={(selectedOption) => 
                setDraft(d => ({ 
                  ...d, 
                  minDiscount: (selectedOption as { value: string; label: string } | null)?.value === "" ? undefined : Number((selectedOption as { value: string; label: string } | null)?.value) 
                }))
              }
              options={discountOptions}
              styles={customSelectStyles}
              isSearchable={false}
              placeholder="Chọn mức giảm giá"
            />
          </div>

          {/* Khoảng giá */}
          <div className={styles.filterItem}>
            <label className={styles.label}>Khoảng giá</label>
            <Select
              value={priceRangeOptions.find(option => {
                const [min, max] = option.value.split('-').map(Number);
                return draft.minPrice === min && draft.maxPrice === max;
              })}
              onChange={(selectedOption) => {
                const value = (selectedOption as { value: string; label: string } | null)?.value;
                if (value === "") {
                  setDraft(d => ({ ...d, minPrice: undefined, maxPrice: undefined }));
                } else if (value) {
                  const [min, max] = value.split('-').map(Number);
                  setDraft(d => ({ ...d, minPrice: min, maxPrice: max }));
                }
              }}
              options={priceRangeOptions}
              styles={customSelectStyles}
              isSearchable={false}
              placeholder="Chọn khoảng giá"
            />
          </div>
        </div>

        {/* Nút */}
        <div className={styles.actionItem}>
          <button 
            onClick={() => {
              setActiveButton('filter');
              onApply(draft);
              // Giữ trạng thái active trong 2 giây
              setTimeout(() => setActiveButton(null), 2000);
            }} 
            className={`${styles.btnPrimary} ${activeButton === 'filter' ? styles.active : ''}`}
          >
            Lọc
          </button>
          <button 
            onClick={() => {
              setActiveButton('clear');
              onClearAll();
              // Giữ trạng thái active trong 2 giây
              setTimeout(() => setActiveButton(null), 2000);
            }} 
            className={`${styles.btnGhost} ${activeButton === 'clear' ? styles.active : ''}`}
          >
            Xoá
          </button>
        </div>
      </div>

      {/* Chips */}
      {tags.length>0 && (
        <div className={styles.chips}>
          {tags.map(t => (
            <span key={t.key as string} className={styles.chip}>
              {t.label}
              {onRemoveTag && (
                <button onClick={()=>{
                  if (t.key === "minPrice") {
                    // For price range, we need to clear both minPrice and maxPrice
                    onRemoveTag("minPrice");
                    onRemoveTag("maxPrice");
                  } else {
                    onRemoveTag(t.key);
                  }
                }} aria-label={`Xoá ${t.label}`} className={styles.chipX}>×</button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
