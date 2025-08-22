"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./FilterModal.module.css";

export type FilterValues = {
  distanceKm: number;
  flashDealPercent: number;
  priceFrom?: number | "";
  priceTo?: number | "";
};

export default function FilterModal({
  open,
  onClose,
  onApply,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onApply: (values: FilterValues) => void;
  initial?: Partial<FilterValues>;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<FilterValues>({
    distanceKm: initial?.distanceKm ?? 5,
    flashDealPercent: initial?.flashDealPercent ?? 20,
    priceFrom: initial?.priceFrom ?? "",
    priceTo: initial?.priceTo ?? "",
  });

  // đóng bằng ESC / click nền
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    // khóa scroll nền khi mở modal
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={(e) => e.currentTarget === e.target && onClose()}>
      <div className={styles.card} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="loc-title">
        <h5 id="loc-title" className="text-center fw-bold mb-3">Lọc</h5>

        {/* Khoảng cách */}
        <label className="form-label fw-semibold mt-2">Khoảng cách</label>
        <select
          className={`form-select ${styles.select}`}
          value={form.distanceKm}
          onChange={(e) => setForm((f) => ({ ...f, distanceKm: Number(e.target.value) }))}
        >
          {[1, 2, 5, 10, 20].map((km) => (
            <option key={km} value={km}>{km} km</option>
          ))}
        </select>

        {/* Flash deal */}
        <div className="d-flex justify-content-between align-items-center mt-3 mb-1">
          <label className="fw-bold m-0">Flash deal</label>
          <span className="fw-semibold">{form.flashDealPercent}%</span>
        </div>
        <input
          type="range"
          className={styles.range}
          min={0}
          max={100}
          step={5}
          value={form.flashDealPercent}
          onChange={(e) => setForm((f) => ({ ...f, flashDealPercent: Number(e.target.value) }))}
        />

        {/* Giá từ - đến */}
        <div className="fw-semibold mt-3 mb-1">Giá từ</div>
        <div className="d-flex align-items-center gap-2">
          <input
            inputMode="numeric"
            className={`form-control ${styles.priceInput}`}
            placeholder="0"
            value={form.priceFrom}
            onChange={(e) => {
              const v = e.target.value;
              setForm((f) => ({ ...f, priceFrom: v === "" ? "" : Number(v) }));
            }}
          />
          <span className="text-muted small">đến</span>
          <input
            inputMode="numeric"
            className={`form-control ${styles.priceInput}`}
            placeholder="0"
            value={form.priceTo}
            onChange={(e) => {
              const v = e.target.value;
              setForm((f) => ({ ...f, priceTo: v === "" ? "" : Number(v) }));
            }}
          />
        </div>

        {/* Actions */}
        <div className="d-flex gap-2 mt-4">
          <button
            className={styles.applyBtn}
            onClick={() => onApply(form)}
          >
            Áp dụng
          </button>
          <button
            className={styles.clearBtn}
            onClick={() =>
              setForm({ distanceKm: 5, flashDealPercent: 20, priceFrom: "", priceTo: "" })
            }
          >
            Xóa bộ lọc
          </button>
        </div>

        {/* Close icon */}
        <button className={styles.closeX} aria-label="Đóng" onClick={onClose}>×</button>
      </div>
    </div>
  );
}
