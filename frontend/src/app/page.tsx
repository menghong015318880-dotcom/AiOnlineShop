"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Hero from "@/components/Hero";
import FilterSidebar from "@/components/FilterSidebar";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import { getCategories, getProducts } from "@/services/products";
import type { Category, Paginated, Product } from "@/types";

const PER_PAGE = 8;

// Home page. useSearchParams must be inside <Suspense> in Next.js.
export default function HomePage() {
  return (
    <Suspense fallback={<p className="py-10 text-center text-gray-500">Loading...</p>}>
      <HomeWithSearch />
    </Suspense>
  );
}

// Reads ?search=... from the URL.
// key={search} resets the filters and the page whenever the search text changes.
function HomeWithSearch() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";
  return <HomeContent key={search} search={search} />;
}

function HomeContent({ search }: { search: string }) {
  const router = useRouter();

  // Filter state
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState(500);
  const [page, setPage] = useState(1);

  // Data state
  const [categories, setCategories] = useState<Category[]>([]);
  const [result, setResult] = useState<Paginated<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load categories once
  useEffect(() => {
    getCategories().then(setCategories).catch(() => setError("Cannot load categories"));
  }, []);

  // Reload products whenever a filter or the page changes
  useEffect(() => {
    let cancelled = false; // ignore old responses if filters change quickly
    setLoading(true);
    setError("");

    getProducts({
      search: search || undefined,
      categoryId: categoryId ?? undefined,
      maxPrice,
      page,
      perPage: PER_PAGE,
    })
      .then((data) => !cancelled && setResult(data))
      .catch(() => !cancelled && setError("Cannot load products. Please try again."))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [search, categoryId, maxPrice, page]);

  // Search from the Hero box: put the text in the URL (same as the header search)
  const handleSearch = (text: string) =>
    router.push(text ? `/?search=${encodeURIComponent(text)}` : "/");

  // Changing a filter goes back to page 1
  const handleCategory = (id: number | null) => { setCategoryId(id); setPage(1); };
  const handlePrice = (value: number) => { setMaxPrice(value); setPage(1); };

  // Placeholder until the cart feature exists
  const handleAddToCart = (product: Product) => console.log("Add to cart:", product.id);

  // Find the category name for the badge on each card
  const categoryName = (id: number) => categories.find((c) => c.id === id)?.name;

  return (
    <>
      <Hero onSearch={handleSearch} />

      <div id="products" className="mt-6 grid scroll-mt-20 gap-6 md:grid-cols-[260px_1fr]">
        <FilterSidebar
          categories={categories}
          selectedCategoryId={categoryId}
          onCategoryChange={handleCategory}
          onPriceApply={handlePrice}
        />

        <section>
          {search && (
            <p className="mb-2 text-sm text-gray-600">Results for &quot;{search}&quot;</p>
          )}
          {result && (
            <p className="mb-3 text-sm text-gray-600">
              Showing {result.data.length} of {result.total} products
            </p>
          )}

          {/* The 4 states: loading, error, empty, data */}
          {loading && <p className="py-10 text-center text-gray-500">Loading...</p>}
          {error && <p className="py-10 text-center text-red-500">{error}</p>}
          {!loading && !error && result?.data.length === 0 && (
            <p className="py-10 text-center text-gray-500">No products found.</p>
          )}

          {!loading && !error && result && result.data.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {result.data.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    categoryName={categoryName(p.category_id)}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
              <Pagination page={result.page} lastPage={result.lastPage} onChange={setPage} />
            </>
          )}
        </section>
      </div>
    </>
  );
}