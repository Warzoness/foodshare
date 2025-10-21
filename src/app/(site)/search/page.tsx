"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./SearchPage.module.css";
import FilterBar, { FilterValues } from "@/components/site/layouts/FilterBar/FilterBar";
import ResultsList from "@/components/site/layouts/SearchResult/ResultList";
import { FoodResult } from "@/components/site/layouts/SearchResult/ResultItem";
import LoadingSpinner from "@/components/share/LoadingSpinner";
import { ProductService, type SearchProduct, type ProductSearchParams } from "@/services/site/product.service";
import { getCurrentCoordinates } from "@/lib/location";
import dynamic from "next/dynamic";
const FloatMenu = dynamic(() => import("@/components/site/layouts/FloatMenu/FloatMenu"), { ssr: false });
const ActiveSearchInput = dynamic(() => import("@/components/site/layouts/SearchBar/ActiveSearchInput"), { ssr: false });
import SortBar, { SortOption } from "@/components/site/layouts/SortBar/SortBar";

const TRENDING = ["bánh mì", "phở bò", "cơm sườn", "trà sữa", "bún chả"];
const LS_KEY = "recentSearches_food_v1";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const [filters, setFilters] = useState<FilterValues>({
    maxDistanceKm: undefined,
    minDiscount: undefined,
    minPrice: undefined,
    maxPrice: undefined,
  });

  const [sortBy, setSortBy] = useState<SortOption>({
    sortBy: "relevance",
    sortDirection: "desc",
    label: "Phù hợp nhất"
  });

  const [loading, setLoading] = useState(false);
  const [isAppending, setIsAppending] = useState(false);

  const [items, setItems] = useState<FoodResult[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    inputRef.current?.focus();
    try {
      setRecent(JSON.parse(localStorage.getItem(LS_KEY) || "[]"));
    } catch {}
  }, []);

  // Xử lý URL params (xem thêm)
  useEffect(() => {
    const sort = searchParams.get("sort");
    const discount = searchParams.get("discount");
    const distance = searchParams.get("distance");

    if (sort === "ordersDesc") {
      setSortBy({
        sortBy: "relevance",
        sortDirection: "desc",
        label: "Phù hợp nhất"
      });
      setQ("");
      doSearchAll(0, false);
    } else if (discount) {
      const percent = parseInt(discount);
      setFilters((prev) => ({ ...prev, minDiscount: percent }));
      setQ("");
      doSearchAll(0, false);
    } else if (distance) {
      const km = parseInt(distance);
      setFilters((prev) => ({ ...prev, maxDistanceKm: km }));
      setQ("");
      doSearchAll(0, false);
    }
  }, [searchParams]);

  const saveRecent = (term: string) => {
    const t = term.trim();
    if (!t) return;
    const next = [t, ...recent.filter((r) => r !== t)].slice(0, 8);
    setRecent(next);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch {}
  };

  // --- SEARCH ---
  const doSearch = async (term = q, page = 0, append = false) => {
    const t = term.trim();
    if (!t) return;

    if (!append) {
      setSubmitted(true);
      setItems([]);
      setCurrentPage(0);
      setTotalPages(0);
      setTotalElements(0);
    }

    setQ(t);
    saveRecent(t);
    setLoading(true);

    try {
      let currentLat: number | undefined;
      let currentLon: number | undefined;
      try {
        const coords = await getCurrentCoordinates({ timeout: 5000 });
        currentLat = coords.latitude;
        currentLon = coords.longitude;
      } catch (error) {
        console.warn("Location access failed:", error);
      }

      // Build search parameters with filters and sorting
      const searchParams: ProductSearchParams = {
        q: t,
        page,
        size: 20,
        lat: currentLat,
        lon: currentLon,
        maxDistanceKm: filters.maxDistanceKm,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        minDiscount: filters.minDiscount,
        sortBy: sortBy.sortBy === "relevance" ? undefined : sortBy.sortBy,
        sortDirection: sortBy.sortBy === "relevance" ? undefined : sortBy.sortDirection,
      };


      const res = await ProductService.search(searchParams);

      const apiData = res.data;
      setCurrentPage(apiData.page || 0);
      setTotalPages(apiData.totalPages || 0);
      setTotalElements(apiData.totalElements || 0);

      const transformed: FoodResult[] = (apiData.content || []).map(mapToFoodResult);
      
      if (append) {
        // Đảm bảo không có duplicate items dựa trên ID
        setItems((prev) => {
          const existingIds = new Set(prev.map(item => item.id));
          const newItems = transformed.filter(item => !existingIds.has(item.id));
          return [...prev, ...newItems];
        });
      } else {
        setItems(transformed);
      }
    } catch (e) {
      console.error("Search failed", e);
      if (!append) {
        setItems([]);
        setCurrentPage(0);
        setTotalPages(0);
        setTotalElements(0);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- SEARCH ALL ---
  const doSearchAll = async (page = 0, append = false) => {
    if (!append) {
      setSubmitted(true);
      setItems([]);
      setCurrentPage(0);
      setTotalPages(0);
      setTotalElements(0);
    }

    setLoading(true);
    try {
      let currentLat: number | undefined;
      let currentLon: number | undefined;
      try {
        const coords = await getCurrentCoordinates({ timeout: 5000 });
        currentLat = coords.latitude;
        currentLon = coords.longitude;
      } catch (error) {
        console.warn("Location access failed:", error);
      }

      // Build search parameters with filters and sorting
      const searchParams: ProductSearchParams = {
        q: "",
        page,
        size: 20,
        lat: currentLat,
        lon: currentLon,
        maxDistanceKm: filters.maxDistanceKm,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        minDiscount: filters.minDiscount,
        sortBy: sortBy.sortBy === "relevance" ? undefined : sortBy.sortBy,
        sortDirection: sortBy.sortBy === "relevance" ? undefined : sortBy.sortDirection,
      };


      const res = await ProductService.search(searchParams);

      const apiData = res.data;
      setCurrentPage(apiData.page || 0);
      setTotalPages(apiData.totalPages || 0);
      setTotalElements(apiData.totalElements || 0);

      const transformed: FoodResult[] = (apiData.content || []).map(mapToFoodResult);
      
      if (append) {
        // Đảm bảo không có duplicate items dựa trên ID
        setItems((prev) => {
          const existingIds = new Set(prev.map(item => item.id));
          const newItems = transformed.filter(item => !existingIds.has(item.id));
          return [...prev, ...newItems];
        });
      } else {
        setItems(transformed);
      }
    } catch (e) {
      console.error("Search failed", e);
      if (!append) {
        setItems([]);
        setCurrentPage(0);
        setTotalPages(0);
        setTotalElements(0);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- LOAD MORE ---
  const loadMore = async () => {
    if (currentPage < totalPages - 1 && !loading) {
      const nextPage = currentPage + 1;
      setIsAppending(true);
      const scrollY = window.scrollY;

      try {
        if (q.trim()) {
          await doSearch(q, nextPage, true);
        } else {
          await doSearchAll(nextPage, true);
        }

        requestAnimationFrame(() => {
          window.scrollTo({ top: scrollY, behavior: "instant" });
        });
      } catch (error) {
        console.error("Failed to load more results:", error);
      } finally {
        setIsAppending(false);
      }
    }
  };

  // --- RESET WHEN FILTER/SORT CHANGE ---
  useEffect(() => {
    if (!submitted) return;
    if (loading || isAppending) return;
    if (q.trim()) {
      doSearch(q, 0, false);
    } else {
      doSearchAll(0, false);
    }
  }, [filters, sortBy]);

  // --- mapToFoodResult helper ---
  const mapToFoodResult = (p: SearchProduct): FoodResult => ({
    id: p.productId && p.productId > 0 ? p.productId : "unknown",
    name: p.name?.trim() || "Sản phẩm",
    price: p.price && p.price > 0 ? p.price : undefined,
    originalPrice: (p.originalPrice && p.originalPrice > 0 && p.originalPrice > p.price) ? p.originalPrice : undefined,
    imgUrl: p.imageUrl?.trim() || "/food/placeholder.jpg",
    distanceKm: p.distanceKm && p.distanceKm > 0 ? p.distanceKm : undefined,
    vendor: p.shopName?.trim() || "Cửa hàng",
    category: undefined,
    flashDealPercent:
        p.discountPercentage && p.discountPercentage > 0 ? p.discountPercentage : undefined,
    totalOrders: p.totalOrders && p.totalOrders > 0 ? p.totalOrders : undefined,
  });

  // --- render ---
  return (
      <div className={styles.page}>
        <div className="page-container">
          <div className={styles.header}>
            <button
                aria-label="Quay lại"
                onClick={() => (history.length > 1 ? history.back() : (location.href = "/"))}
                className="btn-back"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                    d="M15 19l-7-7 7-7"
                    stroke="#2b2b2b"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className={styles.searchWrap}>
               <ActiveSearchInput
                   value={q}
                   onChange={(v) => {
                     setQ(v);
                     if (!v) setSubmitted(false);
                   }}
                   onSubmit={doSearch}
                   placeholder="Tìm món / quán gần bạn"
               />
            </div>
          </div>

          <div className={styles.body}>
            {!submitted ? (
                <>
                  <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Xu hướng</h3>
                    <div className={styles.chipRow}>
                      {TRENDING.map((t) => (
                          <button key={t} className={styles.chip} onClick={() => doSearch(t)}>
                            {t}
                          </button>
                      ))}
                    </div>
                  </section>

                  {recent.length > 0 && (
                      <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>Tìm kiếm gần đây</h3>
                        <ul className={styles.suggestList}>
                          {recent.map((r) => (
                              <li key={r}>
                                <button className={styles.suggestRow} onClick={() => doSearch(r)}>
                                  <span>🕘</span>
                                  <span>{r}</span>
                                </button>
                              </li>
                          ))}
                        </ul>
                        <div className={styles.right}>
                          <button
                              className={styles.textBtn}
                              onClick={() => {
                                setRecent([]);
                                localStorage.removeItem(LS_KEY);
                              }}
                          >
                            Xoá lịch sử
                          </button>
                        </div>
                      </section>
                  )}
                </>
            ) : (
                <>
                  <FilterBar
                      value={filters}
                      onApply={setFilters}
                      onClearAll={() =>
                          setFilters({ maxDistanceKm: undefined, minDiscount: undefined, minPrice: undefined, maxPrice: undefined })
                      }
                  />
                  <SortBar value={sortBy} onChange={setSortBy} />

                  {loading && !isAppending ? (
                      <LoadingSpinner message="Đang tìm kiếm…" />
                  ) : items.length === 0 ? (
                      <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>🔍</div>
                        <div className={styles.notice}>Không tìm thấy kết quả phù hợp</div>
                      </div>
                  ) : (
                      <>
                        <ResultsList items={items} />
                        {currentPage < totalPages - 1 && (
                            <div className={styles.paginationContainer}>
                              <button
                                  className={styles.loadMoreBtn}
                                  onClick={loadMore}
                                  disabled={loading || isAppending}
                              >
                                {isAppending ? (
                                    <LoadingSpinner 
                                      size="inline" 
                                      variant="white" 
                                      message="Đang tải..." 
                                      showMessage={true}
                                    />
                                ) : (
                                    "Tải thêm"
                                )}
                              </button>
                            </div>
                        )}
                      </>
                  )}
                </>
            )}
          </div>
        </div>
        
        <FloatMenu />
      </div>
  );
}

export default function SearchPage() {
  return (
      <Suspense fallback={<LoadingSpinner message="Đang tải..." />}>
        <SearchPageContent />
      </Suspense>
  );
}
