"use client";
import { useState } from "react";
import type { Category } from "@/types";

interface FilterSidebarProps {
  categories: Category[];
  selectedCategoryId: number | null; // null = all categories
  onCategoryChange: (id: number | null) => void;
  onPriceApply: (maxPrice: number) => void;
}

// Left sidebar: category filter and price range.
export default function FilterSidebar({
  categories,
  selectedCategoryId,
  onCategoryChange,
  onPriceApply,
}: FilterSidebarProps) {
  // The slider value is local; the filter only changes when "Apply" is clicked
  const [price, setPrice] = useState(500);

  return (
    // id="categories" lets the "Categories" link in the header scroll here
    <aside id="categories" className="h-fit scroll-mt-20 rounded-xl border border-gray-200 bg-white p-4">
      <h2 className="font-semibold text-gray-900">Filter Products</h2>

      {/* Categories: one selected at a time */}
      <h3 className="mt-4 text-sm font-medium text-gray-900">Categories</h3>
      <ul className="mt-2 space-y-2 text-sm text-gray-700">
        <li>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="category"
              checked={selectedCategoryId === null}
              onChange={() => onCategoryChange(null)}
            />
            All Categories
          </label>
        </li>
        {categories.map((c) => (
          <li key={c.id}>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="category"
                checked={selectedCategoryId === c.id}
                onChange={() => onCategoryChange(c.id)}
              />
              {c.name}
            </label>
          </li>
        ))}
      </ul>

      {/* Price range: from 0 up to the selected maximum */}
      <h3 className="mt-6 text-sm font-medium text-gray-900">Price Range</h3>
      <input
        type="range"
        min={0}
        max={500}
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        className="mt-2 w-full"
      />
      <div className="mt-1 flex items-center justify-between text-sm text-gray-700">
        <span>$0 - ${price}</span>
        <button
          onClick={() => onPriceApply(price)}
          className="rounded border border-blue-600 px-3 py-1 text-blue-600 hover:bg-blue-50"
        >
          Apply
        </button>
      </div>
    </aside>
  );
}