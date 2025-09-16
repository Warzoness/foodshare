"use client";

import { useEffect } from "react";

/**
 * Requests geolocation permission on first app load (per session).
 * Uses Permissions API when available to avoid redundant prompts.
 */
export default function GeoPermission() {
  useEffect(() => {
    const sessionKey = "geo-permission-requested";
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(sessionKey)) return;

    // Only attempt in secure contexts where geolocation is available
    if (!window.isSecureContext || !("geolocation" in navigator)) return;

    const request = () => {
      try {
        navigator.geolocation.getCurrentPosition(
          () => {
            sessionStorage.setItem(sessionKey, "1");
          },
          () => {
            // Still mark as requested to avoid nagging the user this session
            sessionStorage.setItem(sessionKey, "1");
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
        );
      } catch {
        // noop
      }
    };

    // Prefer Permissions API to decide whether to trigger prompt
    if (navigator.permissions && (navigator.permissions as any).query) {
      // types for Permissions API aren't perfect across TS versions
      (navigator.permissions as any)
        .query({ name: "geolocation" as PermissionName })
        .then((status: PermissionStatus) => {
          if (status.state === "prompt") {
            request();
          } else {
            // granted or denied → do not re-prompt
            sessionStorage.setItem(sessionKey, "1");
          }
        })
        .catch(() => {
          // If query fails, fall back to attempting the request
          request();
        });
    } else {
      request();
    }
  }, []);

  return null;
}


