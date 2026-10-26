import type { Metadata } from "next";
import { Suspense } from "react";
import AccountShell from "@/components/account/AccountShell";

export const metadata: Metadata = {
  title: "My Account | SmartShop AI",
};

// Layout of the /account pages. No shop header or footer here.
// AccountShell uses usePathname(), so it must be inside Suspense.
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="py-20 text-center text-gray-500">Loading...</p>}>
      <AccountShell>{children}</AccountShell>
    </Suspense>
  );
}