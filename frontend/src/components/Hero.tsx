"use client";

import { useState } from "react";
import Image from "next/image";
import {
  FiHeadphones,
  FiSearch,
  FiShield,
  FiTruck,
} from "react-icons/fi";

interface HeroProps {
  onSearch: (text: string) => void;
}

const FEATURES = [
  { Icon: FiTruck, title: "Free Shipping", text: "Orders over $50" },
  { Icon: FiShield, title: "Secure Payment", text: "Safe checkout" },
  { Icon: FiHeadphones, title: "24/7 Support", text: "Here to help" },
];

export default function Hero({ onSearch }: HeroProps) {
  const [text, setText] = useState("");

  return (
    <section className="relative min-h-[300px] overflow-hidden rounded-2xl">
      {/* Background image */}
      <Image
        src="/assets/images/banner.png"
        alt="Online shopping banner"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Background overlay */}
      <div className="absolute inset-0" />

      {/* Hero content */}
      <div className="relative z-10 px-8 py-6 md:px-12 md:py-8">
        <div className="max-w-lg">
          <p className="text-sm text-gray-700">
            Smart Shopping with AI
          </p>

          <h1 className="mt-2 text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
            Discover Amazing Products at the Best Prices
          </h1>

          <p className="mt-3 text-sm text-gray-700">
            Shop smarter with AI recommendations and great deals.
          </p>

          {/* Search form */}
          <form
            className="mt-5 flex max-w-sm overflow-hidden rounded-lg bg-white shadow"
            onSubmit={(e) => {
              e.preventDefault();
              onSearch(text.trim());
            }}
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="min-w-0 flex-1 px-4 py-3 text-sm outline-none"
            />

            <button
              type="submit"
              aria-label="Search"
              className="flex items-center justify-center bg-blue-600 px-5 text-white hover:bg-blue-700"
            >
              <FiSearch className="text-xl" />
            </button>
          </form>

          {/* Feature highlights */}
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
            {FEATURES.map(({ Icon, title, text: description }) => (
              <div key={title} className="flex items-center gap-2">
                <Icon className="shrink-0 text-xl text-gray-800" />

                <div className="text-xs leading-tight">
                  <p className="font-semibold text-gray-900">
                    {title}
                  </p>
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
