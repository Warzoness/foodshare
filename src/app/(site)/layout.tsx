"use client";

import Link from "next/link";
import Image from "next/image";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="navbar navbar-expand-lg" style={{ background: "var(--brand)" }}>
        <div className="container">
          <Link className="navbar-brand text-white fw-bold" href="/">
            FoodShare
          </Link>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#siteNav">
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="siteNav">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item"><Link className="nav-link text-white" href="/items">Kho thực phẩm</Link></li>
              <li className="nav-item"><Link className="nav-link text-white" href="/about">Về chúng tôi</Link></li>
            </ul>
            <div className="d-flex ms-lg-3 gap-2">
              <Link href="/auth/login" className="btn btn-light btn-sm">Đăng nhập</Link>
              <Link href="/admin" className="btn btn-outline-light btn-sm">Trang quản trị</Link>
            </div>
          </div>
        </div>
      </nav>

      <main>{children}</main>

      <footer className="border-top mt-5 py-4">
        <div className="container small text-muted d-flex justify-content-between">
          <span>© {new Date().getFullYear()} FoodShare</span>
          <div className="d-flex gap-3">
            <Link href="/about" className="link-secondary">Giới thiệu</Link>
            <Link href="/terms" className="link-secondary">Điều khoản</Link>
            <Link href="/privacy" className="link-secondary">Bảo mật</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
