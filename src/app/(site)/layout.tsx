"use client";

import { useEffect } from "react";


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
