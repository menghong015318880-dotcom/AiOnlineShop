import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AiChatButton from "@/components/AiChatButton";

// This sets the browser tab title (it was "Create Next App")
export const metadata: Metadata = {
  title: "SmartShop AI",
  description: "Smart shopping with AI recommendations",
};

// Root layout: header, footer and the AI button appear on every page.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">
        {/* cartCount={2} is temporary, remove it when the cart is built */}
        <Header cartCount={2} />
        <main className="mx-auto max-w-7xl px-4 py-4">{children}</main>
        <Footer />
        <AiChatButton />
      </body>
    </html>
  );
}