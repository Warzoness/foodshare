"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./Home.module.css";
import Link from "next/link";
import FloatMenu from "@/components/site/layouts/FloatMenu/FloatMenu";
import { ProductService, Product } from "@/services/site/product.service";
import { MOCK_PRODUCTS } from "@/types/product";
import SaleTag from "@/components/share/SaleTag/SaleTag";
import SearchBar from "@/components/site/layouts/SearchBar/SearchBar";

const USE_API = false; // Đổi thành true khi có API

type CardItem = { id: number; name: string; price: string; img: string; discountPct?: number };



function priceToLabel(v?: number) {
  if (typeof v !== "number") return "—";
  if (v >= 1000 && v % 1000 === 0) return `${Math.round(v / 1000)}.000`;
  return v.toLocaleString("vi-VN") + " đ";
}
const toCard = (p: Product): CardItem => ({
  id: p.id,
  name: p.name,
  price: priceToLabel(p.price),
  img: p.imageUrl || "/images/chicken-fried.jpg",
  discountPct: p.discountPercent ?? undefined,
});
function Section({
  title, items, seeMoreHref = "/items", loading = false,
}: {
  title: string;
  items: CardItem[];
  seeMoreHref?: string;
  loading?: boolean;
}) {
  return (
    <section className="mt-3">
      <div className="d-flex justify-content-between align-items-center px-2">
        <h6 className="mb-2 fw-bold">{title}</h6>
        <Link href={seeMoreHref} className={styles.seeMore}>Xem thêm &gt;</Link>
      </div>

      {loading ? (
        <div className={styles.rowScroll}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.cardItem}>
              <div className={`${styles.thumbWrap} placeholder-glow`}>
                <div className={`${styles.thumb} placeholder`} />
              </div>
              <div className="p-2">
                <div className="placeholder col-8 mb-2" />
                <div className="placeholder col-4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.rowScroll}>
          {items.map((it) => (
            <Link key={it.id} href={`/items/${it.id}`}>
              <article className={styles.cardItem}>
                <div className={styles.thumbWrap}>
                  <div className={styles.thumb} style={{ backgroundImage: `url(${it.img})` }} aria-label={it.name} />
                  {typeof it.discountPct === "number" && (
                    <SaleTag percent={it.discountPct ?? 0} corner size="sm" width={70} />
                  )}
                </div>
                <div className={styles.cardMeta}>
                  <div className={styles.itemName} title={it.name}>{it.name}</div>
                  <div className={styles.price}>{it.price}</div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default function HomePage() {
  const [err, setErr] = useState<string | null>(null);
  const [loadingHot, setLoadingHot] = useState(USE_API);
  const [loadingShock, setLoadingShock] = useState(USE_API);
  const [loadingNear, setLoadingNear] = useState(USE_API);

  const [hotRaw, setHotRaw] = useState<Product[]>([]);
  const [shockRaw, setShockRaw] = useState<Product[]>([]);
  const [nearRaw, setNearRaw] = useState<Product[]>([]);

  // Nếu dùng API thật
  const fetchHot = useCallback(async () => {
    setLoadingHot(true);
    try {
      const r = await ProductService.list({ page: 0, size: 12 });
      setHotRaw(r.content || []);
    } catch (e: any) {
      setErr(e.message || "Failed to fetch");
      setHotRaw(MOCK_PRODUCTS.slice(0, 12) as unknown as Product[]);
    } finally {
      setLoadingHot(false);
    }
  }, []);

  const fetchShock = useCallback(async () => {
    setLoadingShock(true);
    try {
      const r = await ProductService.list({ page: 0, size: 12, priceSort: "asc" });
      setShockRaw(r.content || []);
    } catch (e: any) {
      setErr(e.message || "Failed to fetch");
      const m = [...MOCK_PRODUCTS].sort((a, b) => a.price - b.price).slice(0, 12);
      setShockRaw(m as unknown as Product[]);
    } finally {
      setLoadingShock(false);
    }
  }, []);

  const fetchNear = useCallback(async (lat?: number, lon?: number) => {
    setLoadingNear(true);
    try {
      const r = await ProductService.list({
        page: 0, size: 12,
        ...(lat !== undefined && lon !== undefined ? { lat, lon, maxDistanceKm: 5 } : {}),
      });
      setNearRaw(r.content || []);
    } catch (e: any) {
      setErr(e.message || "Failed to fetch");
      const hasDistance = MOCK_PRODUCTS.some(x => typeof x.distanceKm === "number");
      const m = hasDistance
        ? [...MOCK_PRODUCTS].sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))
        : [...MOCK_PRODUCTS];
      setNearRaw(m.slice(0, 12) as unknown as Product[]);
    } finally {
      setLoadingNear(false);
    }
  }, []);

  useEffect(() => {
    if (USE_API) {
      fetchHot();
      fetchShock();
      if (typeof window !== "undefined" && "geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          pos => fetchNear(pos.coords.latitude, pos.coords.longitude),
          () => fetchNear(),
          { enableHighAccuracy: false, timeout: 8000 }
        );
      } else {
        fetchNear();
      }
    } else {
      // Dữ liệu cứng
      setHotRaw(MOCK_PRODUCTS.slice(0, 12) as unknown as Product[]);
      setShockRaw([...MOCK_PRODUCTS].sort((a, b) => a.price - b.price).slice(0, 12) as unknown as Product[]);
      const hasDistance = MOCK_PRODUCTS.some(x => typeof x.distanceKm === "number");
      const m = hasDistance
        ? [...MOCK_PRODUCTS].sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))
        : [...MOCK_PRODUCTS];
      setNearRaw(m.slice(0, 12) as unknown as Product[]);
      setLoadingHot(false);
      setLoadingShock(false);
      setLoadingNear(false);
    }
  }, [fetchHot, fetchShock, fetchNear]);

  const hot = useMemo(() => hotRaw.map(toCard), [hotRaw]);
  const shock = useMemo(() => shockRaw.map(toCard), [shockRaw]);
  const near = useMemo(() => nearRaw.map(toCard), [nearRaw]);

  return (
    <div className={styles.wrap}>
      <div className="container pt-3 pb-2">
        {/* Thanh search */}
        <div style={{marginBottom: 12}}>
          <SearchBar />
        </div>
        {err && <div className="alert alert-danger">{err}</div>}

        <Section title="Mua nhiều" items={hot} loading={loadingHot} />
        <Section title="Giảm sốc" items={shock} loading={loadingShock} />
        <Section title="Gần bạn" items={near} loading={loadingNear} />
      </div>
      <FloatMenu />
    </div>
  );
}
