"use client";

import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-vh-100 d-grid" style={{ gridTemplateColumns: "260px 1fr" }}>
      <aside className="border-end bg-light">
        <div className="p-3 border-bottom">
          <Link href="/admin" className="fw-bold text-success h5 m-0 d-block">FoodShare Admin</Link>
          <small className="text-muted">Quản trị hệ thống</small>
        </div>
        <nav className="nav flex-column p-3 gap-1">
          <Link className="nav-link" href="/admin">Dashboard</Link>
          <Link className="nav-link" href="/admin/items">Quản lý thực phẩm</Link>
          <Link className="nav-link" href="/admin/users">Người dùng</Link>
          <Link className="nav-link" href="/admin/settings">Cấu hình</Link>
        </nav>
      </aside>

      <main className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="m-0">Bảng điều khiển</h5>
          <div className="d-flex gap-2">
            <Link href="/" className="btn btn-outline-secondary btn-sm">Về trang chủ</Link>
            <Link href="/auth/logout" className="btn btn-danger btn-sm">Đăng xuất</Link>
          </div>
        </div>
        <div>{children}</div>
      </main>
    </div>
  );
}
