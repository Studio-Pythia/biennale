import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Venice Biennale 2026 | Every Pavilion is a State Op",
  description:
    "97 national pavilions. 97 stories of who pays, who picks, and who profits. An investigative guide to the financing and governance behind the Venice Art Biennale.",
  openGraph: {
    title: "Venice Biennale 2026",
    description: "Every Pavilion is a State Op — Follow the Money",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
