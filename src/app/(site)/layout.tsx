"use client";

import { useEffect } from "react";
import Header from "@/components/site/layouts/Header/Header";


export default function SiteLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    import("bootstrap");

  }, []);

  return (
    <>
      <main>{children}</main>

      {/* <footer className="border-top mt-5 py-4">
        <div className="container small text-muted d-flex justify-content-between">
          <span>© {new Date().getFullYear()} FoodShare</span>
          <div className="d-flex gap-3">
            <Link href="/about" className="link-secondary">Giới thiệu</Link>
            <Link href="/terms" className="link-secondary">Điều khoản</Link>
            <Link href="/privacy" className="link-secondary">Bảo mật</Link>
          </div>
        </div>
      </footer> */}
    </>
  );
}
