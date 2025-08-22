"use client";

import { useState } from "react";
import styles from "./Home.module.css";
import Link from "next/link";
import FilterModal, { FilterValues } from "@/components/site/FilterModal/FilterModal";

type CardItem = {
  id: number;
  name: string;
  price: string;
  discount?: string;       // ví dụ "-40%"
  img: string;
};

const commonImg = "/images/chicken-fried.jpg"; // đổi sang ảnh thật trong public/images
const hot: CardItem[] = [
  { id: 1, name: "Gà rán giòn", price: "39K", discount: "-40%", img: commonImg },
  { id: 2, name: "Cánh gà sốt", price: "42K", discount: "-35%", img: commonImg },
  { id: 3, name: "Đùi gà BBQ", price: "49K", discount: "-30%", img: commonImg },
  { id: 4, name: "Gà rán cay", price: "45K", discount: "-15%", img: commonImg },
];

const shock: CardItem[] = [
  { id: 5, name: "Combo 2 miếng", price: "59K", discount: "-45%", img: commonImg },
  { id: 6, name: "Burger gà", price: "29K", discount: "-25%", img: commonImg },
  { id: 7, name: "Cánh gà mật ong", price: "39K", discount: "-20%", img: commonImg },
  { id: 8, name: "Gà popcorn", price: "25K", discount: "-30%", img: commonImg },
];

const near: CardItem[] = [
  { id: 9, name: "Gà rán góc phố", price: "35K", discount: "-10%", img: commonImg },
  { id: 10, name: "Gà không bột", price: "44K", discount: "-18%", img: commonImg },
  { id: 11, name: "Đùi gà tỏi", price: "47K", discount: "-22%", img: commonImg },
  { id: 12, name: "Cánh gà phô mai", price: "52K", discount: "-17%", img: commonImg },
];

function Section({
  title,
  items,
  seeMoreHref = "/items",
}: {
  title: string;
  items: CardItem[];
  seeMoreHref?: string;
}) {
  return (
    <section className="mt-3">
      <div className="d-flex justify-content-between align-items-center px-2">
        <h6 className="mb-2 fw-bold">{title}</h6>
        <Link href={seeMoreHref} className={styles.seeMore}>
          see more
        </Link>
      </div>

      <div className={styles.rowScroll}>
        {items.map((it) => (
          <article key={it.id} className={styles.cardItem}>
            <div className={styles.thumbWrap}>
              <div
                className={styles.thumb}
                style={{ backgroundImage: `url(${it.img})` }}
                aria-label={it.name}
              />
              {!!it.discount && <span className={styles.badgeDiscount}>{it.discount}</span>}
            </div>
            <div className={styles.cardMeta}>
              <div className={styles.itemName} title={it.name}>
                {it.name}
              </div>
              <div className={styles.price}>{it.price}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const [openFilter, setOpenFilter] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    distanceKm: 5,
    flashDealPercent: 20,
    priceFrom: "",
    priceTo: ""
  });

  function handleApply(vals: FilterValues) {
    setFilters(vals);
    setOpenFilter(false);
    // TODO: gọi API hoặc filter client theo `vals`
  }

  return (
    <div className={styles.wrap}>
      <div className="container pt-3 pb-2">
        {/* Search */}
        <div className={styles.searchBar} onClick={() => setOpenFilter(true)} role="button">
          <span className={styles.searchIcon}>🔎</span>
          <input className={styles.searchInput} placeholder="Tìm kiếm" readOnly />
        </div>


        {/* Sections */}
        <Section title="Mua nhiều" items={hot} />
        <Section title="Giảm sốc" items={shock} />
        <Section title="Gần bạn" items={near} />
      </div>

      {/* Bottom Navigation */}
      <nav className={styles.bottomNav}>
        <Link href="/" className={`${styles.navItem} ${styles.active}`}>
          <span className={styles.navIcon}>🏠</span>
          <span className={styles.navLabel}>Trang chủ</span>
        </Link>
        <Link href="/search" className={styles.navItem}>
          <span className={styles.navIcon}>🛍️</span>
          <span className={styles.navLabel}>Danh mục</span>
        </Link>
        <Link href="/favorites" className={styles.navItem}>
          <span className={styles.navIcon}>💚</span>
          <span className={styles.navLabel}>Yêu thích</span>
        </Link>
        <Link href="/account" className={styles.navItem}>
          <span className={styles.navIcon}>👤</span>
          <span className={styles.navLabel}>Tài khoản</span>
        </Link>
      </nav>

      <FilterModal
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        onApply={handleApply}
        initial={filters}
      />

    </div>
  );
}
