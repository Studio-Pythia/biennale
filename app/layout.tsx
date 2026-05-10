import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Venice Biennale 2026 — Who Pays, Who Picks, Who Shows",
  description:
    "A pavilion-by-pavilion funding browser for the 2026 Venice Art Biennale. Budgets, public sources, private funders by type, red flags, and press coverage across the major art-press outlets.",
  openGraph: {
    title: "Venice Biennale 2026",
    description: "Who pays, who picks, who shows.",
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
    <html lang="en" className={`${sans.variable} ${serif.variable} bg-[#0a0a0f]`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
