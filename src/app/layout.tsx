import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SlidingCart from "@/components/SlidingCart";
import TopMarquee from "@/components/TopMarquee";
import CustomCursor from "@/components/CustomCursor";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jost",
});

export const metadata: Metadata = {
  title: "Parvé — Ultra-Premium Luxury Dresses",
  description: "Premium dresses for the modern American woman",
  keywords: ["luxury dresses", "premium fashion", "women dresses", "Parvé"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${jost.variable}`}>
        <CustomCursor />
        <TopMarquee />
        <Navbar />
        <SlidingCart />
        {children}
      </body>
    </html>
  );
}
