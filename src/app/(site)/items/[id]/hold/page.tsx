"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./hold.module.css";
import { OrderService } from "@/services/site/order.service";
import { CreateOrderRequest, CreateOrderResponse } from "@/types/order";
import { AuthService } from "@/services/site/auth.service";
import Link from "next/link";

/* ========= Utils ========= */
const VN_TZ = "Asia/Ho_Chi_Minh";

function todayISO() {
  // Lấy ngày hiện tại theo múi giờ VN ở định dạng YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: VN_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
function nowHM() {
  // Lấy giờ:phút hiện tại theo múi giờ VN ở định dạng HH:mm (24h)
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: VN_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}
function formatDateVN(dateISO: string) {
  const [y, m, d] = dateISO.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: VN_TZ,
  }).format(dt);
}
function formatTimeVN24(timeHM: string) {
  const [hh, mm] = timeHM.split(":").map(Number);
  const dt = new Date(2000, 0, 1, hh ?? 0, mm ?? 0);
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // 24h
    timeZone: VN_TZ,
  }).format(dt);
}
function vnd(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + " đ";
}

/* ========= Page ========= */
type SuccessData = { 
  order: CreateOrderResponse;
  code: string;
};

export default function HoldPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const sp = useSearchParams();

  const productId = parseInt(params.id as string, 10);
  const itemName = sp.get("name") ?? "Gà sốt cay";
  const unitPrice = Number(sp.get("price") ?? 45000);
  const imgSrc = sp.get("img") ?? "/images/chicken-fried.jpg";
  const shopId = parseInt(sp.get("shopId") ?? "1", 10);

  // Debug logging
  console.log('🔍 Hold page params:', { 
    productId, 
    itemName, 
    unitPrice, 
    imgSrc, 
    shopId,
    urlParams: params,
    searchParams: Object.fromEntries(sp.entries())
  });

  const [dateISO] = useState<string>(todayISO());
  const [timeHM] = useState<string>(nowHM()); // mặc định giờ hiện tại (24h)
  const [qty, setQty] = useState<number>(1);
  const total = useMemo(() => qty * unitPrice, [qty, unitPrice]);

  const [success, setSuccess] = useState<SuccessData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const loggedIn = AuthService.isLoggedIn();
        setIsLoggedIn(loggedIn);
        setAuthChecked(true);
        console.log("🔐 Authentication status:", loggedIn);
        
        // Only redirect to login if not logged in and not coming from login page
        if (!loggedIn) {
          // Check if we're coming from login page to avoid redirect loop
          const referrer = document.referrer;
          const isFromLogin = referrer.includes('/auth/login');
          
          if (!isFromLogin) {
            const currentUrl = window.location.pathname + window.location.search;
            const loginUrl = `/auth/login?returnUrl=${encodeURIComponent(currentUrl)}`;
            console.log("🔄 Redirecting to login:", loginUrl);
            router.replace(loginUrl);
          } else {
            console.log("🔄 Coming from login page, not redirecting to avoid loop");
          }
        }
      } catch (error) {
        console.error("❌ Error checking auth status:", error);
        setIsLoggedIn(false);
        setAuthChecked(true);
      }
    };

    checkAuthStatus();
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!isLoggedIn) {
      setError("Vui lòng đăng nhập để đặt chỗ");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get current user ID from auth service
      const user = AuthService.getCurrentUser();
      if (!user || !user.userId) {
        throw new Error("Không thể lấy thông tin người dùng");
      }

      // Create pickup time from date and time
      const pickupTime = new Date(`${dateISO}T${timeHM}:00.000Z`).toISOString();

      const orderData: CreateOrderRequest = {
        userId: user.userId,
        shopId: shopId,
        productId: productId,
        quantity: qty,
        pickupTime: pickupTime,
        unitPrice: unitPrice,
        totalPrice: total
      };

      console.log('🛒 Creating order with data:', orderData);

      const order = await OrderService.createOrder(orderData);

      console.log('✅ Order created successfully:', order);

      // Generate a simple order code for display
      const code = String(Math.floor(2_000_000 + Math.random() * 8_000_000));
      
      setSuccess({ 
        order,
        code 
      });

    } catch (error) {
      console.error('❌ Failed to create order:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Không thể đặt chỗ. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  /* ----- Success screen ----- */
  if (success) {
    return (
      <main className="container py-3" style={{ maxWidth: 560 }}>
        <button className="btn-back" onClick={() => router.back()} aria-label="Quay lại">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 19l-7-7 7-7" stroke="#2b2b2b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="d-flex flex-column align-items-center text-center">
          <div className={styles.hero}>
            <Image src={imgSrc} alt={itemName} width={140} height={140} className="rounded-circle object-fit-cover" />
          </div>

          <div className={styles.successBadge} aria-hidden>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="12" fill="currentColor" opacity="0" />
              <path d="M20 6.5L9.5 17 4 11.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h5 className="mt-1 fw-bold">Giữ chỗ thành công</h5>

          <div className="bg-white border rounded-4 p-3 mt-3 w-100" style={{ maxWidth: 520 }}>
            <div className="d-flex justify-content-between mb-1">
              <span className="fw-medium">Món ăn:</span>
              <span className="fw-semibold">{itemName}</span>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="fw-medium">Số lượng:</span>
              <span className="fw-semibold">{qty}</span>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="fw-medium">Ngày đặt:</span>
              <span className="fw-semibold">{formatDateVN(dateISO)}</span>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="fw-medium">Giờ đặt:</span>
              <span className="fw-semibold">{formatTimeVN24(timeHM)}</span>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="fw-medium">Mã đơn hàng:</span>
              <span className="fw-semibold">#{success.order.id}</span>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="fw-medium">Trạng thái:</span>
              <span className="fw-semibold" style={{ color: "#54A65C" }}>{success.order.status}</span>
            </div>

            <hr className="my-2" />

            <div className="d-flex justify-content-between mb-1">
              <span>Đơn giá</span>
              <span>{vnd(unitPrice)}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Tổng tiền</span>
              <span className="fw-bold">{vnd(total)}</span>
            </div>
          </div>


          <p className="text-body-secondary mt-3 mb-3">
            Đơn hàng sẽ hết hạn lúc: {new Date(success.order.expiresAt).toLocaleString('vi-VN')}
          </p>

          <div className="d-flex gap-2">
            <Link href="/orders" className="btn" style={{ background: "#54A65C", color: "#fff" }}>Đơn hàng</Link>
            <Link href="/" className="btn btn-outline-success">Trang chủ</Link>
          </div>
        </div>
      </main>
    );
  }

  // Show loading while checking authentication
  if (!authChecked) {
    return (
      <main className="container py-3" style={{ maxWidth: 560 }}>
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Đang kiểm tra đăng nhập...</span>
          </div>
          <p className="mt-2">Đang kiểm tra đăng nhập...</p>
        </div>
      </main>
    );
  }

  /* ----- Form screen ----- */
  return (
    <main className="container py-3" style={{ maxWidth: 560 }}>
      <button className="btn-back" onClick={() => router.back()} aria-label="Quay lại">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 19l-7-7 7-7" stroke="#2b2b2b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <form onSubmit={onSubmit} className="d-flex flex-column align-items-center text-center">
        <div className={styles.hero}>
          <Image src={imgSrc} alt={itemName} width={140} height={140} className="rounded-circle object-fit-cover" />
        </div>

        <h5 className="mt-3 mb-1 fw-bold">{itemName}</h5>
        <div className="text-body-secondary mb-3">Bạn đang giữ chỗ {itemName.toLowerCase()}</div>

        <div className="w-100" style={{ maxWidth: 520 }}>
          {/* Ngày đặt (mặc định thời gian hiện tại) */}
          <label className="form-label text-start w-100">Ngày đặt</label>
          <div className="input-group mb-3">
            <span className="input-group-text">📅</span>
            {/* ĐÃ ẨN PHẦN CHỌN NGÀY: giữ cố định theo thời gian hiện tại */}
            {/*
            <input
              type="date"
              className="form-control"
              style={{ borderColor: "#54A65C" }}
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
              lang="vi"
              pattern="\\d{4}-\\d{2}-\\d{2}"
              required
            />
            */}
            <div className="form-control bg-light" style={{ borderColor: "#54A65C" }}>{formatDateVN(dateISO)}</div>
          </div>

          {/* Giờ đặt (24h, mặc định thời gian hiện tại) */}
          <label className="form-label text-start w-100">Giờ đặt</label>
          <div className="input-group mb-3">
            <span className="input-group-text">🕑</span>
            {/* ĐÃ ẨN PHẦN CHỌN GIỜ: giữ cố định theo thời gian hiện tại */}
            {/*
            <input
              type="time"
              className="form-control"
              value={timeHM}
              onChange={(e) => setTimeHM(e.target.value)}
              step={60}
              lang="vi"
              pattern="[0-9]{2}:[0-9]{2}"
              required
            />
            */}
            <div className="form-control bg-light">{formatTimeVN24(timeHM)}</div>
          </div>

          {/* Số lượng */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="form-label mb-0">Số lượng</label>
            <div className="btn-group" role="group" aria-label="Số lượng">
              <button type="button" className="btn btn-outline-secondary" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span className="btn btn-outline-secondary disabled">{qty}</span>
              <button type="button" className="btn btn-outline-secondary" onClick={() => setQty((q) => q + 1)}>+</button>
            </div>
          </div>

          {/* Tóm tắt */}
          <div className="bg-white border rounded-4 p-3 mb-3">
            {/* <div className="d-flex justify-content-between">
              <span>Ngày đặt</span>
              <strong>{formatDateVN(dateISO)}</strong>
            </div>
            <div className="d-flex justify-content-between mt-1">
              <span>Giờ đặt</span>
              <strong>{formatTimeVN24(timeHM)}</strong>
            </div>
            <hr className="my-2" /> */}
            <div className="d-flex justify-content-between">
              <span>Đơn giá</span>
              <strong>{vnd(unitPrice)}</strong>
            </div>
            <div className="d-flex justify-content-between mt-1">
              <span>Tổng tiền</span>
              <strong style={{ color: "#54A65C" }}>{vnd(total)}</strong>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger mb-3" role="alert">
              {error}
            </div>
          )}

          <p className="text-body-secondary text-center mb-3">
            Chỗ của bạn sẽ được giữ trong 30 phút
          </p>

          <button 
            type="submit" 
            className="btn w-100 py-2 fw-bold" 
            style={{ background: "#54A65C", color: "#fff" }}
            disabled={isLoading || !isLoggedIn}
          >
            {isLoading ? 'Đang đặt chỗ...' : 'Giữ chỗ'}
          </button>
        </div>
      </form>
    </main>
  );
}
