import React from 'react';
import Link from 'next/link';
import styles from './Welcome.module.css';

export default function WelcomePage() {
  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.content}>
        <div className={styles.logo}>🍱</div>
        <h1 className={styles.title}>FoodShare</h1>
        <p className={styles.description}>
          Phát triển bởi đội ngũ tâm huyết, FoodShare giúp kết nối bạn với những ưu đãi ẩm thực tuyệt vời xung quanh, 
          mang đến trải nghiệm ăn uống tiết kiệm và ý nghĩa hơn cho mọi người.
        </p>

        <div className={styles.infoCard}>
          <div className={styles.infoTitle}>Thông tin công ty</div>
          
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Tên chính thức</span>
            <span className={styles.infoValue}>CÔNG TY TNHH CÔNG NGHỆ SỐ HITDREAM</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Tên tiếng Anh</span>
            <span className={styles.infoValue}>HITDREAM DIGITAL CO., LTD</span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Mã số DN / MST</span>
            <span className={styles.infoValue}>1001326662</span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Liên hệ hỗ trợ</span>
            <span className={styles.infoValue}>0369 454 687 | contact.hitdream@gmail.com</span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Trụ sở chính</span>
            <span className={styles.infoValue}>Thôn Nhân Hòa, Xã Thư Vũ, Tỉnh Hưng Yên, Việt Nam</span>
          </div>
        </div>

        <Link href="/home" className={styles.ctaButton}>
          Vào trang chủ
        </Link>

        <div className={styles.footer}>
          &copy; 2026 HITDREAM DIGITAL CO., LTD. All rights reserved.
        </div>
      </div>
    </div>
  );
}
