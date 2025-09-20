"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import FloatMenu from "@/components/site/layouts/FloatMenu/FloatMenu";
import { StoreService } from "@/services/site/store.service";
import { Store } from "@/types/store";
import styles from "./StoreDetail.module.css";

function vnd(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + " đ";
}

export default function StoreDetailPage() {
  const params = useParams();
  const storeId = parseInt(params.id as string);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoading(true);
        const storeData = await StoreService.getStoreDetail(storeId);
        setStore(storeData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load store");
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchStore();
    }
  }, [storeId]);

  if (loading) {
    return (
      <main className={styles.page}>
        <section className={styles.coverSection}>
          <div className={styles.coverWrap}>
            <Image 
              src="/images/food2.jpg" 
              alt="Loading..." 
              fill 
              className={styles.coverImg} 
              priority 
            />
            <div className={styles.coverMask} />
            
            {/* Back button inside the image */}
            <button 
              onClick={() => history.back()} 
              aria-label="Quay lại"
              style={{ 
                position: "absolute", 
                top: 10, 
                left: 10,
                appearance: "none",
                border: "none",
                background: "rgba(0, 0, 0, 0.3)",
                color: "#fff",
                width: "38px",
                height: "38px",
                borderRadius: "999px",
                display: "inline-grid",
                placeItems: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                transition: "box-shadow .18s ease, transform .06s ease",
                cursor: "pointer"
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "middle" }}>
                <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="visually-hidden">Quay lại</span>
            </button>
          </div>
        </section>
        <div className="container" style={{ padding: "2rem", textAlign: "center" }}>
          <div>Đang tải thông tin cửa hàng...</div>
        </div>
      </main>
    );
  }

  if (error || !store) {
    return (
      <main className={styles.page}>
        <section className={styles.coverSection}>
          <div className={styles.coverWrap}>
            <Image 
              src="/images/food2.jpg" 
              alt="Error" 
              fill 
              className={styles.coverImg} 
              priority 
            />
            <div className={styles.coverMask} />
            
            {/* Back button inside the image */}
            <button 
              onClick={() => history.back()} 
              aria-label="Quay lại"
              style={{ 
                position: "absolute", 
                top: 10, 
                left: 10,
                appearance: "none",
                border: "none",
                background: "rgba(0, 0, 0, 0.3)",
                color: "#fff",
                width: "38px",
                height: "38px",
                borderRadius: "999px",
                display: "inline-grid",
                placeItems: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                transition: "box-shadow .18s ease, transform .06s ease",
                cursor: "pointer"
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "middle" }}>
                <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="visually-hidden">Quay lại</span>
            </button>
          </div>
        </section>
        <div className="container" style={{ padding: "2rem", textAlign: "center" }}>
          <div style={{ color: "red" }}>{error || "Không tìm thấy cửa hàng"}</div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      {/* Cover + name */}
      <section className={styles.coverSection}>
        <div className={styles.coverWrap}>
          <Image 
            src={store.imageUrl || "/images/food2.jpg"} 
            alt={store.name} 
            fill 
            className={styles.coverImg} 
            priority 
          />
          <div className={styles.coverMask} />
          
          {/* Back button inside the image */}
          <button 
            onClick={() => history.back()} 
            aria-label="Quay lại"
            style={{ 
              position: "absolute", 
              top: 10, 
              left: 10,
              appearance: "none",
              border: "none",
              background: "rgba(0, 0, 0, 0.3)",
              color: "#fff",
              width: "38px",
              height: "38px",
              borderRadius: "999px",
              display: "inline-grid",
              placeItems: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              transition: "box-shadow .18s ease, transform .06s ease",
              cursor: "pointer"
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "middle" }}>
              <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="visually-hidden">Quay lại</span>
          </button>
        </div>
        <div className={styles.storeName}>{store.name}</div>
        {store.rating > 0 && (
          <div className={styles.rating}>
            ⭐ {store.rating.toFixed(1)}
          </div>
        )}
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
          {store.description && (
            <div className={styles.rowLine}>
              <span className={styles.rowLabel}>Mô tả</span>
              <span className={styles.rowValue}>{store.description}</span>
            </div>
          )}
          <div className={styles.rowLine}>
            <span className={styles.rowLabel}>Trạng thái</span>
            <span className={styles.rowValue} style={{ 
              color: store.status === '1' ? '#22c55e' : '#ef4444',
              fontWeight: '600'
            }}>
              {store.status === '1' ? '🟢 Đang mở' : '🔴 Đã đóng cửa'}
            </span>
          </div>
        </div>
      </section>

      {/* Product list */}
      <section className="container">
        <h6 className={styles.sectionTitle}>Sản phẩm ({store.products.length})</h6>
        {store.products.length > 0 ? (
          <div className={styles.gridProducts}>
            {store.products.map((product) => (
              <Link
                key={product.id}
                href={`/items/${product.id}`}
                className={styles.card}
              >
                <div className={styles.cardThumb}>
                  <Image 
                    src={product.imageUrl || "/images/food1.jpg"} 
                    alt={product.name} 
                    fill 
                    className={styles.cardImg} 
                  />
                  {product.quantityAvailable === 0 && (
                    <div className={styles.outOfStock}>Hết hàng</div>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardTitle}>{product.name}</div>
                  <div className={styles.cardDescription}>{product.description}</div>
                  <div className={styles.cardPrice}>{vnd(product.price)}</div>
                  <div className={styles.cardStock}>
                    Còn lại: {product.quantityAvailable} | Đang chờ: {product.quantityPending}
                  </div>
                  <div className={styles.cardStatus} style={{
                    color: product.status === '1' ? '#22c55e' : '#ef4444',
                    fontWeight: '600'
                  }}>
                    {product.status === '1' ? '🟢 Đang bán' : '🔴 Ngừng bán'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.noProducts}>
            <p>Cửa hàng chưa có sản phẩm nào</p>
          </div>
        )}
      </section>

      <FloatMenu />
    </main>
  );
}


