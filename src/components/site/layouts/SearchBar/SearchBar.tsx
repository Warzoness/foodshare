"use client";

import { useRouter } from "next/navigation";
import styles from "./SearchBar.module.css";

type Props = {
  active?: boolean;
  value?: string;
  onChange?: (v: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
};

export default function SearchBar({ active = false, value, onChange, onSubmit, placeholder = "Tìm trên cửa hàng", autoFocus = false }: Props) {
  const router = useRouter();
  const go = () => router.push("/search");

  return (
    <div
      className={styles.searchBar}
      role={active ? undefined : "button"}
      tabIndex={active ? -1 : 0}
      onClick={active ? undefined : go}
      onKeyDown={active ? undefined : (e) => (e.key === "Enter" || e.key === " " ? go() : null)}
      aria-label={active ? "Thanh tìm kiếm" : "Mở tìm kiếm"}
    >
      <div className={styles.inner}>
        <i className={`fi fi-rr-search ${styles.searchIcon}`} aria-hidden></i>
        <input
          className={styles.searchInput}
          placeholder={placeholder}
          readOnly={!active}
          value={value}
          onChange={active ? (e) => onChange?.(e.target.value) : undefined}
          onKeyDown={active ? (e) => { if (e.key === "Enter") onSubmit?.(); } : undefined}
          autoFocus={active ? autoFocus : false}
          aria-label="Ô tìm kiếm"
        />
      </div>
    </div>
  );
}
