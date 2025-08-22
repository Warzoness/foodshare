"use client";

import styles from "./Login.module.css";
import Link from "next/link";

export default function LoginPage() {
  // Thay  URL dưới bằng endpoint OAuth thực tế
  const onGoogle = () => (window.location.href = "/api/auth/oauth/google");
  const onFacebook = () => (window.location.href = "/api/auth/oauth/facebook");

  return (
    <div className={styles.screen}>
      <div className="container h-100">
        <div className="row h-100 justify-content-center align-items-center">
          <div className="col-11 col-sm-8 col-md-6 col-lg-4">
            <div className={styles.brandWrap}>
              <span className={styles.brand}>FoodShare</span>
            </div>

            <div className="d-grid gap-3 mt-4 button-div" style={{padding : "0 20px"}}>
              <button
                type="button"
                className={`${styles.btnSocial} btn btn-light`}
                onClick={onGoogle}
              >
                <span className={styles.iconWrap}>
                  {/* Google icon (SVG) */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      fill="#FFC107"
                      d="M43.611 20.083H42V20H24v8h11.303C33.819 32.91 29.273 36 24 36c-7.18 0-13-5.82-13-13s5.82-13 13-13c3.155 0 6.037 1.152 8.266 3.037l5.657-5.657C34.676 4.042 29.567 2 24 2 11.85 2 2 11.85 2 24s9.85 22 22 22c12.15 0 22-9.85 22-22 0-1.474-.153-2.914-.389-4.417z"
                    />
                    <path
                      fill="#FF3D00"
                      d="M6.306 14.691l6.571 4.818C14.6 15.467 18.961 12 24 12c3.155 0 6.037 1.152 8.266 3.037l5.657-5.657C34.676 4.042 29.567 2 24 2 15.327 2 7.957 6.978 4.306 14.691z"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24 46c5.192 0 9.932-1.988 13.521-5.206l-6.238-5.273C29.142 36.488 26.708 37 24 37c-5.238 0-9.652-3.355-11.262-8.02l-6.53 5.023C9.787 41.332 16.386 46 24 46z"
                    />
                    <path
                      fill="#1976D2"
                      d="M43.611 20.083H42V20H24v8h11.303c-1.315 3.83-4.76 6.557-8.803 6.557-1.625 0-3.154-.438-4.475-1.205l-6.53 5.023C18.386 41.332 24.985 46 32.6 46 41.6 46 48 39.18 48 30c0-1.474-.153-2.914-.389-4.417z"
                    />
                  </svg>
                </span>
                <span className={styles.btnText}>Sign in with Google</span>
              </button>

              <button
                type="button"
                className={`${styles.btnSocial} btn btn-light`}
                onClick={onFacebook}
              >
                <span className={styles.iconWrap}>
                  {/* Facebook icon (SVG) */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fill="#1877F2"
                      d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.436H7.078v-3.49h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668 1.313 0 2.686.235 2.686.235v2.953h-1.513c-1.492 0-1.956.928-1.956 1.88v2.257h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
                    />
                  </svg>
                </span>
                <span className={styles.btnText}>Sign in with Facebook</span>
              </button>

              <Link href="/" className={`${styles.skipBtn} btn btn-outline-light`}>
                Bỏ qua đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative corner frame (optional) */}
      <div className={styles.frame} />
    </div>
  );
}
