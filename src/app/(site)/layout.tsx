"use client";

import { useEffect } from "react";
import FeedbackButton from "@/components/share/FeedbackButton/FeedbackButton";
import ToastContainer from "@/components/share/Toast/ToastContainer";
import FirebaseTokenManager from "@/components/share/FirebaseTokenManager/FirebaseTokenManager";
import UserLocationUpdater from "@/components/share/UserLocationUpdater";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        import("bootstrap");

        const ua = navigator.userAgent || navigator.vendor;
        const inMessenger = /FBAN|FBAV|Messenger/i.test(ua);
        if (inMessenger) {
            const currentUrl = window.location.href;
            const isAndroid = /Android/i.test(ua);
            const isIOS = /iPhone|iPad|iPod/i.test(ua);

            if (isAndroid) {
                // 🧭 Android: cố mở thẳng Chrome
                window.location.href = `intent://${currentUrl.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`;
            } else {
                // 🍎 iOS: hiển thị giao diện hướng dẫn đẹp
                document.body.innerHTML = `
          <div style="
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            height:100vh;
            background:linear-gradient(135deg,#f9fafb,#eef2ff);
            font-family:system-ui,-apple-system,sans-serif;
            text-align:center;
            padding:2rem;
          ">
            <div style="max-width:420px;background:white;padding:2rem;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.1)">
              <div style="font-size:3rem;">🌐</div>
              <h2 style="margin:1rem 0;color:#111827;">Mở trang trong trình duyệt</h2>
              <p style="color:#4b5563;font-size:1rem;line-height:1.5;">
                Messenger không hỗ trợ đầy đủ các tính năng của website này.<br/>
                Hãy mở trang trong Safari hoặc Chrome để tiếp tục.
              </p>

              <div style="margin-top:1.5rem;background:#f3f4f6;padding:0.75rem;border-radius:8px;word-break:break-all;font-size:0.9rem;color:#374151;">
                ${currentUrl}
              </div>

              <button 
                onclick="navigator.clipboard.writeText('${currentUrl}').then(()=>alert('Đã sao chép link, bạn hãy dán vào trình duyệt nhé!'))"
                style="margin-top:1.5rem;padding:0.75rem 1.25rem;
                       background:#2563eb;color:white;border:none;border-radius:8px;
                       font-size:1rem;cursor:pointer;">
                📋 Sao chép link
              </button>

              <div style="margin-top:1rem;color:#6b7280;font-size:0.85rem;">
                Mẹo: Nhấn <b>⋯</b> ở góc trên rồi chọn <b>“Mở bằng Safari”</b>
              </div>
            </div>
          </div>
        `;
            }
        }
    }, []);

    return (
        <ToastContainer>
            <main>{children}</main>
            <FeedbackButton />
            <FirebaseTokenManager />
            <UserLocationUpdater />
        </ToastContainer>
    );
}
