"use client";

import Image from "next/image";
import Link from "next/link";
import FloatMenu from "@/components/site/layouts/FloatMenu/FloatMenu";
import styles from "./StoreDetail.module.css";

type Store = {
  id: string;
  name: string;
  coverImage: string;
  phone: string;
  address: string;
  email?: string;
  products: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
  }>;
};

// Demo data; replace with API later
function getDemoStore(): Store {
  return {
    id: "ga-ran-123",
    name: "Cửa hàng gà rán Hội An",
    coverImage: "/images/food2.jpg",
    phone: "0901 234 567",
    address: "22 Láng Hạ, Hà Nội",
    email: "support@garan.vn",
    products: [
      { id: "p1", name: "Đùi gà chiên mắm", price: 55000, image: "/images/chicken-fried.jpg" },
      { id: "p2", name: "Cơm gà xé", price: 45000, image: "/images/food1.jpg" },
      { id: "p3", name: "Gà rán giòn", price: 60000, image: "/images/food2.jpg" },
    ],
  };
}

function vnd(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + " đ";
}

export default function StoreDetailPage() {
  const store = getDemoStore();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button className="btn-back" onClick={() => history.back()} aria-label="Quay lại">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 19l-7-7 7-7" stroke="#2b2b2b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </header>
      {/* Cover + name */}
      <section className={styles.coverSection}>
        <div className={styles.coverWrap}>
          <Image src={store.coverImage} alt={store.name} fill className={styles.coverImg} priority />
          <div className={styles.coverMask} />
        </div>
        <div className={styles.storeName}>{store.name}</div>
      </section>

      {/* Contact info */}
      <section className="container">
        <div className={styles.contactCard}>
          <div className={styles.rowLine}>
            <span className={styles.rowLabel}>Số điện thoại</span>
            <a className={styles.rowValue} href={`tel:${store.phone.replace(/\s/g, "")}`}>{store.phone}</a>
          </div>
          <div className={styles.rowLine}>
            <span className={styles.rowLabel}>Địa chỉ</span>
            <span className={styles.rowValue}>{store.address}</span>
          </div>
          {store.email && (
            <div className={styles.rowLine}>
              <span className={styles.rowLabel}>Email</span>
              <a className={styles.rowValue} href={`mailto:${store.email}`}>{store.email}</a>
            </div>
          )}
        </div>
      </section>

      {/* Product list */}
      <section className="container">
        <h6 className={styles.sectionTitle}>Sản phẩm</h6>
        <div className={styles.gridProducts}>
          {store.products.map((p) => (
            <Link
              key={p.id}
              href={`/items/${p.id}`}
              className={styles.card}
            >
              <div className={styles.cardThumb}>
                <Image src={p.image} alt={p.name} fill className={styles.cardImg} />
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardTitle}>{p.name}</div>
                <div className={styles.cardPrice}>{vnd(p.price)}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <FloatMenu />
    </main>
  );
}


