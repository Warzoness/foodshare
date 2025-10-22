"use client";

import dynamic from "next/dynamic";

// Dynamically import LocationGate to avoid hydration issues
const LocationGate = dynamic(() => import("./LocationGate"), {
  ssr: false,
  loading: () => null
});

interface ClientLocationGateProps {
  children: React.ReactNode;
}

export default function ClientLocationGate({ children }: ClientLocationGateProps) {
  return children;
}
