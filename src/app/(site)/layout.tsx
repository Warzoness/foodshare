"use client";

import { useEffect } from "react";
import FeedbackButton from "@/components/share/FeedbackButton/FeedbackButton";
import ToastContainer from "@/components/share/Toast/ToastContainer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    import("bootstrap");
  }, []);

  return (
    <ToastContainer>
      <main>{children}</main>
      <FeedbackButton />
    </ToastContainer>
  );
}
