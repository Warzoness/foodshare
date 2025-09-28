"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { AuthService } from "@/services/site/auth.service";
import styles from "./FloatMenu.module.css";

export default function FloatMenu() {
  const pathname = usePathname();
  const router = useRouter();

  const handleAccountClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Check if user is logged in
    const isLoggedIn = AuthService.isLoggedIn();
    
    if (isLoggedIn) {
      // User is logged in, go to settings
      router.push('/settings');
    } else {
      // User is not logged in, redirect to login
      router.push('/auth/login');
    }
  };

  return (
    <nav className={styles.bottomNav}>
      {/* Home */}
      <Link href="/" className={`${styles.navItem} ${pathname === "/" ? styles.active : ""}`}>
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
      <Link href="/search" className={`${styles.navItem} ${pathname === "/search" ? styles.active : ""}`}>
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
      <Link href="/orders" className={`${styles.navItem} ${pathname === "/orders" ? styles.active : ""}`}>
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
      <button 
        onClick={handleAccountClick}
        className={`${styles.navItem} ${styles.accountButton} ${pathname === "/settings" ? styles.active : ""}`}
      >
        <i
          className={
            pathname === "/settings"
              ? "fi fi-sr-user" // icon đậm
              : "fi fi-rr-user" // icon thường
          }
        ></i>
        <span>Tài khoản</span>
      </button>
    </nav>
  );
}
