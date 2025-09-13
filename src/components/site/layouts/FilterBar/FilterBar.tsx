"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./FilterBar.module.css";

export type FilterValues = {
  distanceKm?: number;
  flashDealPercent?: number;
  priceTo?: string; // chỉ giá cao nhất
};

const DISTANCES = [1, 2, 3, 5, 10];
const FLASH_DEALS = [10, 20, 30, 40, 50];

export default function FilterBar({
  value, onApply, onRemoveTag, onClearAll,
}:{
  value: FilterValues;
  onApply: (v: FilterValues)=>void;
  onRemoveTag: (k: keyof FilterValues)=>void;
  onClearAll: ()=>void;
}) {
  const [draft, setDraft] = useState<FilterValues>(value);
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
        {/* Khoảng cách */}
        <div className={styles.filterItem}>
          <label className={styles.label}>Khoảng cách</label>
          <select
            value={draft.distanceKm ?? ""}
            onChange={e => setDraft(d => ({ ...d, distanceKm: e.target.value === "" ? undefined : Number(e.target.value) }))}
            className={styles.select}
          >
            <option value="">Tất cả</option>
            {DISTANCES.map(km => <option key={km} value={km}>{`≤ ${km} km`}</option>)}
          </select>
        </div>

        {/* Flash deal */}
        <div className={styles.filterItem}>
          <label className={styles.label}>Flash deal</label>
          <select
            value={draft.flashDealPercent ?? ""}
            onChange={e => setDraft(d => ({ ...d, flashDealPercent: e.target.value === "" ? undefined : Number(e.target.value) }))}
            className={styles.select}
          >
            <option value="">Tất cả</option>
            {FLASH_DEALS.map(p => <option key={p} value={p}>{`≥ ${p}%`}</option>)}
          </select>
        </div>

        {/* Giá đến */}
        <div className={styles.filterItem}>
          <label className={styles.label}>Giá đến</label>
          <input
            inputMode="numeric"
            value={draft.priceTo ?? ""}
            onChange={e => setDraft(d => ({ ...d, priceTo: e.target.value }))}
            className={styles.input}
            placeholder="vd: 60000"
          />
        </div>

        {/* Nút */}
        <div className={styles.actionItem}>
          <button onClick={()=>onApply(draft)} className={styles.btnPrimary}>Lọc</button>
          <button onClick={onClearAll} className={styles.btnGhost}>Xoá</button>
        </div>
      </div>

      {/* Chips */}
      {tags.length>0 && (
        <div className={styles.chips}>
          {tags.map(t => (
            <span key={t.key as string} className={styles.chip}>
              {t.label}
              <button onClick={()=>onRemoveTag(t.key)} aria-label={`Xoá ${t.label}`} className={styles.chipX}>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
