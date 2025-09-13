"use client";

import { useRouter } from "next/navigation";
import styles from "./SearchBar.module.css";

export default function SearchBar() {
  const router = useRouter();
  const go = () => router.push("/search");

  return (
    <div
      className={styles.searchBar}
      role="button"
      tabIndex={0}
      onClick={go}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? go() : null)}
      aria-label="Mở tìm kiếm"
    >
      <span className={styles.searchIcon} aria-hidden>🔎</span>
      <input className={styles.searchInput} placeholder="Tìm trên cửa hàng" readOnly />
    </div>
  );
}
