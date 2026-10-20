"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // App Router uses next/navigation
import { FiShoppingCart, FiUser } from "react-icons/fi"; // user and cart icons

// Navigation links. "href" with # scrolls to a section on the home page.
const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/#products" },
  { label: "Categories", href: "/#categories" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// Top navigation bar.
// cartCount is a placeholder until the cart feature is built.
export default function Header({ cartCount = 0 }: { cartCount?: number }) {
  const [text, setText] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  // Go to the home page with the search text in the URL
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = text.trim();
    router.push(q ? `/?search=${encodeURIComponent(q)}` : "/");
  };

  // Only items with a real path can be "active" (not the # anchors)
  const isActive = (href: string) => !href.includes("#") && pathname === href;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        {/* Logo icon + brand name side by side.
            The image file must exist at public/assets/images/logo.png */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/assets/images/logo.png"
            alt="SmartShop AI"
            width={36}
            height={36}
            // Set the height and let the width follow the image ratio
            style={{ height: "36px", width: "auto" }}
            priority
          />
          <span className="text-xl font-bold text-gray-900">
            SmartShop <span className="text-blue-600">AI</span>
          </span>
        </Link>

        {/* Main navigation (shown on large screens) */}
        <nav className="hidden gap-6 text-sm font-medium text-gray-700 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={isActive(link.href) ? "text-blue-600" : "hover:text-blue-600"}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Header search box */}
        <form
          onSubmit={handleSearch}
          className="hidden max-w-xs flex-1 overflow-hidden rounded-lg border border-gray-300 md:flex"
        >
          <input
            value={text} // must be {text}, not "text"
            onChange={(e) => setText(e.target.value)}
            placeholder="Search for products..."
            className="w-full px-3 py-2 text-sm outline-none"
          />
          <button type="submit" className="bg-blue-600 px-3 text-sm text-white hover:bg-blue-700">
            Search
          </button>
        </form>

        <div className="flex shrink-0 items-center gap-5 text-sm">
          {/* Login / Register with user icon */}
          <Link href="/login" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
            <FiUser className="text-xl" />
            <span className="hidden sm:inline">Login / Register</span>
          </Link>

          {/* Cart icon with item count badge */}
          <Link href="/cart" aria-label="Cart" className="relative text-gray-700 hover:text-blue-600">
            <FiShoppingCart className="text-2xl" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}