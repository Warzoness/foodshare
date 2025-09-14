"use client";

import styles from "./Detail.module.css";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import MapModal from "@/components/site/modals/MapModal/MapModal";
import SaleTag from "@/components/share/SaleTag/SaleTag";
import Link from "next/link";

type ItemDetail = {
  id: string;
  title: string;
  subtitle: string;
  priceNow: string | number;
  priceOld?: string | number;
  discount?: string;
  storeName: string;
  address: string;
  coords: { lat: number; lng: number };
  images: string[];
  discountPct?: number; // ví dụ 20 => giảm 20%
};

const demo: ItemDetail = {
  id: "ga-chien-mam",
  title: "Đùi gà chiên mắm",
  subtitle: "Đùi gà chiên mắm hương vị chuẩn Hội An",
  priceNow: 100000,
  priceOld: 200000,
  discount: "-50%",
  storeName: "Cửa hàng gà rán",
  address: "22 Láng Hạ",
  coords: { lat: 21.013564, lng: 105.816215 },
  images: ["/images/chicken-fried.jpg", "/images/food1.jpg"],
  discountPct: 50,
};

function formatPrice(value: number | string | undefined): string {
  if (!value) return "—";
  const num = typeof value === "string"
    ? parseInt(value.replace(/\D/g, ""), 10) // bỏ ký tự không phải số
    : value;
  if (isNaN(num)) return "—";
  return num.toLocaleString("vi-VN"); // hiển thị dạng 100.000
}



export default function ItemDetailPage() {
  const data = useMemo((): ItemDetail => demo, []);
  const [curr, setCurr] = useState(0);
  const [openMap, setOpenMap] = useState(false);

  const [openLightbox, setOpenLightbox] = useState(false);
  const openLb = (index: number) => { setCurr(index); setOpenLightbox(true); };
  const closeLb = () => setOpenLightbox(false);
  const prevImg = () => setCurr((i) => (i - 1 + data.images.length) % data.images.length);
  const nextImg = () => setCurr((i) => (i + 1) % data.images.length);

  useEffect(() => {
    if (!openLightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") prevImg();
      if (e.key === "ArrowRight") nextImg();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openLightbox]);

  // Scroll thumb vào giữa khi đổi ảnh (nhỏ gọn)
  const thumbRowRef = useRef<HTMLDivElement | null>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    const el = thumbRefs.current[curr];
    const row = thumbRowRef.current;
    if (el && row) {
      const { left: rl, width: rw } = row.getBoundingClientRect();
      const { left: elL, width: ew } = el.getBoundingClientRect();
      row.scrollBy({ left: (elL - rl) - (rw / 2 - ew / 2), behavior: "smooth" });
    }
  }, [curr]);

  // OpenStreetMap preview
  const delta = 0.005;
  const bbox = `${data.coords.lng - delta},${data.coords.lat - delta},${data.coords.lng + delta},${data.coords.lat + delta}`;
  const osmEmbed = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${data.coords.lat},${data.coords.lng}`;

  return (
    <div className={styles.wrap}>
      <div className={styles.hero}>
        <Image
          src={data.images[curr]}
          alt={data.title}
          fill
          className={styles.heroImg}
          priority
          onClick={() => openLb(curr)}
        />

        {/* Tag ôm sát góc trên-phải */}
        {typeof data.discountPct === "number" && (
          <SaleTag percent={data.discountPct ?? 0} corner size="md" width="clamp(120px, 22vw, 240px)" />

        )}

        <button className={styles.backBtn} onClick={() => window.history.back()} aria-label="Quay lại">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "middle" }}>
            <path d="M15 19l-7-7 7-7" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="visually-hidden">Quay lại</span>
        </button>
      </div>

      <div className="container">
        {/* THUMBS */}
        <div ref={thumbRowRef} className={styles.thumbRow}>
          {data.images.map((src, i) => (
            <button
              key={i}
              ref={(el) => {
                thumbRefs.current[i] = el;
              }}
              className={`${styles.thumbBtn} ${i === curr ? "active" : ""}`}
              onClick={() => setCurr(i)}
              onDoubleClick={() => openLb(i)}
              aria-label={`Ảnh ${i + 1}`}
            >
              <div
                className={styles.thumb}
                style={{ backgroundImage: `url(${src})` }}
              />
            </button>
          ))}
        </div>


        {/* DOTS dưới thumbnail */}
        {data.images.length > 1 && (
          <div className={styles.dotsRow}>
            {data.images.map((_, i) => (
              <span
                key={i}
                className={`${styles.dot} ${i === curr ? styles.dotActive : ""}`}
                onClick={() => setCurr(i)}
                aria-label={`Chọn ảnh ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* INFO */}
        <section className="mt-2">
          <h5 className="fw-bold mb-1">{data.title}</h5>
          <div className="text-muted">{data.subtitle}</div>

          <div className={styles.priceRow}>
            <span className={styles.priceNow}>{formatPrice(data.priceNow)} VND</span>
            {data.discount && <span className={styles.discount}>{data.discount}</span>}
            {data.priceOld && <span className={styles.priceOld}>{formatPrice(data.priceOld)} VND</span>}
          </div>

        </section>

        {/* STORE + MINI MAP */}
        <section className="mt-3">
          <div className="mb-1 fw-semibold">{data.storeName}</div>
          <div className="text-muted mb-2">Địa chỉ: {data.address}</div>

          <div className={styles.mapCard}>
            <div className={styles.mapPreview}>
              <iframe className={styles.mapIframe} src={osmEmbed} title="Mini map preview" loading="lazy" />
            </div>

            <div className={styles.mapMini}>
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path fill="#2e7d32" d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 119.5 9 2.5 2.5 0 0112 11.5z" />
              </svg>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <span className="small ms-1">{data.address}</span>
                <button className={styles.mapBtn} onClick={() => setOpenMap(true)}>
                  Xem bản đồ
                </button>
              </div>
            </div>


          </div>
        </section>
      </div>

      {/* STICKY ACTION */}
      {/* <div className={styles.stickyBar}>
        <button className={styles.reserveBtn}>Giữ chỗ</button>
      </div> */}

      <Link className={styles.stickyBar} href={`/items/${data.id}/hold?name=${encodeURIComponent(data.title)}&price=${data.priceNow}`}>
        <button className={styles.reserveBtn}>Đặt chỗ</button>
      </Link>

      {/* MAP MODAL */}
      <MapModal
        open={openMap}
        onClose={() => setOpenMap(false)}
        title={data.storeName}
        address={data.address}
        coords={data.coords}
      />

      {/* LIGHTBOX (ban đầu) */}
      {openLightbox && (
        <div className={styles.lightboxBackdrop} onClick={closeLb} role="dialog" aria-modal="true">
          <div className={styles.lightbox} onClick={(e) => e.stopPropagation()}>
            <button className={`${styles.lbBtn} ${styles.lbClose}`} onClick={closeLb} aria-label="Đóng">✕</button>

            <div className={styles.lightboxImgWrap}>
              <Image src={data.images[curr]} alt={`${data.title} - ${curr + 1}`} fill className={styles.lightboxImg} priority />
              <div className={styles.lightboxControls}>
                <button className={styles.lbBtn} onClick={prevImg} aria-label="Ảnh trước">‹</button>
                <button className={styles.lbBtn} onClick={nextImg} aria-label="Ảnh sau">›</button>
              </div>
            </div>

            <div className={styles.lbThumbs}>
              {data.images.map((src, i) => (
                <div
                  key={i}
                  className={`${styles.lbThumb} ${i === curr ? styles.lbActive : ""}`}
                  style={{ backgroundImage: `url(${src})` }}
                  onClick={() => setCurr(i)}
                  role="button"
                  aria-label={`Chọn ảnh ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
