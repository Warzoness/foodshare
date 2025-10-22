"use client";

import { useEffect } from "react";
import FeedbackButton from "@/components/share/FeedbackButton/FeedbackButton";
import ToastContainer from "@/components/share/Toast/ToastContainer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        import("bootstrap");

        // 👉 Kiểm tra nếu đang trong Messenger thì tự động mở trong trình duyệt
        const ua = navigator.userAgent || navigator.vendor;
        const inMessenger = /FBAN|FBAV|Messenger/i.test(ua);
        if (inMessenger) {
            const currentUrl = window.location.href;
            window.open(currentUrl, "_blank");

            // fallback nếu Messenger chặn window.open
            setTimeout(() => {
                const stillInMessenger = /FBAN|FBAV|Messenger/i.test(navigator.userAgent);
                if (stillInMessenger) {
                    document.body.innerHTML = `
            <div style="text-align:center;padding:2rem;font-family:sans-serif">
              <p>⚠️ Vui lòng mở trang này trong trình duyệt để tiếp tục.</p>
              <a href="${currentUrl}" target="_blank"
                 style="display:inline-block;margin-top:1rem;padding:0.5rem 1rem;
                        background:#2563eb;color:white;border-radius:8px;text-decoration:none;">
                Mở trong trình duyệt
              </a>
            </div>`;
                }
            }, 800);
        }
    }, []);

    return (
        <ToastContainer>
            <main>{children}</main>
            <FeedbackButton />
        </ToastContainer>
    );
}
