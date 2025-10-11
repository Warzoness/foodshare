"use client";

import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import styles from "./FilterBar.module.css";
import { customSelectStyles } from "@/styles/reactSelectStyles";

export type FilterValues = {
  distanceKm?: number;
  flashDealPercent?: number;
  priceTo?: string; // chỉ giá cao nhất
};

const DISTANCES = [1, 2, 3, 5, 10];
const FLASH_DEALS = [10, 20, 30, 40, 50];

// Tạo options cho React Select
const distanceOptions = [
  { value: "", label: "Tất cả" },
  ...DISTANCES.map(km => ({ value: km.toString(), label: `≤ ${km} km` }))
];

const flashDealOptions = [
  { value: "", label: "Tất cả" },
  ...FLASH_DEALS.map(p => ({ value: p.toString(), label: `≥ ${p}%` }))
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
    if (value.distanceKm != null) t.push({ key:"distanceKm", label:`≤ ${value.distanceKm} km` });
    if (value.flashDealPercent != null) t.push({ key:"flashDealPercent", label:`Flash ≥ ${value.flashDealPercent}%` });
    if (value.priceTo) t.push({ key:"priceTo", label:`Đến ${Number(value.priceTo).toLocaleString()}đ` });
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
              value={distanceOptions.find(option => option.value === (draft.distanceKm?.toString() ?? ""))}
              onChange={(selectedOption) => 
                setDraft(d => ({ 
                  ...d, 
                  distanceKm: (selectedOption as { value: string; label: string } | null)?.value === "" ? undefined : Number((selectedOption as { value: string; label: string } | null)?.value) 
                }))
              }
              options={distanceOptions}
              styles={customSelectStyles}
              isSearchable={false}
              placeholder="Chọn khoảng cách"
            />
          </div>

          {/* Flash deal */}
          <div className={styles.filterItem}>
            <label className={styles.label}>Flash deal</label>
            <Select
              value={flashDealOptions.find(option => option.value === (draft.flashDealPercent?.toString() ?? ""))}
              onChange={(selectedOption) => 
                setDraft(d => ({ 
                  ...d, 
                  flashDealPercent: (selectedOption as { value: string; label: string } | null)?.value === "" ? undefined : Number((selectedOption as { value: string; label: string } | null)?.value) 
                }))
              }
              options={flashDealOptions}
              styles={customSelectStyles}
              isSearchable={false}
              placeholder="Chọn flash deal"
            />
          </div>

          {/* Giá đến */}
          <div className={styles.filterItem}>
            <label className={styles.label}>Giá đến</label>
            <input
              inputMode="numeric"
              value={draft.priceTo ?? ""}
              onChange={e => {
                const value = e.target.value.replace(/[^0-9]/g, ''); // Chỉ cho phép số
                setDraft(d => ({ ...d, priceTo: value }));
              }}
              className={styles.input}
              placeholder="vd: 60000"
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
                <button onClick={()=>onRemoveTag(t.key)} aria-label={`Xoá ${t.label}`} className={styles.chipX}>×</button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
