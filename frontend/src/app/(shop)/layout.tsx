import { Suspense } from "react";
import Header from "@/components/Home-page/Header";
import Footer from "@/components/Home-page/Footer";
import AiChatButton from "@/components/Home-page/AiChatButton";

// Layout of all the shop pages: header, content, footer and the AI button.
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Header uses usePathname(), so it must be inside Suspense */}
      <Suspense fallback={<div className="h-16 border-b border-gray-200 bg-white" />}>
        <Header />
      </Suspense>

      <main className="mx-auto max-w-7xl px-4 py-4">{children}</main>
      <Footer />
      <AiChatButton />
    </>
  );
}