"use client";

import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";

type PermissionState = "unknown" | "checking" | "granted" | "prompt" | "denied" | "unsupported" | "insecure";

export default function LocationGate({ children }: PropsWithChildren) {
  const [state, setState] = useState<PermissionState>("unknown");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const checkPermission = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (!window.isSecureContext) {
      setState("insecure");
      return;
    }
    if (!("geolocation" in navigator)) {
      setState("unsupported");
      return;
    }
    setState("checking");

    try {
      if (navigator.permissions && (navigator.permissions as any).query) {
        const status: PermissionStatus = await (navigator.permissions as any).query({
          name: "geolocation" as PermissionName,
        });
        if (status.state === "granted") {
          setState("granted");
        } else if (status.state === "denied") {
          setState("denied");
        } else {
          setState("prompt");
        }
        return;
      }
    } catch {
      // fall through to prompt
    }
    setState("prompt");
  }, []);

  const requestGeolocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setState("unsupported");
      return;
    }
    setErrorMessage("");
    try {
      navigator.geolocation.getCurrentPosition(
        () => {
          setState("granted");
        },
        (err) => {
          setErrorMessage(err.message || "Không thể lấy vị trí. Hãy thử lại.");
          // If user blocks, keep as denied; otherwise stay prompt
          if (err.code === err.PERMISSION_DENIED) {
            setState("denied");
          } else {
            setState("prompt");
          }
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 0 }
      );
    } catch {
      setErrorMessage("Đã xảy ra lỗi. Hãy thử lại.");
      setState("prompt");
    }
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const content = useMemo(() => {
    if (state === "granted") return null;

    let title = "Cho phép truy cập vị trí";
    let description = "Ứng dụng cần quyền truy cập vị trí để hoạt động chính xác.";
    let primaryText = "Cho phép";
    let secondary: string | null = "Mở lại trình duyệt nếu không thấy hộp thoại";

    if (state === "denied") {
      title = "Vị trí đã bị chặn";
      description =
        "Bạn đã chặn quyền truy cập vị trí. Hãy mở cài đặt trình duyệt và cho phép quyền vị trí cho trang này, sau đó bấm Thử lại.";
      primaryText = "Thử lại";
    } else if (state === "unsupported") {
      title = "Thiết bị không hỗ trợ";
      description = "Thiết bị/trình duyệt không hỗ trợ định vị địa lý.";
      primaryText = "Thử lại";
    } else if (state === "insecure") {
      title = "Yêu cầu kết nối bảo mật";
      description = "Quyền vị trí chỉ hoạt động trên HTTPS hoặc localhost.";
      primaryText = "Thử lại";
    } else if (state === "checking") {
      title = "Đang kiểm tra quyền…";
      description = "Vui lòng đợi trong giây lát.";
      secondary = null;
    }

    return (
      <div style={overlayStyle}>
        <div style={dialogStyle}>
          <h2 style={titleStyle}>{title}</h2>
          <p style={descStyle}>{description}</p>
          {errorMessage ? <p style={errorStyle}>{errorMessage}</p> : null}
          <div style={actionsStyle}>
            <button
              style={buttonStyle}
              onClick={() => {
                if (state === "checking") return;
                if (state === "denied" || state === "unsupported" || state === "insecure") {
                  checkPermission();
                } else {
                  requestGeolocation();
                }
              }}
            >
              {primaryText}
            </button>
          </div>
          {secondary ? <p style={hintStyle}>{secondary}</p> : null}
        </div>
      </div>
    );
  }, [state, errorMessage, checkPermission, requestGeolocation]);

  return (
    <>
      {children}
      {content}
    </>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  backdropFilter: "blur(2px)",
};

const dialogStyle: React.CSSProperties = {
  width: "min(92vw, 440px)",
  backgroundColor: "#fff",
  borderRadius: 12,
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  padding: 24,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  marginBottom: 8,
  fontSize: 20,
  fontWeight: 700,
};

const descStyle: React.CSSProperties = {
  margin: 0,
  color: "#333",
};

const errorStyle: React.CSSProperties = {
  marginTop: 8,
  color: "#c53030",
  fontSize: 13,
};

const actionsStyle: React.CSSProperties = {
  marginTop: 16,
  display: "flex",
  gap: 12,
};

const buttonStyle: React.CSSProperties = {
  appearance: "none",
  border: "none",
  backgroundColor: "#1a73e8",
  color: "#fff",
  padding: "10px 16px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
};

const hintStyle: React.CSSProperties = {
  marginTop: 10,
  color: "#666",
  fontSize: 12,
};


