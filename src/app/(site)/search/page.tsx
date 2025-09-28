"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./SearchPage.module.css";
import FilterBar, { FilterValues } from "@/components/site/layouts/FilterBar/FilterBar";
import ResultsList from "@/components/site/layouts/SearchResult/ResultList";
import { FoodResult } from "@/components/site/layouts/SearchResult/ResultItem";
import { ProductService, type SearchProduct } from "@/services/site/product.service";
import { getCurrentCoordinates } from "@/lib/location";
import dynamic from "next/dynamic";
const FloatMenu = dynamic(() => import("@/components/site/layouts/FloatMenu/FloatMenu"), { ssr: false });
const ActiveSearchInput = dynamic(() => import("@/components/site/layouts/SearchBar/ActiveSearchInput"), { ssr: false });
import SortBar, { SortKey } from "@/components/site/layouts/SortBar/SortBar";

const DATA: FoodResult[] = [
  { id: 1, name: "Bánh Mì Gà", price: 2225000, distanceKm: 1.2, flashDealPercent: 30, imgUrl: "/images/chicken-fried.jpg", vendor: "Cô Ba", category: "Đồ ăn" },
  { id: 2, name: "Phở Bò", price: 45000, distanceKm: 4.8, imgUrl: "/images/chicken-fried.jpg", vendor: "Gia Truyền", category: "Đồ ăn" },
  { id: 3, name: "Cơm Sườn", price: 35000, distanceKm: 6.5, flashDealPercent: 10, imgUrl: "/images/chicken-fried.jpg", vendor: "Quán 79", category: "Đồ ăn" },
  { id: 4, name: "Bún Chả", price: 55000, distanceKm: 2.0, flashDealPercent: 25, imgUrl: "/images/chicken-fried.jpg", vendor: "Hương Liễu", category: "Đồ ăn" },
  { id: 5, name: "Trà Sữa", price: 30000, distanceKm: 1.5, flashDealPercent: 15, imgUrl: "/images/chicken-fried.jpg", vendor: "Sweetie", category: "Đồ uống" },
];

const TRENDING = ["bánh mì", "phở bò", "cơm sườn", "trà sữa", "bún chả"];
const LS_KEY = "recentSearches_food_v1";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // FILTER: chỉ còn priceTo
  const [filters, setFilters] = useState<FilterValues>({
    distanceKm: undefined,
    flashDealPercent: undefined,
    priceTo: "",
  });

  // SORT
  const [sortBy, setSortBy] = useState<SortKey>("relevance");

  // server results
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<FoodResult[]>([]);
  const [, setPage] = useState(0);
  const [, setTotalPages] = useState(0);

  useEffect(() => {
    inputRef.current?.focus();
    try { setRecent(JSON.parse(localStorage.getItem(LS_KEY) || "[]")); } catch { }
  }, []);

  const saveRecent = (term: string) => {
    const t = term.trim();
    if (!t) return;
    const next = [t, ...recent.filter(r => r !== t)].slice(0, 8);
    setRecent(next);
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch { }
  };

  const doSearch = async (term = q) => {
    const t = term.trim();
    if (!t) return;
    setQ(t);
    saveRecent(t);
    setSubmitted(true);
    setLoading(true);
    setItems([]); // Clear previous results
    
    try {
      let lat: number | undefined;
      let lon: number | undefined;
      try {
        const coords = await getCurrentCoordinates({ timeout: 5000 });
        lat = coords.latitude;
        lon = coords.longitude;
      } catch (error) {
        console.warn("Location access failed:", error);
        // Continue without location
      }

      const res = await ProductService.search({ 
        q: t, 
        page: 0, 
        size: 20, 
        latitude: lat, 
        longitude: lon 
      });
      
      // API returns: { code, success, data: { content, page, size, totalElements, totalPages } }
      const apiData = res.data; // PageEnvelope<SearchProduct>
      setPage(apiData.page || 0);
      setTotalPages(apiData.totalPages || 0);
      const transformed: FoodResult[] = (apiData.content || []).map(mapToFoodResult);
      setItems(transformed);
    } catch (e) {
      console.error("Search failed", e);
      setItems([]);
      setPage(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // const clearQ = () => { setQ(""); setSubmitted(false); inputRef.current?.focus(); };

  // gợi ý
  const suggestions = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return TRENDING.slice(0, 5);
    const names = Array.from(new Set(DATA.map(d => d.name)));
    return names.filter(n => n.toLowerCase().includes(key)).slice(0, 8);
  }, [q]);

  // client-side sort/filter applied on server results
  const results = useMemo(() => {
    if (!submitted) return [] as FoodResult[];
    
    // Validate price filter
    const maxPrice = filters.priceTo ? Number(filters.priceTo) : Infinity;
    const isValidPrice = !isNaN(maxPrice) && maxPrice > 0;
    
    const filtered = items.filter(i => {
      // Distance filter
      const okDist = filters.distanceKm != null ? 
        (i.distanceKm != null && i.distanceKm <= filters.distanceKm) : true;
      
      // Price filter
      const okPrice = isValidPrice ? i.price <= maxPrice : true;
      
      // Flash deal filter
      const okFlash = filters.flashDealPercent != null ? 
        (i.flashDealPercent != null && i.flashDealPercent >= filters.flashDealPercent) : true;
      
      return okDist && okPrice && okFlash;
    });
    
    const arr = [...filtered];
    switch (sortBy) {
      case "distanceAsc":
        arr.sort((a, b) => {
          const aDist = a.distanceKm ?? Infinity;
          const bDist = b.distanceKm ?? Infinity;
          return aDist - bDist;
        });
        break;
      case "priceAsc":
        arr.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        arr.sort((a, b) => b.price - a.price);
        break;
      case "flashDesc":
        arr.sort((a, b) => {
          const aFlash = a.flashDealPercent ?? 0;
          const bFlash = b.flashDealPercent ?? 0;
          return bFlash - aFlash;
        });
        break;
      default:
        // Relevance sort - keep original order from server
        break;
    }
    return arr;
  }, [submitted, items, filters, sortBy]);

  function mapToFoodResult(p: SearchProduct): FoodResult {
    return {
      id: p.productId,
      name: p.name,
      price: p.price,
      imgUrl: p.imageUrl,
      distanceKm: p.distanceKm,
      vendor: p.shopName,
      category: "", // not provided by API
      flashDealPercent: undefined,
    };
  }

  return (
    <div className={styles.page}>
      {/* header */}
      <div className={styles.header}>
        <button aria-label="Quay lại" onClick={() => history.length > 1 ? history.back() : (location.href = "/")} className="btn-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 19l-7-7 7-7" stroke="#2b2b2b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className={styles.searchWrap}>
          <ActiveSearchInput
            value={q}
            onChange={(v) => { setQ(v); if (!v) setSubmitted(false); }}
            onSubmit={doSearch}
            placeholder="Tìm món / quán gần bạn"
          />
        </div>
      </div>

      {/* body */}
      <div className={styles.body}>
        {!submitted ? (
          <div className={styles.suggestArea}>
            {q ? (
              <ul className={styles.suggestList}>
                {suggestions.map(s => (
                  <li key={s}>
                    <button className={styles.suggestRow} onClick={() => doSearch(s)}>
                      <span>🔎</span><span>{s}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Xu hướng</h3>
                  <div className={styles.chipRow}>
                    {TRENDING.map(t => (
                      <button key={t} className={styles.chip} onClick={() => doSearch(t)}>{t}</button>
                    ))}
                  </div>
                </section>

                {recent.length > 0 && (
                  <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Tìm kiếm gần đây</h3>
                    <ul className={styles.suggestList}>
                      {recent.map(r => (
                        <li key={r}>
                          <button className={styles.suggestRow} onClick={() => doSearch(r)}>
                            <span>🕘</span><span>{r}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className={styles.right}>
                      <button className={styles.textBtn} onClick={() => { setRecent([]); localStorage.removeItem(LS_KEY); }}>
                        Xoá lịch sử
                      </button>
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        ) : (
          <>
            {/* Filter ngang */}
            <FilterBar
              value={filters}
              onApply={setFilters}
              onClearAll={() => setFilters({ distanceKm: undefined, flashDealPercent: undefined, priceTo: "" })}
              onRemoveTag={(k) => {
                setFilters(prev => {
                  const n = { ...prev };
                  if (k === "distanceKm") n.distanceKm = undefined;
                  if (k === "flashDealPercent") n.flashDealPercent = undefined;
                  if (k === "priceTo") n.priceTo = "";
                  return n;
                });
              }}
            />

            {/* Sort dropdown nằm dưới Filter */}
            <SortBar value={sortBy} onChange={setSortBy} />

            {loading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <div className={styles.notice}>Đang tìm kiếm…</div>
              </div>
            ) : results.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🔍</div>
                <div className={styles.notice}>Không có món nào phù hợp với từ khóa &quot;{q}&quot;</div>
                <div className={styles.suggestionText}>
                  Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc
                </div>
              </div>
            ) : (
              <ResultsList items={results} />
            )}
          </>
        )}
      </div>

      <FloatMenu />
    </div>
  );
}
