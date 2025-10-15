"use client";

import {usePathname} from "next/navigation";
import Link from "next/link";
import {AuthService} from "@/services/site/auth.service";
import styles from "./FloatMenu.module.css";

export default function FloatMenu() {
  const pathname = usePathname();

  // Determine account link href based on login status
  const getAccountHref = () => {
    const isLoggedIn = AuthService.isLoggedIn();
    return isLoggedIn ? '/settings' : '/auth/login';
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

      {/* Orders */}
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

      {/* Become Seller */}
      <Link href="/become-seller" className={`${styles.navItem} ${pathname === "/become-seller" ? styles.active : ""}`}>
        <i
          className={
            pathname === "/become-seller"
              ? "fi fi-sr-shop" // icon đậm - shop
              : "fi fi-rr-shop" // icon thường - shop
          }
        ></i>
        <span>Bán hàng</span>
      </Link>

      {/* Account */}
      <Link 
        href={getAccountHref()} 
        className={`${styles.navItem} ${pathname === "/settings" || pathname === "/auth/login" ? styles.active : ""}`}
      >
        <i
          className={
            pathname === "/settings" || pathname === "/auth/login"
              ? "fi fi-sr-user" // icon đậm
              : "fi fi-rr-user" // icon thường
          }
        ></i>
        <span>Tài khoản</span>
      </Link>
    </nav>
  );
}
