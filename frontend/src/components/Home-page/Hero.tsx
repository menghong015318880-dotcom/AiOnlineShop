"use client";
import { useState } from "react";
import Image from "next/image";
import { FiHeadphones, FiSearch, FiShield, FiTruck } from "react-icons/fi";

interface HeroProps {
  onSearch: (text: string) => void; // called when the user submits the search
}

// The three highlights under the search box
const FEATURES = [
  { Icon: FiTruck, title: "Free Shipping", text: "Orders over $50" },
  { Icon: FiShield, title: "Secure Payment", text: "Safe checkout" },
  { Icon: FiHeadphones, title: "24/7 Support", text: "Here to help" },
];

// Hero section: the banner image fills the whole section as a background.
export default function Hero({ onSearch }: HeroProps) {
  const [text, setText] = useState("");

  return (
    // "relative" is required so the background image can fill this section.
    <section className="relative min-h-[320px] overflow-hidden rounded-2xl bg-blue-50">
      {/* Background banner image (public/assets/images/banner.png).
          Phone: keep the right side of the image. Tablet/desktop: center it. */}
      <Image
        src="/assets/images/banner.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[75%_center] md:object-center"
      />

      {/* Overlay for phones only, so the text is readable on a small screen.
          md:hidden = no overlay and no gradient on tablet and desktop. */}
      <div className="absolute inset-0 bg-white/80 md:hidden" />

      {/* Content sits above the image (relative + z-10) */}
      <div className="relative z-10 px-4 py-8 sm:px-6 md:px-12 md:py-10">
        <div className="max-w-xl md:max-w-[48%]">
          <p className="text-sm text-gray-700">Smart Shopping with AI</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
            Discover Amazing Products at the Best Prices
          </h1>
          <p className="mt-3 text-sm text-gray-700">
            Shop smarter with AI recommendations and great deals.
          </p>

          {/* Search form: Enter key or the button both submit.
              max-w-md keeps the box from getting too wide. */}
          <form
            className="mt-5 flex max-w-md overflow-hidden rounded-lg bg-white shadow"
            onSubmit={(e) => {
              e.preventDefault();
              onSearch(text.trim());
            }}
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Search for products, brands and more..."
              className="min-w-0 flex-1 px-4 py-2.5 text-sm outline-none"
            />
            {/* Smaller button: px-4 (was px-5) and icon text-lg (was text-xl) */}
            <button
              type="submit"
              aria-label="Search"
              className="flex items-center bg-blue-600 px-4 text-white hover:bg-blue-700"
            >
              <FiSearch className="text-lg" />
            </button>
          </form>

          {/* Highlights with icons: wrap to a new line on small screens */}
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
            {FEATURES.map(({ Icon, title, text: description }) => (
              <div key={title} className="flex items-center gap-2">
                <Icon className="text-2xl text-gray-800" />
                <div className="text-xs leading-tight">
                  <p className="font-semibold text-gray-900">{title}</p>
                  <p className="text-gray-600">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}