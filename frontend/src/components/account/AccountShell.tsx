"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaRobot } from "react-icons/fa";
import { FiLogOut, FiMenu, FiSearch, FiShoppingCart, FiX } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { ACCOUNT_NAV } from "@/lib/account-nav";

// The frame of the customer account pages: sidebar, top bar and the login check.
export default function AccountShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, ready, logout } = useAuth();
  const { count } = useCart();

  const [open, setOpen] = useState(false); // sidebar on phones
  const [text, setText] = useState("");    // search box

  // Not logged in: go to the login page, and come back here after the login
  useEffect(() => {
    if (ready && !user) router.replace("/login?next=/account");
  }, [ready, user, router]);

  if (!ready || !user) return <p className="py-20 text-center text-gray-500">Loading...</p>;

  // Only the Dashboard link can be "active" (the other links leave this page)
  const isActive = (href: string) => href === "/account" && pathname === "/account";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = text.trim();
    router.push(q ? `/?search=${encodeURIComponent(q)}` : "/");
  };

  const initials = user.full_name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      {/* Dark layer behind the sidebar on phones */}
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* ===== Sidebar: a drawer on phones, always visible from lg ===== */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2 p-5">
          <Link href="/account" className="flex items-center gap-2">
            <Image
              src="/assets/images/logo.png"
              alt="SmartShop AI"
              width={36}
              height={36}
              style={{ height: "36px", width: "auto" }}
            />
            <span className="leading-tight">
              <span className="block font-bold text-gray-900">SmartShop AI</span>
              <span className="block text-[11px] text-gray-500">Smarter Shopping, Better Life</span>
            </span>
          </Link>
          <button onClick={() => setOpen(false)} aria-label="Close menu" className="text-xl text-gray-500 lg:hidden">
            <FiX />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3">
          <ul className="space-y-1">
            {ACCOUNT_NAV.map(({ label, href, Icon, ready: pageReady }) =>
              pageReady ? (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                      isActive(href) ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="text-lg" /> {label}
                  </Link>
                </li>
              ) : (
                // The page is not built yet
                <li key={href}>
                  <span className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400">
                    <Icon className="text-lg" /> {label}
                    <span className="ml-auto rounded bg-gray-100 px-1.5 py-0.5 text-[10px]">Soon</span>
                  </span>
                </li>
              )
            )}
          </ul>

          {/* Help card */}
          <div className="mt-6 rounded-xl bg-blue-50 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-xl text-white">
              <FaRobot />
            </span>
            <p className="mt-3 font-bold text-gray-900">Need help?</p>
            <p className="text-sm font-medium text-gray-700">Ask our AI Assistant</p>
            <p className="mt-1 text-xs text-gray-500">Find the right product, get recommendations, and more!</p>
            <Link
              href="/account#assistant"
              onClick={() => setOpen(false)}
              className="mt-3 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Chat Now →
            </Link>
          </div>
        </nav>

        <div className="border-t border-gray-200 p-3">
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-red-500"
          >
            <FiLogOut className="text-lg" /> Logout
          </button>
        </div>
      </aside>

      {/* ===== Top bar and page ===== */}
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-gray-200 bg-white px-4 sm:px-6">
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="text-2xl text-gray-700 lg:hidden">
            <FiMenu />
          </button>

          <form
            onSubmit={handleSearch}
            className="hidden max-w-lg flex-1 items-center gap-2 rounded-full bg-slate-100 px-4 sm:flex"
          >
            <FiSearch className="text-gray-400" />
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Search for products, brands and more..."
              className="w-full bg-transparent py-2.5 text-sm outline-none"
            />
          </form>

          <div className="ml-auto flex items-center gap-4">
            <Link href="/cart" aria-label="Cart" className="relative text-xl text-gray-700 hover:text-blue-600">
              <FiShoppingCart />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] text-white">
                  {count}
                </span>
              )}
            </Link>

            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {initials}
              </span>
              <span className="hidden leading-tight sm:block">
                <span className="block max-w-35 truncate text-sm font-medium text-gray-900">{user.full_name}</span>
                <span className="block text-xs text-gray-500">
                  {user.role === "admin" ? "Administrator" : "Customer"}
                </span>
              </span>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}