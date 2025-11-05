import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Koulen } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700"],
});

const koulen = Koulen({
  subsets: ["latin"],
  variable: "--font-koulen",
  weight: "400",
});

export const metadata: Metadata = {
  title: "BARTR - Swap Goods and Services",
  description: "BARTR connects neighbors to swap goods and services — no money, just trades.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} ${koulen.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
