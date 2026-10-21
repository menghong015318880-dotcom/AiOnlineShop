"use client";
import { useState } from "react";
import Image from "next/image";
import { FiCheck } from "react-icons/fi";
import Stars from "@/components/Product-detail/Stars";
import type { Product } from "@/types";

type TabKey = "description" | "specifications" | "reviews";

interface ProductTabsProps {
  product: Product;
  categoryName?: string;
}

// Tabs under the product: Description, Specifications, Reviews.
export default function ProductTabs({ product, categoryName }: ProductTabsProps) {
  const [tab, setTab] = useState<TabKey>("description");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "description", label: "Description" },
    { key: "specifications", label: "Specifications" },
    { key: "reviews", label: `Reviews (${product.review_count})` },
  ];

  // Rows of the specifications table (only data we really have)
  const specs: [string, string][] = [
    ["Brand", product.brand],
    ["Category", categoryName ?? "-"],
    ["Availability", product.stock > 0 ? `${product.stock} in stock` : "Out of stock"],
    ["Rating", `${product.rating.toFixed(1)} / 5`],
  ];

  // Image for the Description tab: the second gallery image if it exists,
  // otherwise the main product image
  const descriptionImage = product.images?.[1] ?? product.image_url;
  const features = product.features ?? [];

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Tab buttons */}
      <div className="flex gap-6 overflow-x-auto border-b border-gray-200 px-5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap border-b-2 py-4 text-sm font-medium ${
              tab === t.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-700 hover:text-blue-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-5 text-sm text-gray-700">
        {tab === "description" && (
          // Phone: text then image (one column). From md up: text left, image right.
          <div className="grid items-start gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-gray-900">
                {features.length > 0 ? "Key Features" : "About this product"}
              </h3>
              <p className="mt-3 leading-relaxed">{product.description}</p>

              {/* Key Features checklist (only when the product has features) */}
              {features.length > 0 && (
                <ul className="mt-4 space-y-3">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-blue-600 text-xs text-white">
                        <FiCheck />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Description image: object-contain shows the whole image.
                Change to object-cover if you want it to fill the box. */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-50">
              <Image
                src={descriptionImage}
                alt={product.name}
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-contain p-4"
              />
            </div>
          </div>
        )}

        {tab === "specifications" && (
          <table className="w-full max-w-md text-left">
            <tbody>
              {specs.map(([label, value]) => (
                <tr key={label} className="border-b border-gray-100 last:border-b-0">
                  <th className="w-1/3 py-2 pr-4 font-medium text-gray-900">{label}</th>
                  <td className="py-2">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "reviews" && (
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-900">{product.rating.toFixed(1)}</span>
              <div>
                <Stars value={product.rating} />
                <p className="mt-1 text-xs text-gray-500">{product.review_count} reviews</p>
              </div>
            </div>
            {/* The real review list is not part of the MVP yet */}
            <p className="mt-4 text-gray-500">Customer reviews will be shown here later.</p>
          </div>
        )}
      </div>
    </div>
  );
}