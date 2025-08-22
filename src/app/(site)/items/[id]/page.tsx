"use client";

import styles from "./Detail.module.css";
import Image from "next/image";
import { useMemo, useState } from "react";
import MapModal from "@/components/site/MapModal/MapModal";

type ItemDetail = {
  id: string;
  title: string;
  subtitle: string;
  priceNow: string;     // "100k"
  priceOld?: string;    // "200k"
  discount?: string;    // "-50%"
  storeName: string;
  address: string;
  coords: { lat: number; lng: number };
  images: string[];
};

// Demo data — khi nối API bạn chỉ cần fetch theo params.id
const demo: ItemDetail = {
  id: "ga-chien-mam",
  title: "Đùi gà chiên mắm",
  subtitle: "Đùi gà chiên mắm hương vị chuẩn Hội An",
  priceNow: "100k",
  priceOld: "200k",
  discount: "-50%",
  storeName: "Cửa hàng gà rán",
  address: "22 Láng Hạ",
  coords: { lat: 21.013564, lng: 105.816215 }, // ví dụ: Hà Nội
  images: [
    "/images/chicken-fried.jpg",
    "/images/food1.jpg",
    "/images/chicken-fried.jpg",
  ],
};

export default function ItemDetailPage() {
  const data: ItemDetail = useMemo(() => demo, []);
  const [curr, setCurr] = useState(0);
  const [openMap, setOpenMap] = useState(false);

  return (
    <div className={styles.wrap}>
      {/* HERO IMAGE */}
      <div className={styles.hero}>
        <Image
          src={data.images[curr]}
          alt={data.title}
          fill
          className={styles.heroImg}
          priority
        />
        {data.discount && <span className={styles.badgeDiscount}>{data.discount}</span>}
      </div>

      {/* THUMB LIST */}
      <div className="container">
        <div className={styles.thumbRow}>
          {data.images.map((src, i) => (
            <button
              key={i}
              className={`${styles.thumbBtn} ${i === curr ? styles.active : ""}`}
              onClick={() => setCurr(i)}
              aria-label={`Ảnh ${i + 1}`}
            >
              {/* dùng div bg cho gọn */}
              <div className={styles.thumb} style={{ backgroundImage: `url(${src})` }} />
            </button>
          ))}
        </div>

        {/* INFO */}
        <section className="mt-2">
          <h5 className="fw-bold mb-1">{data.title}</h5>
          <div className="text-muted">{data.subtitle}</div>

          <div className={styles.priceRow}>
            <span className={styles.priceNow}>{data.priceNow}</span>
            {data.discount && <span className={styles.discount}>{data.discount}</span>}
            {data.priceOld && <span className={styles.priceOld}>{data.priceOld}</span>}
          </div>
        </section>

        {/* STORE INFO */}
        <section className="mt-3">
          <div className="mb-1 fw-semibold">{data.storeName}</div>
          <div className="text-muted mb-2">Địa chỉ: {data.address}</div>

          <div className={styles.mapCard}>
            <div className={styles.mapMini}>
              {/* ảnh tĩnh / placeholder — bấm nút để mở Google Map */}
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path fill="#2e7d32" d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 119.5 9 2.5 2.5 0 0112 11.5z"/>
              </svg>
              <span className="small ms-1">Vonstrane</span>
            </div>
            <button className={styles.mapBtn} onClick={() => setOpenMap(true)}>
              View Stores
            </button>
          </div>

          <button className={styles.linkStore} onClick={() => setOpenMap(true)}>
            Xem cửa hàng
          </button>
        </section>
      </div>

      {/* STICKY ACTION */}
      <div className={styles.stickyBar}>
        <button className={styles.reserveBtn}>Giữ chỗ</button>
      </div>

      {/* MAP MODAL */}
      <MapModal
        open={openMap}
        onClose={() => setOpenMap(false)}
        title={data.storeName}
        address={data.address}
        coords={data.coords}
      />
    </div>
  );
}
