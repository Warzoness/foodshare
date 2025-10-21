"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./hold.module.css";
import { OrderService } from "@/services/site/order.service";
import { CreateOrderRequest, CreateOrderResponse } from "@/types/order";
import { AuthService } from "@/services/site/auth.service";
import { ProductService } from "@/services/site/product.service";
import Link from "next/link";
import TimePicker from "@/components/share/TimePicker/TimePicker";

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


  const [dateISO, setDateISO] = useState<string>(todayISO());
  const [timeHM, setTimeHM] = useState<string>(nowHM()); // mặc định giờ hiện tại (24h)
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [qty, setQty] = useState<number>(1);
  const [timeAlert, setTimeAlert] = useState<string | null>(null);
  const [productDetails, setProductDetails] = useState<{ quantityAvailable?: number } | null>(null);
  const total = qty * unitPrice;

  // Memoized quantity handlers to prevent unnecessary re-renders
  const handleDecreaseQuantity = useCallback(() => {
    setQty((prevQty) => Math.max(1, prevQty - 1));
  }, []);

  const handleIncreaseQuantity = useCallback(() => {
    setQty((prevQty) => {
      // Không cho phép tăng nếu đã đạt giới hạn số lượng có sẵn
      if (productDetails?.quantityAvailable !== undefined && prevQty >= productDetails.quantityAvailable) {
        return prevQty; // Giữ nguyên số lượng hiện tại
      }
      return prevQty + 1;
    });
  }, [productDetails?.quantityAvailable]);

  // Check if time is valid (within 2 hours from now, considering day overflow)
  const isValidTime = (timeStr: string): boolean => {
    const [hour, minute] = timeStr.split(":").map(Number);
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    
    const currentMinutes = currentHour * 60 + currentMinute;
    const selectedMinutes = hour * 60 + minute;
    const maxMinutes = currentMinutes + 120; // +2 hours
    
    // If max time goes to next day (e.g., 23:55 + 2h = 01:55 next day)
    if (maxMinutes >= 1440) {
      const nextDayMaxMinutes = maxMinutes - 1440;
      // Valid if: current time <= selected time <= max time (same day) OR selected time <= next day max time
      return selectedMinutes >= currentMinutes || selectedMinutes <= nextDayMaxMinutes;
    } else {
      // Normal case: all within same day
      return selectedMinutes >= currentMinutes && selectedMinutes <= maxMinutes;
    }
  };

  // Handle time change and update date if needed
  const handleTimeChange = (newTime: string) => {
    setTimeHM(newTime);
    
    // Validate time and show alert if invalid
    if (!isValidTime(newTime)) {
      const currentTime = new Date();
      const currentHour = currentTime.getHours();
      const currentMinute = currentTime.getMinutes();
      
      const currentMinutes = currentHour * 60 + currentMinute;
      const maxMinutes = currentMinutes + 120;
      
      // Format current time
      const currentTimeStr = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;
      
      // Format max time (handle day overflow)
      let maxTimeStr;
      if (maxMinutes >= 1440) { // Next day (24 * 60 = 1440 minutes)
        const nextDayHour = Math.floor((maxMinutes - 1440) / 60);
        const nextDayMinute = (maxMinutes - 1440) % 60;
        maxTimeStr = `${nextDayHour.toString().padStart(2, "0")}:${nextDayMinute.toString().padStart(2, "0")} (ngày mai)`;
      } else {
        const maxHour24 = Math.floor(maxMinutes / 60) % 24;
        const maxMinute = maxMinutes % 60;
        maxTimeStr = `${maxHour24.toString().padStart(2, "0")}:${maxMinute.toString().padStart(2, "0")}`;
      }
      
      setTimeAlert(`Chỉ có thể đặt chỗ từ ${currentTimeStr} đến ${maxTimeStr}`);
    } else {
      setTimeAlert(null);
      
      // Check if the selected time is for next day
      const [hour, minute] = newTime.split(":").map(Number);
      const currentTime = new Date();
      const currentHour = currentTime.getHours();
      const currentMinute = currentTime.getMinutes();
      
      const currentMinutes = currentHour * 60 + currentMinute;
      const selectedMinutes = hour * 60 + minute;
      const maxMinutes = currentMinutes + 120; // +2 hours
      
      // Determine if selected time is for next day
      let isNextDay = false;
      
      if (maxMinutes >= 1440) {
        // We're in a situation where +2 hours goes to next day
        // If selected time is earlier than current time, it means next day
        if (selectedMinutes < currentMinutes) {
          isNextDay = true;
        }
      }
      
      if (isNextDay) {
        // Update to next day
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowISO = tomorrow.toISOString().split('T')[0];
        setDateISO(tomorrowISO);
      } else {
        // Reset to today if it's not next day
        setDateISO(todayISO());
      }
    }
  };

  const [success, setSuccess] = useState<SuccessData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  // Fetch product details only once when component mounts
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) return;
      
      setIsLoadingProduct(true);
      try {
        const details = await ProductService.getDetail(productId);
        setProductDetails(details);
        
        // Đảm bảo số lượng ban đầu không vượt quá số lượng có sẵn
        if (details.quantityAvailable !== undefined && qty > details.quantityAvailable) {
          setQty(details.quantityAvailable);
        }
      } catch (error) {
        console.error('❌ Error fetching product details:', error);
        setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại.');
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchProductDetails();
  }, [productId]); // Removed qty dependency

  // Check quantity validation on frontend when qty or productDetails change
  useEffect(() => {
    if (productDetails?.quantityAvailable !== undefined) {
      if (qty > productDetails.quantityAvailable) {
        setError(`Chỉ còn ${productDetails.quantityAvailable} sản phẩm trong kho. Vui lòng giảm số lượng.`);
        // Tự động điều chỉnh số lượng về giới hạn tối đa
        setQty(productDetails.quantityAvailable);
      } else if (error && error.includes('không đủ số lượng')) {
        // Clear error if quantity is now valid
        setError(null);
      }
    }
  }, [qty, productDetails?.quantityAvailable, error]);

  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const loggedIn = AuthService.isLoggedIn();
        setIsLoggedIn(loggedIn);
        setAuthChecked(true);
        
        // Only redirect to login if not logged in and not coming from login page
        if (!loggedIn) {
          // Check if we're coming from login page to avoid redirect loop
          const referrer = document.referrer;
          const isFromLogin = referrer.includes('/auth/login');
          
          if (!isFromLogin) {
            const currentUrl = window.location.pathname + window.location.search;
            const loginUrl = `/auth/login?returnUrl=${encodeURIComponent(currentUrl)}`;
            router.replace(loginUrl);
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

    // Validate stock before submitting
    if (productDetails?.quantityAvailable !== undefined && qty > productDetails.quantityAvailable) {
      setError(`Chỉ còn ${productDetails.quantityAvailable} sản phẩm trong kho. Vui lòng giảm số lượng.`);
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

      // Ensure userId is a number
      const userId = typeof user.userId === 'string' ? parseInt(user.userId, 10) : user.userId;
      
      if (isNaN(userId)) {
        throw new Error('Invalid user ID');
      }

      const orderData: CreateOrderRequest = {
        userId: userId,
        shopId: shopId,
        productId: productId,
        quantity: qty,
        pickupTime: pickupTime,
        unitPrice: unitPrice,
        totalPrice: total
      };


      const order = await OrderService.createOrder(orderData);


      // Generate a simple order code for display
      const code = String(Math.floor(2_000_000 + Math.random() * 8_000_000));
      
      setSuccess({ 
        order,
        code 
      });

    } catch (error) {
      console.error('❌ Failed to create order:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Không thể đặt chỗ. Vui lòng thử lại.';
      
      // Handle specific error cases
      if (errorMessage.includes('Không đủ hàng trong kho') || errorMessage.includes('Xung đột dữ liệu')) {
        setError('Sản phẩm hiện tại không đủ số lượng. Vui lòng giảm số lượng hoặc chọn sản phẩm khác.');
      } else if (errorMessage.includes('Không tìm thấy sản phẩm') || errorMessage.includes('Không tìm thấy')) {
        setError('Sản phẩm không còn tồn tại. Vui lòng quay lại trang chủ để chọn sản phẩm khác.');
      } else if (errorMessage.includes('Xác thực thất bại') || errorMessage.includes('401')) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else if (errorMessage.includes('Yêu cầu không hợp lệ') || errorMessage.includes('Dữ liệu không hợp lệ')) {
        setError('Thông tin đơn hàng không hợp lệ. Vui lòng kiểm tra lại và thử lại.');
      } else if (errorMessage.includes('Lỗi máy chủ') || errorMessage.includes('500')) {
        setError('Máy chủ đang gặp sự cố. Vui lòng thử lại sau vài phút.');
      } else if (errorMessage.includes('Lỗi mạng') || errorMessage.includes('timeout')) {
        setError('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.');
      } else {
        setError(errorMessage);
      }
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
              <span className="fw-semibold" style={{ color: "#54A65C" }}>
                {success.order.status === "1" && "Chờ xác nhận"}
                {success.order.status === "2" && "Đã xác nhận"}
                {success.order.status === "3" && "Hoàn thành"}
                {success.order.status === "4" && "Hủy"}
                {!["1", "2", "3", "4"].includes(success.order.status) && success.order.status}
              </span>
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

  // Show loading while checking authentication or loading product details
  if (!authChecked || isLoadingProduct) {
    return (
      <main className="container py-3" style={{ maxWidth: 560 }}>
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">
              {!authChecked ? 'Đang kiểm tra đăng nhập...' : 'Đang tải thông tin sản phẩm...'}
            </span>
          </div>
          <p className="mt-2">
            {!authChecked ? 'Đang kiểm tra đăng nhập...' : 'Đang tải thông tin sản phẩm...'}
          </p>
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
          {/* Ngày đặt (có thể chỉnh sửa) */}
          <label className="form-label text-start w-100">Ngày đặt</label>
          <div className="input-group mb-3">
            <span className="input-group-text">📅</span>
            <div className="form-control bg-light" style={{ borderColor: "#54A65C" }}>
              {formatDateVN(dateISO)}
            </div>
          </div>

          {/* Giờ đặt (24h, có thể chỉnh sửa) */}
          <label className="form-label text-start w-100">Giờ đặt</label>
          <div className="input-group mb-3">
            <span className="input-group-text">🕑</span>
            <div 
              className={`form-control ${styles.clickableTimeInput}`}
              style={{ borderColor: "#54A65C" }}
              onClick={() => setShowTimePicker(true)}
            >
              {formatTimeVN24(timeHM)}
            </div>
          </div>

          {/* Time Alert Banner */}
          {timeAlert && (
            <div className="alert alert-danger mb-3" role="alert" style={{ fontSize: '14px', padding: '8px 12px' }}>
              {timeAlert}
            </div>
          )}

          {/* Số lượng */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="form-label mb-0">
              Số lượng
              {productDetails?.quantityAvailable !== undefined && (
                <span className="text-muted small ms-1">
                  (còn {productDetails.quantityAvailable})
                </span>
              )}
            </label>
            <div className="btn-group" role="group" aria-label="Số lượng">
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                onClick={handleDecreaseQuantity}
                disabled={qty <= 1}
              >
                −
              </button>
              <span className="btn btn-outline-secondary disabled">{qty}</span>
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                onClick={handleIncreaseQuantity}
                disabled={productDetails?.quantityAvailable !== undefined && qty >= productDetails.quantityAvailable}
              >
                +
              </button>
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
              <div className="d-flex align-items-start">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="me-2 mt-1" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
                  <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <div className="flex-grow-1">
                  <div className="fw-medium mb-1">Không thể đặt chỗ</div>
                  <div className="small">{error}</div>
                  {error.includes('không đủ số lượng') && qty > 1 && (
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-danger mt-2"
                      onClick={handleDecreaseQuantity}
                    >
                      Thử với {qty - 1} sản phẩm
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <p className="text-body-secondary text-center mb-3">
            Chỗ của bạn sẽ được giữ trong 30 phút
          </p>

          <button 
            type="submit" 
            className="btn w-100 py-2 fw-bold" 
            style={{ background: "#54A65C", color: "#fff" }}
            disabled={
              isLoading || 
              !isLoggedIn || 
              !isValidTime(timeHM) || 
              isLoadingProduct ||
              (productDetails?.quantityAvailable !== undefined && qty > productDetails.quantityAvailable)
            }
          >
            {isLoading ? 'Đang đặt chỗ...' : isLoadingProduct ? 'Đang tải...' : 'Giữ chỗ'}
          </button>
        </div>
      </form>

      {/* TimePicker Modal */}
      {showTimePicker && (
        <TimePicker
          value={timeHM}
          onChange={handleTimeChange}
          onClose={() => setShowTimePicker(false)}
        />
      )}
    </main>
  );
}
