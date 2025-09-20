"use client";

import { useEffect } from "react";
import Header from "@/components/site/layouts/Header/Header";


export default function SiteLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    import("bootstrap");

  }, []);

  return (
    <>
      <main>{children}</main>
    </>
  );
}
