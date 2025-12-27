import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/globals.css";
import type { Metadata } from "next";
import ClientLocationGate from "@/components/share/ClientLocationGate";

export const metadata: Metadata = {
  title: "FoodShare",
  description: "Chia sẻ thực phẩm, giảm lãng phí đồ ăn",
  icons: {
    icon: "/logo/logo_32x32.png",
    shortcut: "/logo/logo_32x32.png",
    apple: "/logo/logo_32x32.png",
  },
  openGraph: {
    title: "FoodShare",
    description: "Chia sẻ thực phẩm, giảm lãng phí đồ ăn",
    images: [
      {
        url: "/logo/logo_32x32.png",
        width: 32,
        height: 32,
        alt: "FoodShare Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FoodShare",
    description: "Chia sẻ thực phẩm, giảm lãng phí đồ ăn",
    images: ["/logo/logo_512x512.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        {/* Google Identity Services */}
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body suppressHydrationWarning={true}>
        <ClientLocationGate>{children}</ClientLocationGate>
      </body>
    </html>
  );
}
