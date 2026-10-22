"use client";
import { useEffect ,useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { usePathname, useRouter } from "next/navigation"; // App Router uses next/navigation
import { FiMenu, FiSearch, FiShoppingCart, FiUser, FiX } from "react-icons/fi";

// Navigation links. "href" with # scrolls to a section on the home page.
const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/#products" },
  { label: "Categories", href: "/#categories" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// Top navigation bar.
export default function Header() {
  const { count: cartCount } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [text, setText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false); // hamburger menu open or closed
  const router = useRouter();
  const pathname = usePathname();

  // Go to the home page with the search text in the URL
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = text.trim();
    setMenuOpen(false);
    router.push(q ? `/?search=${encodeURIComponent(q)}` : "/");
  };

  // Only items with a real path can be "active" (not the # anchors)
  const isActive = (href: string) => !href.includes("#") && pathname === href;

  // The same search box is used in the bar and in the phone menu
  const searchForm = (className: string) => (
    <form onSubmit={handleSearch} className={className}>
      <input
        value={text} // must be {text}, not "text"
        onChange={(e) => setText(e.target.value)}
        placeholder="Search for products..."
        className="min-w-0 flex-1 px-3 py-2 text-sm outline-none"
      />
      <button
        type="submit"
        aria-label="Search"
        className="flex items-center bg-blue-600 px-3 text-white hover:bg-blue-700"
      >
        <FiSearch className="text-lg" />
      </button>
    </form>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4">
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
          <span className="text-lg font-bold text-gray-900 sm:text-xl">
            SmartShop <span className="text-blue-600">AI</span>
          </span>
        </Link>

        {/* Main navigation: only on large desktop screens (xl and up) */}
        <nav className="hidden gap-6 text-sm font-medium text-gray-700 xl:flex">
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

        {/* Search box in the bar: tablet and desktop only (md and up) */}
        {searchForm("hidden min-w-0 max-w-xs flex-1 overflow-hidden rounded-lg border border-gray-300 md:flex")}

        <div className="flex shrink-0 items-center gap-4 text-sm">
          {/* Login / Register: the text is shown from lg, smaller screens show only the icon */}
          <Link
            href="/login"
            aria-label="Login / Register"
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
          >
            <FiUser className="text-xl" />
            <span className="hidden lg:inline">Login / Register</span>
          </Link>

          {/* Cart icon with item count badge */}
          <Link href="/cart" aria-label="Cart" className="relative text-gray-700 hover:text-blue-600">
            <FiShoppingCart className="text-2xl" />
            {mounted && cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Hamburger button: hidden on desktop (xl and up) */}
          <button
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="text-2xl text-gray-700 hover:text-blue-600 xl:hidden"
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Dropdown menu for phone and tablet */}
      {menuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 xl:hidden">
          {/* Search is only needed here on phones (tablet already has it in the bar) */}
          <div className="mb-3 md:hidden">
            {searchForm("flex overflow-hidden rounded-lg border border-gray-300")}
          </div>

          <nav className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)} // close the menu after choosing a link
                className={`border-b border-gray-100 py-3 text-sm font-medium last:border-b-0 ${
                  isActive(link.href) ? "text-blue-600" : "text-gray-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}