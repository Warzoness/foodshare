"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import styles from "./orders.module.css";
import { OrderService } from "@/services/site/order.service";
import { Order as ApiOrder } from "@/types/order";
import { AuthService } from "@/services/site/auth.service";
import AuthGuard from "@/components/share/AuthGuard";
import LoadingSpinner from "@/components/share/LoadingSpinner";
import FloatMenu from "@/components/site/layouts/FloatMenu/FloatMenu";

/** ===== Types ===== */
export type OrderStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "PICKED_UP" | "CANCELLED" | "EXPIRED";
export type DoneSubStatus = "RECEIVED" | "CANCELLED" | "REJECTED";

export type Order = {
    id: number;
    name: string;
    qty: number;
    orderCode?: string;           // mã đơn hàng
    time: string;                 // "6:00 PM – 12/06/2025"
    store: string;                // tên cửa hàng
    imageUrl: string;
    status: OrderStatus;
    doneDetail?: DoneSubStatus;   // chỉ dùng khi status = "PICKED_UP"
    unitPrice?: number;           // giá đơn vị
    totalPrice?: number;          // tổng giá
};

// Helper function to convert API order to UI order
function convertApiOrderToUIOrder(apiOrder: ApiOrder): Order {
    const pickupDate = new Date(apiOrder.pickupTime);
    const formattedTime = pickupDate.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).replace(',', ' —');

    // Map status number to status string
    const statusMap: Record<string, OrderStatus> = {
        "1": "PENDING",      // chờ xác nhận
        "2": "CONFIRMED",    // đã xác nhận
        "3": "CANCELLED",    // đã hủy
        "4": "PICKED_UP"     // hoàn thành
    };

    return {
        id: apiOrder.id,
        name: `Sản phẩm ${apiOrder.productName}`, // TODO: Get actual product name
        qty: apiOrder.quantity,
        orderCode: apiOrder.id.toString(),
        time: formattedTime,
        store: `Cửa hàng ${apiOrder.shopName}`, // TODO: Get actual store name
        imageUrl: apiOrder.productImage, // TODO: Get actual product image
        status: statusMap[apiOrder.status] || "PENDING",
        unitPrice: apiOrder.unitPrice,
        totalPrice: apiOrder.totalPrice,
    };
}


/** ===== UI helpers ===== */
type TabKey = "ALL" | "ACTIVE" | "COMPLETED" | "EXPIRED";

const TAB_LABELS: Record<TabKey, string> = {
    ALL: "Tất cả",
    ACTIVE: "Đang xử lý",
    COMPLETED: "Hoàn tất",
    EXPIRED: "Đã hủy",
};

function StatusBadge({ order }: { order: Order }) {
    if (order.status === "PENDING") {
        return (
            <span className="badge d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill" style={{ background: "#FFF3CD", color: "#856404", border: "1px solid #FFEAA7" }}>
                {/* icon clock */}
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M8 3.5a.5.5 0 0 1 .5.5v3.25l2.25 1.35a.5.5 0 1 1-.5.86L7.75 8.1A.5.5 0 0 1 7.5 7.7V4a.5.5 0 0 1 .5-.5z" />
                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm0-1.2A6.8 6.8 0 1 1 8 1.2a6.8 6.8 0 0 1 0 13.6z" />
                </svg>
                Chờ xác nhận
            </span>
        );
    }

    if (order.status === "CONFIRMED") {
        return (
            <span className="badge d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill" style={{ background: "#EAF4EC", color: "#54A65C", border: "1px solid #54A65C" }}>
                {/* icon check */}
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" />
                </svg>
                Đã xác nhận
            </span>
        );
    }

    if (order.status === "PREPARING") {
        return (
            <span className="badge d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill" style={{ background: "#CCE5FF", color: "#0066CC", border: "1px solid #0066CC" }}>
                {/* icon gear */}
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" />
                    <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.292-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.292c.415.764-.42 1.6-1.185 1.184l-.292-.159a1.873 1.873 0 0 0-2.692 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.693-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.292A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z" />
                </svg>
                Đang chuẩn bị
            </span>
        );
    }

    if (order.status === "READY") {
        return (
            <span className="badge d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill" style={{ background: "#D1ECF1", color: "#0C5460", border: "1px solid #0C5460" }}>
                {/* icon bell */}
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M8 16a2 2 0 0 0 1.985-1.75h-3.97A2 2 0 0 0 8 16z" />
                    <path d="M8 1.5a3.5 3.5 0 0 0-3.5 3.5v.5h7v-.5A3.5 3.5 0 0 0 8 1.5z" />
                </svg>
                Sẵn sàng
            </span>
        );
    }

    if (order.status === "EXPIRED") {
        return <span className="badge bg-secondary-subtle text-secondary border border-secondary px-2 py-1 rounded-pill">Hết hạn</span>;
    }

    if (order.status === "CANCELLED") {
        return (
            <span className="badge d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill" style={{ background: "#F8D7DA", color: "#721C24", border: "1px solid #F5C6CB" }}>
                {/* icon X */}
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                </svg>
                Đã hủy
            </span>
        );
    }

    // PICKED_UP status
    const map: Record<DoneSubStatus, { text: string; cls: string }> = {
        RECEIVED: { text: "Đã nhận hàng", cls: "bg-success" },
        CANCELLED: { text: "Đã hủy", cls: "bg-warning text-dark" },
        REJECTED: { text: "Bị từ chối", cls: "bg-danger" },
    };
    const meta = map[order.doneDetail ?? "RECEIVED"];
    return <span className={`badge ${meta.cls} px-2 py-1 rounded-pill`}>{meta.text}</span>;
}

function OrderItem({ order }: { order: Order }) {
    const imgSrc = order.imageUrl || "/images/chicken-fried.jpg";
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await OrderService.deleteOrder(order.id);
            setShowConfirmModal(false);
            // TODO: Refresh orders list or remove from UI
            window.location.reload(); // Temporary solution
        } catch (error) {
            console.error('❌ Error deleting order:', error);
            alert('Không thể xóa đơn hàng. Vui lòng thử lại.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="py-3 border-bottom">
            <div className="d-flex gap-3">
                <div className={styles.thumb}>
                    <Image
                        src={imgSrc}
                        alt={order.name}
                        width={72}
                        height={72}
                        className="rounded-3 object-fit-cover"
                    />
                </div>

                <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0 fw-semibold">{order.name}</h6>
                        <StatusBadge order={order} />
                    </div>

                    <ul className={`${styles.meta} list-unstyled mb-3 small text-body-secondary`}>
                        <li>
                            <span className="fw-medium">Số lượng:</span> {order.qty}
                        </li>
                        <li>
                            <span className="fw-medium">Thời gian:</span> {order.time}
                        </li>
                        {order.orderCode && (
                            <li>
                                <span className="fw-medium">Mã đơn hàng:</span> {order.orderCode}
                            </li>
                        )}
                        <li>
                            <span className="fw-medium">Cửa hàng:</span> {order.store}
                        </li>
                        {order.unitPrice && (
                            <li>
                                <span className="fw-medium">Giá đơn vị:</span> {order.unitPrice.toLocaleString('vi-VN')} VNĐ
                            </li>
                        )}
                        {order.totalPrice && (
                            <li>
                                <span className="fw-medium">Tổng tiền:</span> 
                                <span className="fw-bold ms-1" style={{ color: '#54A65C' }}>
                                    {order.totalPrice.toLocaleString('vi-VN')} VNĐ
                                </span>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
            
            {/* Cancel button moved below the card - only show if not cancelled or completed */}
            {order.status !== "CANCELLED" && order.status !== "PICKED_UP" && (
                <div className="d-flex justify-content-center">
                    <button 
                        className={styles.deleteButton}
                        onClick={() => setShowConfirmModal(true)}
                        title="Hủy đơn hàng"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/>
                        </svg>
                        Hủy đơn hàng
                    </button>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                            <div className="modal-body text-center p-4">
                                <div className="mb-3">
                                    <div style={{ 
                                        width: '64px', 
                                        height: '64px', 
                                        backgroundColor: '#FEF2F2', 
                                        borderRadius: '50%', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        margin: '0 auto',
                                        marginBottom: '16px'
                                    }}>
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                                            <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                                        </svg>
                                    </div>
                                </div>
                                <h5 className="fw-bold mb-2" style={{ color: '#1F2937' }}>Xác nhận hủy đơn hàng</h5>
                                <p className="text-muted mb-4" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                                    Bạn có chắc chắn muốn hủy đơn hàng <strong>"{order.name}"</strong>?<br/>
                                    Hành động này không thể hoàn tác.
                                </p>
                                <div className="d-flex gap-3 justify-content-center">
                                    <button 
                                        className="btn btn-outline-secondary px-4 py-2" 
                                        style={{ borderRadius: '8px', fontSize: '14px', fontWeight: '500' }}
                                        onClick={() => setShowConfirmModal(false)}
                                        disabled={isDeleting}
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button 
                                        className="btn px-4 py-2" 
                                        style={{ 
                                            backgroundColor: '#EF4444', 
                                            borderColor: '#EF4444', 
                                            color: 'white', 
                                            borderRadius: '8px', 
                                            fontSize: '14px', 
                                            fontWeight: '500' 
                                        }}
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" style={{ color: '#54A65C' }}></span>
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            'Xác nhận hủy'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default function OrdersPage() {
    const [active, setActive] = useState<TabKey>("ACTIVE");
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    // Fetch orders from API
    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Check authentication status
            if (!AuthService.isLoggedIn()) {
                setError('Vui lòng đăng nhập để xem đơn hàng');
                setOrders([]);
                return;
            }
            
            const apiOrders = await OrderService.getUserOrders({
                page: 0,
                size: 50, // Get more orders for better UX
            });
            
            const uiOrders = apiOrders.map(convertApiOrderToUIOrder);
            setOrders(uiOrders);
        } catch (err) {
            console.error('❌ Error fetching orders:', err);
            
            // Check if it's an authentication error
            const errorMessage = (err as Error).message.toLowerCase();
            if (errorMessage.includes('authentication failed') || 
                errorMessage.includes('authentication token') || 
                errorMessage.includes('unauthorized') ||
                errorMessage.includes('please log in again') ||
                errorMessage.includes('authentication failed. please log in again.')) {
                setError('Oops, có lỗi xảy ra!');
                // Don't clear token immediately - let user decide
                // AuthService.logout();
            } else if (errorMessage.includes('network error')) {
                setError('Lỗi kết nối. Vui lòng kiểm tra internet và thử lại.');
            } else {
                setError('Không thể tải danh sách đơn hàng từ server');
            }
            
            // Show empty state
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filtered = useMemo(() => {
        if (active === "ALL") return orders;
        if (active === "ACTIVE") {
            return orders.filter((o) => 
                ["PENDING", "CONFIRMED"].includes(o.status)
            );
        }
        if (active === "COMPLETED") {
            return orders.filter((o) => o.status === "PICKED_UP");
        }
        if (active === "EXPIRED") {
            return orders.filter((o) => o.status === "CANCELLED");
        }
        return orders.filter((o) => o.status === active);
    }, [active, orders]);

    return (
        <AuthGuard>
            <main className={`py-3 ${styles.mainContainer}`}>
            <div className="page-container">
                {/* Header */}
                <div className={styles['title-order']}>
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <button 
                            className="btn-back" 
                            onClick={() => history.back()} 
                            aria-label="Quay lại"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M15 19l-7-7 7-7" stroke="#2b2b2b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <h5 className="mb-0 fw-bold">Đơn hàng của tôi</h5>
                    </div>
                </div>

                {/* Tabs – underline style */}
                <div className={styles.tabBar} role="tablist" aria-label="Trạng thái đơn hàng">
                    {(Object.keys(TAB_LABELS) as TabKey[]).map((key) => (
                        <button
                            key={key}
                            type="button"
                            role="tab"
                            aria-selected={active === key}
                            className={`${styles.tab} ${active === key ? styles.active : ""}`}
                            onClick={() => setActive(key)}
                        >
                            {TAB_LABELS[key]}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="bg-white rounded-3 border p-2 p-sm-3">
                    {loading ? (
                        <LoadingSpinner message="Đang tải đơn hàng..." size="small" className="py-5" />
                    ) : error ? (
                        <div className="text-center text-danger py-5">
                            <div className="mb-2">⚠️</div>
                            <div className="mb-3">{error}</div>
                            <div className="d-flex gap-2 justify-content-center">
                                <button 
                                    className="btn btn-outline-success btn-sm"
                                    onClick={() => fetchOrders()}
                                >
                                    Thử lại
                                </button>
                                <button 
                                    className="btn btn-success btn-sm"
                                    onClick={() => {
                                        AuthService.logout();
                                        window.location.href = '/auth/login';
                                    }}
                                >
                                    Đăng nhập lại
                                </button>
                            </div>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center text-body-secondary py-5">
                            <div className="mb-2">📦</div>
                            {active === "ALL" ? "Bạn chưa có đơn hàng nào" : "Không có đơn hàng trong danh mục này"}
                        </div>
                    ) : (
                        filtered.map((o) => <OrderItem key={o.id} order={o} />)
                    )}
                </div>
            </div>
        </main>
        
        <FloatMenu />
        </AuthGuard>
    );
}
