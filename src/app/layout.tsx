import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";

const sora = localFont({
  src: "../fonts/Sora-Variable.ttf",
  variable: "--font-sora",
  weight: "100 800",
  display: "swap",
});

const inter = localFont({
  src: "../fonts/Inter-Variable.ttf",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MediLens — AI Healthcare Report Intelligence",
  description:
    "MediLens turns raw lab reports into clear, explainable AI insights — risk predictions, plain-language explanations, and a medical chat assistant.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${inter.variable} antialiased`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
