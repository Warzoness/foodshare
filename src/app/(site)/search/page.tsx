"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./SearchPage.module.css";
import FilterBar, { FilterValues } from "@/components/site/layouts/FilterBar/FilterBar";
import ResultsList from "@/components/site/layouts/SearchResult/ResultList";
import { FoodResult } from "@/components/site/layouts/SearchResult/ResultItem";
import FloatMenu from "@/components/site/layouts/FloatMenu/FloatMenu";
import SortBar, { SortKey } from "@/components/site/layouts/SortBar/SortBar";

const DATA: FoodResult[] = [
  { id: 1, name: "Bánh Mì Gà", price: 2225000, distanceKm: 1.2, flashDealPercent: 30, imgUrl: "/food/banhmi.jpg", vendor: "Cô Ba", category: "Đồ ăn" },
  { id: 2, name: "Phở Bò", price: 45000, distanceKm: 4.8, imgUrl: "/food/pho.jpg", vendor: "Gia Truyền", category: "Đồ ăn" },
  { id: 3, name: "Cơm Sườn", price: 35000, distanceKm: 6.5, flashDealPercent: 10, imgUrl: "/food/comsuon.jpg", vendor: "Quán 79", category: "Đồ ăn" },
  { id: 4, name: "Bún Chả", price: 55000, distanceKm: 2.0, flashDealPercent: 25, imgUrl: "/food/buncha.jpg", vendor: "Hương Liễu", category: "Đồ ăn" },
  { id: 5, name: "Trà Sữa", price: 30000, distanceKm: 1.5, flashDealPercent: 15, imgUrl: "/food/trasua.jpg", vendor: "Sweetie", category: "Đồ uống" },
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

  const doSearch = (term = q) => {
    const t = term.trim();
    if (!t) return;
    setQ(t);
    saveRecent(t);
    setSubmitted(true);
  };

  const clearQ = () => { setQ(""); setSubmitted(false); };

  // gợi ý
  const suggestions = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return TRENDING.slice(0, 5);
    const names = Array.from(new Set(DATA.map(d => d.name)));
    return names.filter(n => n.toLowerCase().includes(key)).slice(0, 8);
  }, [q]);

  // lọc + sort
  const results = useMemo(() => {
    if (!submitted) return [];
    const key = q.trim().toLowerCase();
    const maxPrice = filters.priceTo ? Number(filters.priceTo) : Infinity;

    const filtered = DATA.filter(i => {
      const okText = i.name.toLowerCase().includes(key) || (i.vendor ?? "").toLowerCase().includes(key);
      const okDist = filters.distanceKm != null ? i.distanceKm <= filters.distanceKm : true;
      const okPrice = i.price <= maxPrice;
      const okFlash = filters.flashDealPercent != null ? (i.flashDealPercent ?? 0) >= filters.flashDealPercent : true;
      return okText && okDist && okPrice && okFlash;
    });

    const arr = [...filtered];
    switch (sortBy) {
      case "distanceAsc":
        arr.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
        break;
      case "priceAsc":
        arr.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        arr.sort((a, b) => b.price - a.price);
        break;
      case "flashDesc":
        arr.sort((a, b) => (b.flashDealPercent ?? 0) - (a.flashDealPercent ?? 0));
        break;
      case "relevance":
      default:
        // giữ nguyên
        break;
    }
    return arr;
  }, [submitted, q, filters, sortBy]);

  return (
    <div className={styles.page}>
      {/* header */}
      <div className={styles.header}>
        <button aria-label="Quay lại" onClick={() => history.length > 1 ? history.back() : (location.href = "/")} className={styles.iconBtn}>←</button>
        <div className={styles.searchWrap}>
          <i className="fi fi-rr-search"></i>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); if (!e.target.value) setSubmitted(false); }}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
            placeholder="Tìm món / quán gần bạn"
            className={styles.searchInput}
            aria-label="Tìm kiếm đồ ăn"
          />
          {q && <button aria-label="Xoá" onClick={clearQ} className={styles.iconBtn}>×</button>}
          {/* <button aria-label="Mic" onClick={() => alert("Mic placeholder")} className={styles.iconBtn}>🎤</button> */}
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

            {results.length === 0 ? (
              <div className={styles.notice}>Không có món nào phù hợp.</div>
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
