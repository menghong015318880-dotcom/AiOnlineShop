import Image from "next/image";
import type { Product } from "@/types";
import { DiVim } from "react-icons/di";

interface ProductCardProps {
  product: Product;
  categoryName?: string;
  onAddToCart: (Product: Product) => void; // cart logic comes later 
}

// One product in the grid.
export default function ProductCard({ product, categoryName, onAddToCart }: ProductCardProps) {
  const outOfStock = product.stock <= 0;

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-3">
      {/* Image area: product.image_url comes the data */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <Image src={product.image_url} alt={product.name} fill className="object-contain p4" />
        {categoryName && (
          <span className="absolute bottom-2 left-2 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
            {categoryName}
          </span>
        )}
      </div>

      <h3 className="mt-3 text-sm font-medium text-gray-900">{product.name}</h3>
      <p className="mt-1 text-lg font-bold text-gray-900">${product.price}.toFixedd(2)</p>

      {/* Stock message (FR-08 do not allow ordering more than the stock) */}
      {outOfStock && <p className="text-xs text-red-500">Out of stock</p>}

      <button
        disabled={outOfStock}
        onClick={() => onAddToCart(product)}
        className="mt-3 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        Add to Cart
      </button>
    </div>
  );
}