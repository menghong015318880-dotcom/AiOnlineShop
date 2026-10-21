import Image from "next/image";
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { FiShoppingCart } from "react-icons/fi";
import type { Product } from "@/types";

interface SimilarProductsProps {
  products: Product[];
  onAddToCart: (product: Product) => void; // cart logic comes later
}

// Small product cards on the right side of the detail page.
export default function SimilarProducts({ products, onAddToCart }: SimilarProductsProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Similar Products</h2>
        <Link href="/#products" className="text-xs text-blue-600 hover:underline">
          View All →
        </Link>
      </div>

      {products.length === 0 && <p className="mt-4 text-sm text-gray-500">No similar products.</p>}

      <div className="mt-4 grid grid-cols-2 gap-3">
        {products.map((p) => (
          <div key={p.id} className="flex flex-col rounded-lg border border-gray-200 p-3">
            <Link href={`/products/${p.id}`} className="block">
              <div className="relative aspect-square overflow-hidden rounded-md bg-gray-50">
                <Image
                  src={p.image_url}
                  alt={p.name}
                  fill
                  sizes="(min-width: 1024px) 200px, 40vw"
                  className="object-contain p-2"
                />
              </div>
              <h3 className="mt-2 text-xs font-medium text-gray-900">{p.name}</h3>
            </Link>

            <div className="mt-1 flex items-center gap-1 text-xs text-gray-600">
              <FaStar className="text-yellow-400" />
              {p.rating.toFixed(1)} <span className="text-gray-400">({p.review_count})</span>
            </div>
            <p className="mt-1 text-sm font-bold text-gray-900">${p.price.toFixed(2)}</p>

            <button
              onClick={() => onAddToCart(p)}
              disabled={p.stock <= 0}
              className="mt-2 flex items-center justify-center gap-1 rounded-md bg-blue-600 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <FiShoppingCart /> Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}