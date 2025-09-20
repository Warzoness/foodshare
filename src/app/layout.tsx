import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/globals.css";
import type { Metadata } from "next";
import LocationGate from "@/components/share/LocationGate";

export const metadata: Metadata = {
  title: "FoodShare",
  description: "Chia sẻ thực phẩm, giảm lãng phí",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        {/* Google Identity Services */}
        <script src="https://accounts.google.com/gsi/client" async defer></script>
        {/* Facebook SDK */}
        <script async defer crossOrigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js"></script>
      </head>
      <body>
        <LocationGate>{children}</LocationGate>
      </body>
    </html>
  );
}
