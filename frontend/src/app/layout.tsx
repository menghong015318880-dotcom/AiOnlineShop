import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Header from "@/components/Home-page/Header";
import Footer from "@/components/Home-page/Footer";
import AiChatButton from "@/components/Home-page/AiChatButton";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "SmartShop AI",
  description: "Smart shopping with AI recommendations",
};

// Root layout: header, footer and the AI button appear on every page.
// CartProvider wraps everyting, so every page can read and change the cart.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">
        <CartProvider>
          {/* Header uses usePathname(), so it must be inside Supense */}
          <Suspense fallback={<div className="h-16 border-b border-gray-200 bg-white"/>}>
          <Header />
          </Suspense>

          <main className="mx-auto max-w-7xl px-4 pay-4">{children}</main>
          <Footer />
          <AiChatButton />
        </CartProvider>
      </body>
    </html>
  );
}