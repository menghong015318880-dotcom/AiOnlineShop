import Image from "next/image";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

// Footer columns. Pages that do not exist yet use "#" (they do nothing when clicked).
// Change "#" to a real path when you build the page.
const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/#products" },
  { label: "Categories", href: "/#categories" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const CUSTOMER_SERVICE = [
  { label: "Help Center", href: "#" },
  { label: "Shipping Info", href: "#" },
  { label: "Return Policy", href: "#" },
  { label: "Terms & Conditions", href: "#" },
  { label: "Privacy Policy", href: "#" },
];

// Social media icons. Replace "#" with your real page links.
const SOCIALS = [
  { label: "Facebook", href: "#", Icon: FaFacebook },
  { label: "Instagram", href: "#", Icon: FaInstagram },
  { label: "Twitter", href: "#", Icon: FaTwitter },
  { label: "YouTube", href: "#", Icon: FaYoutube },
];

// Footer: brand on the left, three columns on the right, copyright at the bottom.
export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand: logo + name + tagline */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/assets/images/logo.png"
                alt="SmartShop AI"
                width={36}
                height={36}
                style={{ height: "36px", width: "auto" }}
              />
              <span className="text-xl font-bold text-gray-900">
                SmartShop <span className="text-blue-600">AI</span>
              </span>
            </Link>
            <p className="mt-2 text-sm text-gray-600">Smarter Shopping, Better Living</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900">Quick Links</h3>
            <ul className="mt-3 space-y-2 text-xs text-gray-500">
              {QUICK_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-blue-600">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900">Customer Service</h3>
            <ul className="mt-3 space-y-2 text-xs text-gray-500">
              {CUSTOMER_SERVICE.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-blue-600">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900">Follow Us</h3>
            <div className="mt-3 flex gap-3 text-xl text-gray-500">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a key={label} href={href} aria-label={label} className="hover:text-blue-600">
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright (fixed year: new Date() is not allowed while prerendering in Next.js 16) */}
        <p className="mt-8 border-t border-gray-200 pt-4 text-xs text-gray-500">
          © 2026 SmartShop AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}