"use client";

import { useEffect, useState } from "react";

export default function LocationWarning() {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Disabled - bypass location warnings for development
    // if (typeof window !== "undefined" && !window.isSecureContext) {
    //   setShowWarning(true);
    // }
  }, []);

  if (!showWarning) return null;

  return (
    <div className="alert alert-warning alert-dismissible fade show" role="alert" style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      right: '10px',
      zIndex: 9999,
      margin: 0,
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}>
      <div className="d-flex align-items-start">
        <div className="me-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
          </svg>
        </div>
        <div className="flex-grow-1">
          <strong>Lưu ý về vị trí:</strong>
          <div className="mt-1" style={{ fontSize: '14px' }}>
            <p className="mb-1">Tính năng vị trí chỉ hoạt động trên:</p>
            <ul className="mb-1" style={{ paddingLeft: '20px' }}>
              <li>HTTPS (https://)</li>
              <li>Localhost (http://localhost)</li>
            </ul>
            <p className="mb-0">
              <strong>Để sử dụng trên điện thoại:</strong> Truy cập qua IP thực của máy tính 
              (ví dụ: http://192.168.1.100:3000) hoặc sử dụng ngrok để tạo HTTPS tunnel.
            </p>
          </div>
        </div>
        <button 
          type="button" 
          className="btn-close" 
          onClick={() => setShowWarning(false)}
          aria-label="Close"
        ></button>
      </div>
    </div>
  );
}
