"use client";

import { useState } from "react";
import FloatMenu from "@/components/site/layouts/FloatMenu/FloatMenu";
import styles from "./settings.module.css";

export default function SettingsPage() {
  const [name, setName] = useState<string>("Trần Minh Chiến");
  const [phone, setPhone] = useState<string>("0369454687");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: call API update profile
  }

  return (
    <main className="container py-3" style={{ maxWidth: 560 }}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => history.back()} aria-label="Quay lại">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 19l-7-7 7-7" stroke="#2b2b2b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button className={styles.iconBtn} aria-label="Cài đặt">
          <span className="fi fi-rr-settings"></span>
        </button>
      </header>

      <form onSubmit={onSubmit} className="d-flex flex-column align-items-center">
        <div className={styles.avatar} aria-hidden>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="36" r="22" fill="none" stroke="#cbd5e1" strokeWidth="3" />
            <path d="M20 98c8-18 28-28 40-28s32 10 40 28" fill="none" stroke="#cbd5e1" strokeWidth="3" />
            <circle cx="86" cy="64" r="10" fill="none" stroke="#cbd5e1" strokeWidth="3" />
          </svg>
        </div>

        <div className="text-center mt-1 mb-3 fw-semibold">Tran Minh Chien</div>

        <div className="w-100" style={{ maxWidth: 520 }}>
          <label className="form-label">Tên</label>
          <input
            className="form-control border-success"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên"
          />

          <label className="form-label mt-3">Số điện thoại</label>
          <input
            className="form-control"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="numeric"
            placeholder="Nhập số điện thoại"
          />

          <button type="submit" className={styles.submitBtn}>Cập nhật</button>
        </div>
      </form>

      <FloatMenu />
    </main>
  );
}