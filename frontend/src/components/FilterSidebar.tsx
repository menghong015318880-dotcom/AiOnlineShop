"use client";
import { useState } from "react";
import { FaRegStar, FaStar } from "react-icons/fa";
import { FiChevronDown, FiFilter } from "react-icons/fi";
import type { BrandOption, Category, RatingOption } from "@/types";

interface FilterSidebarProps {
  categories: Category[];
  brands: BrandOption[];
  ratings: RatingOption[];
  selectedCategoryId: number | null; // null = all categories
  selectedBrands: string[];
  minRating: number | null;          // null = any rating
  onCategoryChange: (id: number | null) => void;
  onBrandsChange: (brands: string[]) => void;
  onRatingChange: (min: number | null) => void;
  onPriceApply: (maxPrice: number) => void;
}

const VISIBLE_BRANDS = 5; // how many brands to show before "Show more"

// Five stars, "value" of them are filled (yellow)
function Stars({ value }: { value: number }) {
  return (
    <span className="flex text-yellow-400">
      {[1, 2, 3, 4, 5].map((i) => (i <= value ? <FaStar key={i} /> : <FaRegStar key={i} />))}
    </span>
  );
}

// Filters: category, price range, brand and rating.
// On phones the filters are collapsed behind a button; from md up they are always visible.
export default function FilterSidebar({
  categories,
  brands,
  ratings,
  selectedCategoryId,
  selectedBrands,
  minRating,
  onCategoryChange,
  onBrandsChange,
  onRatingChange,
  onPriceApply,
}: FilterSidebarProps) {
  // The slider value is local; the filter only changes when "Apply" is clicked
  const [price, setPrice] = useState(500);
  const [open, setOpen] = useState(false);              // phones only
  const [showAllBrands, setShowAllBrands] = useState(false);

  const visibleBrands = showAllBrands ? brands : brands.slice(0, VISIBLE_BRANDS);

  // Add the brand if it is not selected, remove it if it is
  const toggleBrand = (name: string) =>
    onBrandsChange(
      selectedBrands.includes(name)
        ? selectedBrands.filter((b) => b !== name)
        : [...selectedBrands, name]
    );

  return (
    // id="categories" lets the "Categories" link in the header scroll here
    <aside
      id="categories"
      className="h-fit scroll-mt-20 rounded-xl border border-gray-200 bg-white p-4 md:sticky md:top-20"
    >
      {/* Toggle button: phones only */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between font-semibold text-gray-900 md:hidden"
      >
        <span className="flex items-center gap-2">
          <FiFilter /> Filter Products
        </span>
        <FiChevronDown className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Title: tablet and desktop only */}
      <h2 className="hidden font-semibold text-gray-900 md:block">Filter Products</h2>

      {/* Filter content: hidden on phones until opened, always shown from md up */}
      <div className={`${open ? "block" : "hidden"} md:block`}>
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

        {/* Brand: several can be selected, with the number of products */}
        <h3 className="mt-6 text-sm font-medium text-gray-900">Brand</h3>
        <ul className="mt-2 space-y-2 text-sm text-gray-700">
          {visibleBrands.map((b) => (
            <li key={b.name}>
              <label className="flex cursor-pointer items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(b.name)}
                    onChange={() => toggleBrand(b.name)}
                  />
                  {b.name}
                </span>
                <span className="text-xs text-gray-400">({b.count})</span>
              </label>
            </li>
          ))}
        </ul>
        {brands.length > VISIBLE_BRANDS && (
          <button
            onClick={() => setShowAllBrands((v) => !v)}
            className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            {showAllBrands ? "Show less" : "Show more"}
            <FiChevronDown className={showAllBrands ? "rotate-180" : ""} />
          </button>
        )}

        {/* Rating: one option at a time ("4 & Up" means 4 stars or more) */}
        <h3 className="mt-6 text-sm font-medium text-gray-900">Rating</h3>
        <ul className="mt-2 space-y-2 text-sm text-gray-700">
          <li>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="rating"
                checked={minRating === null}
                onChange={() => onRatingChange(null)}
              />
              All ratings
            </label>
          </li>
          {ratings.map((r) => (
            <li key={r.min}>
              <label className="flex cursor-pointer items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === r.min}
                    onChange={() => onRatingChange(r.min)}
                  />
                  <Stars value={r.min} />
                  <span className="text-xs">& Up</span>
                </span>
                <span className="text-xs text-gray-400">({r.count})</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}