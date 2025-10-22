"use client";

import styles from "./Detail.module.css";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { getCurrentCoordinates } from "@/lib/location";
import dynamic from "next/dynamic";
import FlashDealTag from "@/components/share/FlashDealTag/FlashDealTag";
import Link from "next/link";
import { ProductService, ProductDetail } from "@/services/site/product.service";
import { StoreService } from "@/services/site/store.service";
import { useParams, useRouter } from "next/navigation";
import { AuthService } from "@/services/site/auth.service";
import LoadingSpinner from "@/components/share/LoadingSpinner";

// Lazy-load heavy modal (no SSR) only when opened
const MapModal = dynamic(() => import("@/components/site/modals/MapModal/MapModal"), {
  ssr: false,
  loading: () => null,
});

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

// Fallback data when API fails
const fallbackData: ItemDetail = {
  id: "fallback",
  title: "Sản phẩm không khả dụng",
  subtitle: "Không thể tải thông tin sản phẩm",
  priceNow: 0,
  storeName: "Cửa hàng",
  address: "Địa chỉ không khả dụng",
  coords: { lat: 0, lng: 0 },
  images: ["/images/chicken-fried.jpg"],
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
  const params = useParams();
  const router = useRouter();
  const productId = parseInt(params.id as string, 10);
  
  const [data, setData] = useState<ItemDetail>(fallbackData);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [curr, setCurr] = useState(0);
  const [openMap, setOpenMap] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [openLightbox, setOpenLightbox] = useState(false);
  const openLb = (index: number) => { setCurr(index); setOpenLightbox(true); };
  const closeLb = () => setOpenLightbox(false);
  const prevImg = () => setCurr((i) => (i - 1 + data.images.length) % data.images.length);
  const nextImg = () => setCurr((i) => (i + 1) % data.images.length);

  // Handle reserve button click
  const handleReserveClick = () => {
    if (isLoggedIn) {
      // User is logged in, proceed to hold page
      // Use the real productId from URL params, not data.id (which might be fallback)
      const holdUrl = `/items/${productId}/hold?name=${encodeURIComponent(data.title)}&price=${data.priceNow}&shopId=${product?.shopId || 1}&img=${encodeURIComponent(data.images[0])}`;
      router.push(holdUrl);
    } else {
      // User not logged in, redirect to login with return URL
      const currentUrl = window.location.pathname + window.location.search;
      const loginUrl = `/auth/login?returnUrl=${encodeURIComponent(currentUrl)}`;
      router.push(loginUrl);
    }
  };

  useEffect(() => {
    if (!openLightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") prevImg();
      if (e.key === "ArrowRight") nextImg();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openLightbox, nextImg, prevImg]);

  // Fetch store details by shopId
  const fetchStoreDetail = async (shopId: number) => {
    try {
      const storeData = await StoreService.getStoreDetail(shopId);
      setStore(storeData);
      return storeData;
    } catch (error) {
      console.error('❌ Error fetching store details:', error);
      return null;
    }
  };

  // Fetch product detail from API
  useEffect(() => {
    const fetchProductDetail = async () => {
      if (isNaN(productId)) {
        setError("Invalid product ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const product = await ProductService.getDetail(productId);
        
        
        // Store the product data for later use
        setProduct(product);
        
        // Fetch store details if shopId is available
        if (product?.shopId) {
          await fetchStoreDetail(product.shopId);
        }
        
        // Parse detailImageUrl into array of images
        const parseDetailImages = (detailImageUrl?: string): string[] => {
          if (!detailImageUrl || detailImageUrl.trim() === "") {
            return [];
          }
          return detailImageUrl.split(',').map(url => url.trim()).filter(Boolean);
        };

        const detailImages = parseDetailImages(product?.detailImageUrl);
        const mainImage = product?.imageUrl || "/images/chicken-fried.jpg";
        
        // If detailImageUrl is empty, only show main image
        const allImages = detailImages.length > 0 
          ? [mainImage, ...detailImages] 
          : [mainImage];

        // Convert API data to ItemDetail format with safe handling
        const itemDetail: ItemDetail = {
          id: (product?.id || 0).toString(),
          title: product?.name || "Sản phẩm",
          subtitle: product?.description || "Món ăn ngon",
          priceNow: product?.price || 0,
          // Set originalPrice if not available
          priceOld: product?.originalPrice || (product?.discountPercent ? Math.round(product.price / (1 - product.discountPercent / 100)) : product?.price ? Math.round(product.price * 1.5) : undefined),
          discount: product?.discountPercent ? `-${product.discountPercent}%` : (product?.price ? "-30%" : undefined),
          storeName: store?.name || product?.shopName || "Cửa hàng",
          address: store?.address || product?.shopAddress || "Tên cửa hàng",
          coords: { 
            lat: store?.latitude || product?.shopLatitude || 0.99, 
            lng: store?.longitude || product?.shopLongitude || 0.99 
          },
          images: allImages,
          discountPct: product?.discountPercent || (product?.price ? 30 : undefined),
        };
        
        setData(itemDetail);
        setError(null);
      } catch (e: any) {
        console.error("Failed to fetch product detail:", e);
        setError(e.message || "Failed to load product");
        // Keep fallback data
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [productId]);

  // Update data when store information is available
  useEffect(() => {
    if (store && data) {
      setData(prevData => ({
        ...prevData,
        storeName: store.name || prevData.storeName,
        address: store.address || prevData.address,
        coords: {
          lat: store.latitude || prevData.coords.lat,
          lng: store.longitude || prevData.coords.lng
        }
      }));
    }
  }, [store]);

  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const loggedIn = AuthService.isLoggedIn();
        setIsLoggedIn(loggedIn);
      } catch (error) {
        console.error("❌ Error checking auth status:", error);
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Log current coordinates on initial load/refresh
  useEffect(() => {
    (async () => {
      try {
        const coords = await getCurrentCoordinates();
      } catch (e: any) {
        console.warn("[Location] Failed to get coordinates:", e?.message || e);
      }
    })();
  }, []);

  // Scroll thumb vào giữa khi đổi ảnh (cải tiến)
  const thumbRowRef = useRef<HTMLDivElement | null>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  
  useEffect(() => {
    const el = thumbRefs.current[curr];
    const row = thumbRowRef.current;
    if (el && row) {
      const rowRect = row.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      
      // Calculate if element is visible in viewport
      const isVisible = elRect.left >= rowRect.left && elRect.right <= rowRect.right;
      
      if (!isVisible) {
        // Calculate scroll position to center the element
        const scrollLeft = el.offsetLeft - (rowRect.width / 2) + (elRect.width / 2);
        
        row.scrollTo({
          left: Math.max(0, scrollLeft),
          behavior: "smooth"
        });
      }
    }
  }, [curr]);

  // OpenStreetMap preview
  const delta = 0.005;
  const bbox = `${data.coords.lng - delta},${data.coords.lat - delta},${data.coords.lng + delta},${data.coords.lat + delta}`;
  const osmEmbed = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${data.coords.lat},${data.coords.lng}`;
  const googleEmbed = `https://www.google.com/maps?q=${data.coords.lat},${data.coords.lng}&z=15&output=embed`;

  if (loading) {
    return (
            <LoadingSpinner message="Đang tải thông tin sản phẩm..."/>
    );
  }

  if (error) {
    return (
      <div className={styles.wrap}>
        <div className="container pt-3">
          <div className="alert alert-danger">
            <h5>Lỗi tải dữ liệu</h5>
            <p>{error}</p>
            <button className="btn btn-outline-danger" onClick={() => window.location.reload()}>
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className="page-container">
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
            <FlashDealTag discountPercentage={data.discountPct ?? 0} size="lg" />
          )}

          <button className="btn-back" onClick={() => window.history.back()} aria-label="Quay lại" style={{ position: "absolute", top: 10, left: 10 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "middle" }}>
              <path d="M15 19l-7-7 7-7" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="visually-hidden">Quay lại</span>
          </button>
        </div>
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


        {/* DOTS dưới thumbnail - chỉ hiện khi có ít hơn 8 ảnh */}
        {data.images.length > 1 && data.images.length <= 8 && (
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
        
        {/* Image counter for many images */}
        {data.images.length > 8 && (
          <div className="text-center py-2">
            <span className="badge bg-light text-dark border" style={{ fontSize: '12px' }}>
              {curr + 1} / {data.images.length}
            </span>
          </div>
        )}

        {/* INFO */}
        <section className="mt-2">
          <h5 className="fw-bold mb-1">{data.title}</h5>
          <div className="text-muted">{data.subtitle}</div>

          {/* Thông tin số lượng */}
        {(product?.totalOrders !== undefined || product?.quantityAvailable !== undefined) && (
          <div className="mt-2 mb-2" style={{ fontSize: '14px', color: '#6b7280' }}>
            {product?.totalOrders !== undefined && (
              <span>Đã bán: <strong style={{ color: '#54a65c' }}>{product.totalOrders}</strong></span>
            )}
            {product?.totalOrders !== undefined && product?.quantityAvailable !== undefined && <span> • </span>}
            {product?.quantityAvailable !== undefined && (
              <span>Còn lại: <strong style={{ color: '#dc2626' }}>{product.quantityAvailable}</strong></span>
            )}
          </div>
        )}

          <div className={styles.priceRow}>
            <span className={styles.priceNow}>{formatPrice(data.priceNow)} VND</span>
            {data.discount && <span className={styles.discount}>{data.discount}</span>}
            {data.priceOld && <span className={styles.priceOld}>{formatPrice(data.priceOld)} VND</span>}
          </div>

        </section>

        {/* STORE + MINI MAP */}
        <section className="mt-3">
          <Link href={`/stores/${product?.shopId || data.id}`} className="text-decoration-none">
            <div className={styles.mapMini}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                <path fill="#54A65C" d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 119.5 9 2.5 2.5 0 0112 11.5z" />
              </svg>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <div>
                  <div className="fw-semibold" style={{ color: "#111" }}>{data.storeName}</div>
                </div>
                <span className="small" style={{ color: "#54A65C", fontWeight: 700 }}>Xem cửa hàng</span>
              </div>
            </div>
          </Link>

          <div className={styles.mapCard}>
            {/*<div className={styles.mapPreview}>*/}
            {/*  <iframe className={styles.mapIframe} src={osmEmbed} title="Mini map preview" loading="lazy" />*/}
            {/*</div>*/}
            <div className={styles.mapPreview}>
              <iframe
                  className={styles.mapIframe}
                  src={googleEmbed}
                  title="Google Map preview"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className={styles.mapMini}>
              <span className="small ms-1" style={{ color: "#111" }}>Vị trí trên bản đồ</span>
              <button className={styles.mapBtn} onClick={() => setOpenMap(true)}>
                Xem bản đồ
              </button>
            </div>


          </div>
        </section>

        {/* STICKY ACTION */}
        <div className={styles.stickyBar}>
          <button 
            className={`${styles.reserveBtn} ${!isLoggedIn ? styles.reserveBtnDisabled : ''}`}
            onClick={handleReserveClick}
            disabled={loading}
          >
            {isLoggedIn ? 'Đặt chỗ' : 'Đăng nhập để đặt chỗ'}
          </button>
        </div>
      </div>

      {/* MAP MODAL (render only when opened) */}
      {openMap && (
        <MapModal
          open={openMap}
          onClose={() => setOpenMap(false)}
          title={data.storeName}
          address={data.address}
          coords={data.coords}
        />
      )}

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
