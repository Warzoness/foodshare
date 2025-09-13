"use client";
import ResultItem, { FoodResult } from "./ResultItem";
import styles from "./styles.module.css";

export type { FoodResult } from "./ResultItem";

export default function ResultsList({ items }: { items: FoodResult[] }) {
  return (
    <ul className={styles.list}>
      {items.map(i => <ResultItem key={i.id} item={i} />)}
    </ul>
  );
}
