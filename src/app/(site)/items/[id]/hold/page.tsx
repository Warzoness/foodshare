"use client";

import { useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./hold.module.css";

/* ========= Utils ========= */
const VN_TZ = "Asia/Ho_Chi_Minh";

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`; // dùng cho <input type="date">
}
function formatDateVN(dateISO: string) {
  const [y, m, d] = dateISO.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: VN_TZ,
  }).format(dt);
}
function formatTimeVN24(timeHM: string) {
  const [hh, mm] = timeHM.split(":").map(Number);
  const dt = new Date(2000, 0, 1, hh ?? 0, mm ?? 0);
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // 24h
    timeZone: VN_TZ,
  }).format(dt);
}
function vnd(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + " đ";
}

/* ========= Page ========= */
type SuccessData = { code: string };

export default function HoldPage() {
  const router = useRouter();
  useParams<{ id: string }>(); // nếu cần id
  const sp = useSearchParams();

  const itemName = sp.get("name") ?? "Gà sốt cay";
  const unitPrice = Number(sp.get("price") ?? 45000);
  const imgSrc = sp.get("img") ?? "/images/chicken-fried.jpg";

  const [dateISO, setDateISO] = useState<string>(todayISO());
  const [timeHM, setTimeHM] = useState<string>("18:00"); // 24h
  const [qty, setQty] = useState<number>(1);
  const total = useMemo(() => qty * unitPrice, [qty, unitPrice]);

  const [success, setSuccess] = useState<SuccessData | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = String(Math.floor(2_000_000 + Math.random() * 8_000_000));
    setSuccess({ code });
  }

  /* ----- Success screen ----- */
  if (success) {
    return (
      <main className="container py-3" style={{ maxWidth: 560 }}>
        <button className="btn btn-link p-0 mb-2" onClick={() => router.back()} aria-label="Quay lại">←</button>

        <div className="d-flex flex-column align-items-center text-center">
          <div className={styles.hero}>
            <Image src={imgSrc} alt={itemName} width={140} height={140} className="rounded-circle object-fit-cover" />
          </div>

          <div className="mt-3 fs-4 text-success">✔</div>
          <h5 className="mt-1 fw-bold">Giữ chỗ thành công</h5>

          <div className="bg-white border rounded-4 p-3 mt-3 w-100" style={{ maxWidth: 520 }}>
  <div className="d-flex justify-content-between mb-1">
    <span className="fw-medium">Món ăn:</span>
    <span className="fw-semibold">{itemName}</span>
  </div>
  <div className="d-flex justify-content-between mb-1">
    <span className="fw-medium">Số lượng:</span>
    <span className="fw-semibold">{qty}</span>
  </div>
  <div className="d-flex justify-content-between mb-1">
    <span className="fw-medium">Ngày đặt:</span>
    <span className="fw-semibold">{formatDateVN(dateISO)}</span>
  </div>
  <div className="d-flex justify-content-between mb-1">
    <span className="fw-medium">Giờ đặt:</span>
    <span className="fw-semibold">{formatTimeVN24(timeHM)}</span>
  </div>
  <div className="d-flex justify-content-between mb-1">
    <span className="fw-medium">Mã đặt chỗ:</span>
    <span className="fw-semibold">{success.code}</span>
  </div>

  <hr className="my-2" />

  <div className="d-flex justify-content-between mb-1">
    <span>Đơn giá</span>
    <span>{vnd(unitPrice)}</span>
  </div>
  <div className="d-flex justify-content-between">
    <span>Tổng tiền</span>
    <span className="fw-bold">{vnd(total)}</span>
  </div>
</div>


          <p className="text-body-secondary mt-3 mb-3">Chỗ của bạn sẽ được giữ trong 30 phút</p>

          <div className="d-flex gap-2">
            <a href="/orders" className="btn btn-success">Đơn hàng</a>
            <a href="/" className="btn btn-outline-success">Trang chủ</a>
          </div>
        </div>
      </main>
    );
  }

  /* ----- Form screen ----- */
  return (
    <main className="container py-3" style={{ maxWidth: 560 }}>
      <button className="btn btn-link p-0 mb-2" onClick={() => router.back()} aria-label="Quay lại">←</button>

      <form onSubmit={onSubmit} className="d-flex flex-column align-items-center text-center">
        <div className={styles.hero}>
          <Image src={imgSrc} alt={itemName} width={140} height={140} className="rounded-circle object-fit-cover" />
        </div>

        <h5 className="mt-3 mb-1 fw-bold">{itemName}</h5>
        <div className="text-body-secondary mb-3">Bạn đang giữ chỗ {itemName.toLowerCase()}</div>

        <div className="w-100" style={{ maxWidth: 520 }}>
          {/* Ngày đặt */}
          <label className="form-label text-start w-100">Ngày đặt</label>
          <div className="input-group mb-3">
            <span className="input-group-text">📅</span>
            <input
              type="date"
              className="form-control border-success"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
              required
            />
          </div>

          {/* Giờ đặt (24h) */}
          <label className="form-label text-start w-100">Giờ đặt</label>
          <div className="input-group mb-3">
            <span className="input-group-text">🕑</span>
            <input
              type="time"
              className="form-control"
              value={timeHM}     // "HH:mm"
              onChange={(e) => setTimeHM(e.target.value)}
              step={60}
              lang="vi"         // ép hiển thị kiểu 24h của VN
              required
            />
          </div>

          {/* Số lượng */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="form-label mb-0">Số lượng</label>
            <div className="btn-group" role="group" aria-label="Số lượng">
              <button type="button" className="btn btn-outline-secondary" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span className="btn btn-outline-secondary disabled">{qty}</span>
              <button type="button" className="btn btn-outline-secondary" onClick={() => setQty((q) => q + 1)}>+</button>
            </div>
          </div>

          {/* Tóm tắt */}
          <div className="bg-white border rounded-4 p-3 mb-3">
            <div className="d-flex justify-content-between">
              <span>Ngày đặt</span>
              <strong>{formatDateVN(dateISO)}</strong>
            </div>
            <div className="d-flex justify-content-between mt-1">
              <span>Giờ đặt</span>
              <strong>{formatTimeVN24(timeHM)}</strong>
            </div>
            <hr className="my-2" />
            <div className="d-flex justify-content-between">
              <span>Đơn giá</span>
              <strong>{vnd(unitPrice)}</strong>
            </div>
            <div className="d-flex justify-content-between mt-1">
              <span>Tổng tiền</span>
              <strong className="text-success">{vnd(total)}</strong>
            </div>
          </div>

          <p className="text-body-secondary text-center mb-3">
            Chỗ của bạn sẽ được giữ trong 30 phút
          </p>

          <button type="submit" className="btn btn-success w-100 py-2 fw-bold">
            Giữ chỗ
          </button>
        </div>
      </form>
    </main>
  );
}
