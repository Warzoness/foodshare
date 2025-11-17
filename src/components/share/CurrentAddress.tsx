"use client";

import { useEffect, useState } from "react";
import { getCurrentAddress, type Coordinates, type ReverseGeocodeAddress } from "@/lib/location";

type Props = {
  placeholder?: string;
  onChange?: (data: { coords: Coordinates; address: ReverseGeocodeAddress } | null) => void;
};

export default function CurrentAddress({ placeholder = "Đang lấy địa chỉ...", onChange }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<{ coords: Coordinates; address: ReverseGeocodeAddress } | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    getCurrentAddress("vi")
      .then((r) => {
        if (!mounted) return;
        setResult(r);
        onChange?.(r);
      })
      .catch((e: any) => {
        if (!mounted) return;
        setError(e?.message || "Không thể lấy địa chỉ hiện tại");
        setResult(null);
        onChange?.(null);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [onChange]);

  if (loading) return <span>{placeholder}</span>;
  if (error) return <span style={{ color: "#c53030" }}>{error}</span>;
  if (!result) return <span>Không có dữ liệu vị trí</span>;

  return <span>{result.address.displayName}</span>;
}


