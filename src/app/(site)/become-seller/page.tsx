"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import LoadingSpinner from "@/components/share/LoadingSpinner";
import styles from "./become-seller.module.css";

const FloatMenu = dynamic(() => import("@/components/site/layouts/FloatMenu/FloatMenu"), { ssr: false });

export default function BecomeSellerPage() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleBecomeSeller = () => {
    setIsRedirecting(true);
    // Redirect to the manager website
    window.open("https://shop.miniapp-foodshare.com/", "_blank");
    // Reset state after a short delay
    setTimeout(() => setIsRedirecting(false), 1000);
  };

  return (
    <div className={styles.wrap}>
      <main className={styles.page}>
        <div className="page-container">
          {/* Header */}
          <div className={styles.header}>
            <button 
              className="btn-back"
              onClick={() => router.back()}
              aria-label="Quay lại"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 19l-7-7 7-7" stroke="#2b2b2b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="visually-hidden">Quay lại</span>
            </button>
            <h1 className={styles.title}>Trở thành người bán</h1>
          </div>

          {/* Content */}
          <div className={styles.content}>
            {/* Hero Section */}
            <div className={styles.hero}>
              <div className={styles.iconContainer}>
                <div className={styles.iconWrapper}>
                  <i className="fi fi-sr-shop"></i>
                </div>
              </div>
              <h2 className={styles.heroTitle}>Bắt đầu bán hàng trên FoodShare</h2>
              <p className={styles.heroDescription}>
                Tham gia cộng đồng người bán thực phẩm và mở rộng kinh doanh của bạn
              </p>
            </div>

            {/* Features */}
            <div className={styles.features}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>🏪</div>
                <div className={styles.featureContent}>
                  <h3>Quản lý cửa hàng</h3>
                  <p>Thiết lập và quản lý thông tin cửa hàng một cách dễ dàng</p>
                </div>
              </div>

              <div className={styles.feature}>
                <div className={styles.featureIcon}>🥗</div>
                <div className={styles.featureContent}>
                  <h3>Quản lý sản phẩm</h3>
                  <p>Thêm, sửa, xóa sản phẩm và quản lý danh mục hiệu quả</p>
                </div>
              </div>

              <div className={styles.feature}>
                <div className={styles.featureIcon}>🛒</div>
                <div className={styles.featureContent}>
                  <h3>Xử lý đơn hàng</h3>
                  <p>Theo dõi và xử lý đơn hàng từ khách hàng</p>
                </div>
              </div>

              <div className={styles.feature}>
                <div className={styles.featureIcon}>📈</div>
                <div className={styles.featureContent}>
                  <h3>Báo cáo & Thống kê</h3>
                  <p>Xem báo cáo doanh thu và hiệu suất bán hàng</p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className={styles.ctaSection}>
              <h3 className={styles.ctaTitle}>Sẵn sàng bắt đầu?</h3>
              <p className={styles.ctaDescription}>
                Đăng nhập vào hệ thống quản lý để bắt đầu bán hàng ngay hôm nay
              </p>
              
              <button 
                className={styles.ctaButton}
                onClick={handleBecomeSeller}
                disabled={isRedirecting}
              >
                {isRedirecting ? (
                  <LoadingSpinner 
                    size="inline" 
                    variant="white" 
                    message="Đang chuyển hướng..." 
                    showMessage={true}
                  />
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Truy cập FoodShare Manager
                  </>
                )}
              </button>

              <p className={styles.note}>
                Bạn sẽ được chuyển đến trang quản lý cửa hàng chuyên nghiệp
              </p>
            </div>
          </div>
        </div>
      </main>
      <FloatMenu />
    </div>
  );
}
