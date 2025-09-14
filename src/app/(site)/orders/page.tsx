"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import styles from "./orders.module.css";

/** ===== Types ===== */
export type HoldStatus = "HOLDING" | "EXPIRED";
export type DoneSubStatus = "RECEIVED" | "CANCELLED" | "REJECTED";
export type OrderStatus = HoldStatus | "DONE";

export type Order = {
    id: number;
    name: string;
    qty: number;
    holdCode?: string;            // mã đặt chỗ
    time: string;                 // “6:00 PM – 12/06/2025”
    store: string;                // tên cửa hàng
    imageUrl: string;
    status: OrderStatus;
    doneDetail?: DoneSubStatus;   // chỉ dùng khi status = "DONE"
};

/** ===== Mock data (thay bằng API của bạn) ===== */
const MOCK_ORDERS: Order[] = [
    {
        id: 1,
        name: "Gà sốt cay",
        qty: 2,
        time: "6:00 PM — 12/06/2025",
        holdCode: "2272738",
        store: "Gà sốt cay",
        imageUrl: "/images/chicken-fried.jpg",
        status: "HOLDING",
    },
    {
        id: 2,
        name: "Phở bò",
        qty: 1,
        time: "6:00 PM — 12/06/2025",
        holdCode: "2272740",
        store: "Phở bò",
        imageUrl: "/images/chicken-fried.jpg",
        status: "HOLDING",
    },
    {
        id: 3,
        name: "Cơm tấm",
        qty: 1,
        time: "6:00 PM — 12/06/2025",
        holdCode: "2272741",
        store: "Cơm tấm",
        imageUrl: "/images/chicken-fried.jpg",
        status: "HOLDING",
    },
    {
        id: 4,
        name: "Bánh mì thịt",
        qty: 3,
        time: "10:15 AM — 10/06/2025",
        store: "Tiệm Bánh Mi",
        imageUrl: "/images/chicken-fried.jpg",
        status: "DONE",
        doneDetail: "RECEIVED",
    },
    {
        id: 5,
        name: "Bún chả",
        qty: 1,
        time: "08:00 PM — 09/06/2025",
        store: "Bún Chả Cô Ba",
        imageUrl: "/images/chicken-fried.jpg",
        status: "DONE",
        doneDetail: "CANCELLED",
    },
    {
        id: 6,
        name: "Hủ tiếu",
        qty: 1,
        time: "07:00 PM — 07/06/2025",
        store: "Hủ Tiếu Mực",
        imageUrl: "/images/chicken-fried.jpg",
        status: "EXPIRED",
    },
];

/** ===== UI helpers ===== */
type TabKey = "ALL" | "HOLDING" | "DONE" | "EXPIRED";

const TAB_LABELS: Record<TabKey, string> = {
    ALL: "Tất cả",
    HOLDING: "Đang giữ chỗ",
    DONE: "Hoàn tất",
    EXPIRED: "Hết hạn",
};

function StatusBadge({ order }: { order: Order }) {
    if (order.status === "HOLDING") {
        return (
            <span className="badge d-inline-flex align-items-center gap-1 bg-success-subtle text-success border border-success px-2 py-1 rounded-pill">
                {/* icon clock */}
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M8 3.5a.5.5 0 0 1 .5.5v3.25l2.25 1.35a.5.5 0 1 1-.5.86L7.75 8.1A.5.5 0 0 1 7.5 7.7V4a.5.5 0 0 1 .5-.5z" />
                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm0-1.2A6.8 6.8 0 1 1 8 1.2a6.8 6.8 0 0 1 0 13.6z" />
                </svg>
                Đang giữ chỗ
            </span>
        );
    }

    if (order.status === "EXPIRED") {
        return <span className="badge bg-secondary-subtle text-secondary border border-secondary px-2 py-1 rounded-pill">Hết hạn</span>;
    }

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

    return (
        <div className="d-flex gap-3 py-3 border-bottom">
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
                <div className="d-flex justify-content-between align-items-start">
                    <h6 className="mb-1 fw-semibold">{order.name}</h6>
                    <StatusBadge order={order} />
                </div>

                <ul className={`${styles.meta} list-unstyled mb-0 small text-body-secondary`}>
                    <li>
                        <span className="fw-medium">Số lượng:</span> {order.qty}
                    </li>
                    <li>
                        <span className="fw-medium">Thời gian:</span> {order.time}
                    </li>
                    {order.holdCode && (
                        <li>
                            <span className="fw-medium">Mã đặt chỗ:</span> {order.holdCode}
                        </li>
                    )}
                    <li>
                        <span className="fw-medium">Cửa hàng:</span> {order.store}
                    </li>
                </ul>
            </div>
        </div>
    );
}
export default function OrdersPage() {
    const [active, setActive] = useState<TabKey>("HOLDING");

    const filtered = useMemo(() => {
        if (active === "ALL") return MOCK_ORDERS;
        return MOCK_ORDERS.filter((o) =>
            active === "DONE" ? o.status === "DONE" : o.status === active
        );
    }, [active]);

    return (
        <main className="container py-3" style={{ maxWidth: 640 }}>
            {/* Header */}
            <div className="d-flex align-items-center gap-2 mb-2">
                <button className="btn btn-link p-0 pe-2 text-decoration-none" onClick={() => history.back()} aria-label="Quay lại">
                    ←
                </button>
                <h5 className="mb-0 fw-bold">Đơn hàng của tôi</h5>
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
                {filtered.length === 0 ? (
                    <div className="text-center text-body-secondary py-5">Không có đơn nào</div>
                ) : (
                    filtered.map((o) => <OrderItem key={o.id} order={o} />)
                )}
            </div>
        </main>
    );
}
