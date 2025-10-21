"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import FloatMenu from "@/components/site/layouts/FloatMenu/FloatMenu";
import LoadingSpinner from "@/components/share/LoadingSpinner";
import { StoreService } from "@/services/site/store.service";
import { Store, StoreProduct } from "@/types/store";
import styles from "./StoreDetail.module.css";

function vnd(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + " đ";
}

export default function StoreDetailPage() {
  const params = useParams();
  const storeId = parseInt(params.id as string);
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  console.log('📊 Total pages:', totalPages);
  const [totalElements, setTotalElements] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Fetch store details
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

  // Fetch products with pagination
  const fetchProducts = useCallback(async (page = 0, append = false) => {
    if (!storeId) return;
    
    try {
      if (page === 0) {
        setLoadingProducts(true);
      } else {
        setLoadingMore(true);
      }

      const response = await StoreService.getShopProducts(storeId, {
        page,
        size: 20,
        sortBy: 'createdAt',
        sortDirection: 'desc'
      });

      if (response.success && response.data) {
        const { content, totalPages, totalElements, last } = response.data;
        
        if (append) {
          // Đảm bảo không có duplicate products dựa trên ID
          setProducts(prev => {
            const existingIds = new Set(prev.map(product => product.id));
            const newProducts = content.filter((product: StoreProduct) => !existingIds.has(product.id));
            return [...prev, ...newProducts];
          });
        } else {
          setProducts(content);
        }
        
        setCurrentPage(page);
        setTotalPages(totalPages);
        setTotalElements(totalElements);
        setHasMore(!last);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      if (!append) {
        setError(err instanceof Error ? err.message : "Failed to load products");
      }
    } finally {
      setLoadingProducts(false);
      setLoadingMore(false);
    }
  }, [storeId]);

  // Load initial products
  useEffect(() => {
    if (store && storeId) {
      fetchProducts(0, false);
    }
  }, [store, storeId, fetchProducts]);

  // Load more products
  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore && !loadingProducts) {
      fetchProducts(currentPage + 1, true);
    }
  }, [hasMore, loadingMore, loadingProducts, currentPage, fetchProducts]);

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
        <div className="container" style={{ padding: "2rem" }}>
          <LoadingSpinner message="Đang tải thông tin cửa hàng..." />
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
      <div className="page-container">
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
        <section>
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
        <section>
        <h6 className={styles.sectionTitle}>
          Sản phẩm ({totalElements > 0 ? totalElements : (loadingProducts ? '...' : '0')})
        </h6>
        
        {loadingProducts ? (
          <LoadingSpinner message="Đang tải sản phẩm..." />
        ) : products.length > 0 ? (
          <>
            <div className={styles.gridProducts}>
              {products.map((product) => (
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
                    <div className={styles.cardPrice}>
                      {vnd(product.price)}
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span style={{ 
                          textDecoration: 'line-through', 
                          color: '#999', 
                          fontSize: '0.9em',
                          marginLeft: '8px'
                        }}>
                          {vnd(product.originalPrice)}
                        </span>
                      )}
                    </div>
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
            
            {/* Load more button */}
            {hasMore && (
              <div className={styles.paginationContainer}>
                <button
                  className={styles.loadMoreBtn}
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <LoadingSpinner 
                      size="inline" 
                      variant="white" 
                      message="Đang tải..." 
                      showMessage={true}
                    />
                  ) : (
                    'Tải thêm sản phẩm'
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.noProducts}>
            <p>Cửa hàng chưa có sản phẩm nào</p>
          </div>
        )}
        </section>
      </div>
      
      <FloatMenu />
    </main>
  );
}


