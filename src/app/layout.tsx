import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FoodShare",
  description: "Chia sẻ thực phẩm, giảm lãng phí",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
