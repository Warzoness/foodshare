"use client";

import { useEffect, useRef } from "react";
import styles from "./ActiveSearchInput.module.css";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  autoFocus?: boolean;
};

export default function ActiveSearchInput({ value, onChange, onSubmit, placeholder = "Tìm món / quán gần bạn", autoFocus = true }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  return (
    <div className={styles.wrap} onClick={() => ref.current?.focus()}>
      <i className={`fi fi-rr-search ${styles.icon}`} aria-hidden></i>
      <input
        ref={ref}
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); }}
        aria-label="Tìm kiếm"
      />
      {value && (
        <button className={styles.clearBtn} aria-label="Xoá" onClick={() => onChange("")}>×</button>
      )}
    </div>
  );
}


