import Image from "next/image";
import { FaStar } from "react-icons/fa";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  categoryName?: string;
  onAddToCart: (product: Product) => void; // cart logic comes later
}

// One product in the grid.
export default function ProductCard({ product, categoryName, onAddToCart }: ProductCardProps) {
  const outOfStock = product.stock <= 0;

  return (
    // overflow-hidden clips the image to the rounded corners of the card
    <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Image area. object-contain shows the whole image (nothing is cropped).
          Change to object-cover if you want the image to fill the area. */}
      <div className="relative aspect-square w-full bg-white">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw"
          className="object-contain"
        />
        {categoryName && (
          <span className="absolute bottom-2 left-2 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
            {categoryName}
          </span>
        )}
      </div>

      {/* Text and button keep their own padding */}
      <div className="flex flex-1 flex-col p-3">
        <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>

        {/* NEW: star, average rating and number of reviews */}
        <div className="mt-1 flex items-center gap-1 text-xs text-gray-600">
          <FaStar className="text-yellow-400" />
          <span className="font-medium">{product.rating.toFixed(1)}</span>
          <span className="text-gray-400">({product.review_count})</span>
        </div>

        <p className="mt-1 text-lg font-bold text-gray-900">${product.price.toFixed(2)}</p>

        {/* Stock message (FR-08: do not allow ordering more than the stock) */}
        {outOfStock && <p className="text-xs text-red-500">Out of stock</p>}

        {/* mt-auto pushes the button to the bottom so all buttons line up */}
        <button
          disabled={outOfStock}
          onClick={() => onAddToCart(product)}
          className="mt-3 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 md:mt-auto"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}