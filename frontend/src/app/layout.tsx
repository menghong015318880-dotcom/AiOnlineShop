import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Header from "@/components/Home-page/Header";
import Footer from "@/components/Home-page/Footer";
import AiChatButton from "@/components/Home-page/AiChatButton";

// This sets the browser tab title
export const metadata: Metadata = {
  title: "SmartShop AI",
  description: "Smart shopping with AI recommendations",
};

// Root layout: header, footer and the AI button appear on every page.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">
        {/* Header uses usePathname(), which is only known at runtime.
            Suspense lets Next.js prerender the rest of the page first and
            stream the header in. The fallback is an empty bar with the same
            height (h-16), so the page does not jump when the header appears. */}
        <Suspense fallback={<div className="h-16 border-b border-gray-200 bg-white" />}>
          {/* cartCount={2} is temporary, remove it when the cart is built */}
          <Header cartCount={2} />
        </Suspense>

        <main className="mx-auto max-w-7xl px-4 py-4">{children}</main>
        <Footer />
        <AiChatButton />
      </body>
    </html>
  );
}