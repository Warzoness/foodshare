"use client";

import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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

const TRENDING = ["bánh mì", "phở bò", "cơm sườn", "trà sữa", "bún chả"];
const LS_KEY = "recentSearches_food_v1";

function SearchPageContent() {
  const searchParams = useSearchParams();
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
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    inputRef.current?.focus();
    try { setRecent(JSON.parse(localStorage.getItem(LS_KEY) || "[]")); } catch { }
  }, []);

  // Xử lý URL parameters từ "Xem thêm"
  useEffect(() => {
    const sort = searchParams.get('sort');
    const flashDeal = searchParams.get('flashDeal');
    const distance = searchParams.get('distance');

    if (sort === 'ordersDesc') {
      setSortBy('ordersDesc');
      setQ(''); // Tìm kiếm tất cả
      doSearchAll(); // Tự động search
    } else if (flashDeal) {
      const percent = parseInt(flashDeal);
      setFilters(prev => ({ ...prev, flashDealPercent: percent }));
      setQ(''); // Tìm kiếm tất cả
      doSearchAll(); // Tự động search
    } else if (distance) {
      const km = parseInt(distance);
      setFilters(prev => ({ ...prev, distanceKm: km }));
      setQ(''); // Tìm kiếm tất cả
      doSearchAll(); // Tự động search
    }
  }, [searchParams]);

  const saveRecent = (term: string) => {
    const t = term.trim();
    if (!t) return;
    const next = [t, ...recent.filter(r => r !== t)].slice(0, 8);
    setRecent(next);
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch { }
  };

  const doSearch = async (term = q, page = 0) => {
    const t = term.trim();
    if (!t) return;
    setQ(t);
    saveRecent(t);
    setSubmitted(true);
    setLoading(true);
    if (page === 0) {
      setItems([]); // Clear previous results only for first page
    }
    
    try {
      let currentLat: number | undefined;
      let currentLon: number | undefined;
      try {
        const coords = await getCurrentCoordinates({ timeout: 5000 });
        currentLat = coords.latitude;
        currentLon = coords.longitude;
      } catch (error) {
        console.warn("Location access failed:", error);
        // Continue without location
      }

      const res = await ProductService.search({ 
        q: t, 
        page: page, 
        size: 20, 
        latitude: currentLat,
        longitude: currentLon
      });
      
      // API returns: { code, success, data: { content, page, size, totalElements, totalPages } }
      const apiData = res.data; // PageEnvelope<SearchProduct>
      setCurrentPage(apiData.page || 0);
      setTotalPages(apiData.totalPages || 0);
      setTotalElements(apiData.totalElements || 0);
      
      const transformed: FoodResult[] = (apiData.content || []).map(mapToFoodResult);
      if (page === 0) {
        setItems(transformed);
      } else {
        setItems(prev => [...prev, ...transformed]);
      }
    } catch (e) {
      console.error("Search failed", e);
      if (page === 0) {
        setItems([]);
      }
      setCurrentPage(0);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // Hàm search tất cả sản phẩm (cho "Xem thêm")
  const doSearchAll = async (page = 0) => {
    setSubmitted(true);
    setLoading(true);
    if (page === 0) {
      setItems([]); // Clear previous results only for first page
    }
    
    try {
      let currentLat: number | undefined;
      let currentLon: number | undefined;
      try {
        const coords = await getCurrentCoordinates({ timeout: 5000 });
        currentLat = coords.latitude;
        currentLon = coords.longitude;
      } catch (error) {
        console.warn("Location access failed:", error);
        // Continue without location
      }

      const res = await ProductService.search({ 
        q: "", // Search tất cả
        page: page, 
        size: 20, 
        latitude: currentLat,
        longitude: currentLon
      });
      
      // API returns: { code, success, data: { content, page, size, totalElements, totalPages } }
      const apiData = res.data; // PageEnvelope<SearchProduct>
      setCurrentPage(apiData.page || 0);
      setTotalPages(apiData.totalPages || 0);
      setTotalElements(apiData.totalElements || 0);
      
      const transformed: FoodResult[] = (apiData.content || []).map(mapToFoodResult);
      if (page === 0) {
        setItems(transformed);
      } else {
        setItems(prev => [...prev, ...transformed]);
      }
    } catch (e) {
      console.error("Search failed", e);
      if (page === 0) {
        setItems([]);
      }
      setCurrentPage(0);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // Load more function
  const loadMore = async () => {
    if (currentPage < totalPages - 1 && !loading) {
      const nextPage = currentPage + 1;
      // Store current scroll position before loading
      const currentScrollY = window.scrollY;
      
      try {
        if (q.trim()) {
          await doSearch(q, nextPage);
        } else {
          await doSearchAll(nextPage);
        }
        
        // Restore scroll position after loading with a small delay
        // to ensure DOM has updated
        requestAnimationFrame(() => {
          window.scrollTo({
            top: currentScrollY,
            behavior: 'instant'
          });
        });
      } catch (error) {
        console.error('Failed to load more results:', error);
      }
    }
  };

  // const clearQ = () => { setQ(""); setSubmitted(false); inputRef.current?.focus(); };

  // gợi ý
  const suggestions = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return TRENDING.slice(0, 5);
    // No mock data suggestions - only show trending when no search query
    return [];
  }, [q]);

  // Reset pagination when filters or sort change (but not when loading more)
  useEffect(() => {
    if (submitted && items.length > 0 && !loading) {
      // Only reset if we're not in the middle of loading more
      setCurrentPage(0);
      setTotalPages(0);
      setTotalElements(0);
      setItems([]);
    }
  }, [filters, sortBy]);

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
      const okPrice = isValidPrice ? (i.price && i.price <= maxPrice) : true;
      
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
        arr.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "priceDesc":
        arr.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "flashDesc":
        arr.sort((a, b) => {
          const aFlash = a.flashDealPercent ?? 0;
          const bFlash = b.flashDealPercent ?? 0;
          return bFlash - aFlash;
        });
        break;
      case "ordersDesc":
        arr.sort((a, b) => {
          const aOrders = a.totalOrders ?? 0;
          const bOrders = b.totalOrders ?? 0;
          return bOrders - aOrders;
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
      id: p.productId && p.productId > 0 ? p.productId : "unknown",
      name: p.name && p.name.trim() ? p.name : "Sản phẩm",
      price: p.price && p.price > 0 ? p.price : undefined,
      imgUrl: p.imageUrl && p.imageUrl.trim() ? p.imageUrl : "/food/placeholder.jpg",
      distanceKm: p.distanceKm && p.distanceKm > 0 ? p.distanceKm : undefined,
      vendor: p.shopName && p.shopName.trim() ? p.shopName : "Cửa hàng",
      category: undefined, // not provided by API
      flashDealPercent: p.discountPercentage && p.discountPercentage > 0 ? p.discountPercentage : undefined,
      totalOrders: p.totalOrders && p.totalOrders > 0 ? p.totalOrders : undefined,
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
              <>
                <ResultsList items={results} />
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className={styles.paginationContainer}>
                    <div className={styles.paginationInfo}>
                      Hiển thị {results.length} / {totalElements} kết quả
                      {results.length < items.length && (
                        <span className={styles.filteredNote}>
                          (đã lọc từ {items.length} kết quả)
                        </span>
                      )}
                    </div>
                    {currentPage < totalPages - 1 && (
                      <button 
                        className={styles.loadMoreBtn}
                        onClick={loadMore}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className={styles.loadingSpinnerSmall}></div>
                            Đang tải...
                          </>
                        ) : (
                          'Tải thêm'
                        )}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      <FloatMenu />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="text-center">
            <div className="spinner-border" role="status" style={{ color: '#54A65C' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="mt-2">Đang tải...</div>
          </div>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
