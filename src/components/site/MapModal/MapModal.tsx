"use client";

import styles from "./MapModal.module.css";

export default function MapModal({
  open,
  onClose,
  title,
  address,
  coords, // { lat, lng }
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  address: string;
  coords: { lat: number; lng: number };
}) {
  if (!open) return null;

  // Dùng dạng q=lat,lng & output=embed (không cần key)
  const src = `https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`;
  const external = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;

  return (
    <div className={styles.backdrop} onClick={(e) => e.currentTarget === e.target && onClose()}>
      <div role="dialog" aria-modal="true" className={styles.sheet}>
        <div className={styles.header}>
          <div>
            <div className="fw-semibold">{title}</div>
            <div className="text-muted small">{address}</div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">×</button>
        </div>

        <div className={styles.map}>
          <iframe
            title="Bản đồ"
            src={src}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>

        <div className="p-3">
          <a className={styles.openLink} href={external} target="_blank" rel="noreferrer">
            Mở trong Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}
