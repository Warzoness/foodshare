"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./SaleTag.module.css";

type Size = "sm" | "md" | "lg";

type Props = {
  percent: number;
  src?: string;                 // /images/saletag.png
  size?: Size;                  // làm mốc scale font
  prefix?: string;
  className?: string;
  corner?: boolean;             // dán góc phải-trên
  width?: number | string;      // px | % | clamp(...)
  fontScale?: number;           // tinh chỉnh thêm (mặc định 1)
};

const BASE_W: Record<Size, number> = { sm: 100, md: 140, lg: 180 };

export default function SaleTag({
  percent,
  src = "/images/saletag.png",
  size = "md",
  prefix = "",
  className = "",
  corner = false,
  width,
  fontScale = 1,
}: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  const base = BASE_W[size];

  const ref = useRef<HTMLDivElement>(null);
  const [measuredW, setMeasuredW] = useState<number | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setMeasuredW(entry.contentRect.width);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  // style.width: nếu không truyền -> dùng width mặc định theo size
  const widthStyle = useMemo(() => {
    if (width == null) return `${base}px`;
    return typeof width === "number" ? `${width}px` : width;
  }, [width, base]);

  // scale font theo bề rộng thực
  const autoScale =
    measuredW != null
      ? measuredW / base
      : (typeof width === "number" ? width / base : 1);

  const finalScale = Math.max(0.5, Math.min(3, autoScale * fontScale));

  const style: React.CSSProperties = {
    backgroundImage: `url(${src})`,
    width: widthStyle,                    // <-- width LUÔN do component điều khiển
    pointerEvents: "none",
    ["--st-fs" as any]: finalScale,
    ...(corner ? { position: "absolute", top: 0, right: 0 } : null),
  };

  return (
    <div
      ref={ref}
      className={`${styles.tag} ${styles[size]} ${className}`}
      style={style}
      aria-label={`Giảm ${pct}%`}
    >
      <div className={styles.content}>
        {prefix && <span className={styles.prefix}>{prefix}</span>}
        <span className={styles.num}>{pct}</span>
        <span className={styles.sym}>%</span>
      </div>
    </div>
  );
}
