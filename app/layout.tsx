import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Venice Biennale 2026 Map | Every Pavilion is a State Op",
  description:
    "Interactive map revealing the financing architecture behind national pavilions at the 2026 Venice Art Biennale. Follow the money from state ministries, private donors, and galleries.",
  openGraph: {
    title: "Venice Biennale 2026 Map",
    description: "Every Pavilion is a State Op — Follow the Money",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-[#0a0a0f]">
      <body className="antialiased">{children}</body>
    </html>
  );
}
