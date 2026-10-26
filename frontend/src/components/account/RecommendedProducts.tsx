"use client";
import Image from "next/image";
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { FiShoppingCart } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { money } from "@/lib/pricing";
import type { Product } from "@/types";

// "Recommended for You": the 5 best rated products that are in stock.
// (A real recommendation based on the customer's orders can come later.)
export default function RecommendedProducts({ products }: { products: Product[] }) {
  const { addItem } = useCart();

  const picks = products
    .filter((p) => p.stock > 0)
    .sort((a, b) => b.rating - a.rating || b.review_count - a.review_count)
    .slice(0, 5);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900">Recommended for You</h2>
        <Link href="/#products" className="text-xs font-medium text-blue-600 hover:underline">
          View All →
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {picks.map((p) => (
          <div key={p.id} className="flex flex-col rounded-lg border border-gray-200 p-3">
            <Link href={`/products/${p.id}`} className="block">
              <span className="relative block aspect-square overflow-hidden rounded-md bg-gray-50">
                <Image src={p.image_url} alt={p.name} fill sizes="(min-width: 1280px) 12vw, 40vw" className="object-contain p-2" />
              </span>
              <span className="mt-2 block truncate text-sm font-medium text-gray-900">{p.name}</span>
            </Link>

            <span className="mt-1 flex items-center gap-1 text-xs text-gray-600">
              <FaStar className="text-yellow-400" />
              {p.rating.toFixed(1)} <span className="text-gray-400">({p.review_count})</span>
            </span>

            <div className="mt-2 flex items-center justify-between">
              <span className="font-bold text-gray-900">{money(p.price)}</span>
              <button
                onClick={() => addItem(p, 1)}
                aria-label={`Add ${p.name} to cart`}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
              >
                <FiShoppingCart />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}