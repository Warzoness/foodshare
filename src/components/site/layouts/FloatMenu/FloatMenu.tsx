"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./FloatMenu.module.css";

export default function FloatMenu() {
  const pathname = usePathname();

  return (
    <nav className={styles.bottomNav}>
      {/* Home */}
      <Link href="/" className={styles.navItem}>
        <i
          className={
            pathname === "/"
              ? "fi fi-sr-house-chimney"
              : "fi fi-tr-house-chimney"
          }
        ></i>
        <span>Trang Chủ</span>
      </Link>

      {/* Search */}
      <Link href="/search" className={styles.navItem}>
        <i
          className={
            pathname === "/search"
              ? "fi fi-sr-search" // thay bằng icon 
              : "fi fi-rs-search" // thay bằng icon 
          }
        ></i>
        <span>Tìm kiếm</span>
      </Link>

      {/* Favorites */}
      <Link href="/orders" className={styles.navItem}>
        <i
          className={
            pathname === "/orders"
              ? "fi fi-sr-to-do-alt" // icon đậm
              : "fi fi-ts-to-do-alt" // icon thường
          }
        ></i>
        <span>Giữ chỗ</span>
      </Link>

      {/* Account */}
      <Link href="/settings" className={styles.navItem}>
        <i
          className={
            pathname === "/settings"
              ? "fi fi-sr-user" // icon đậm
              : "fi fi-rr-user" // icon thường
          }
        ></i>
        <span>Tài khoản</span>
      </Link>
    </nav>
  );
}
