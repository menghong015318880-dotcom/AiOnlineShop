// Product service: the ONLY place pages use to get products.
// Now it reads mock data. Later, change the body to call the Laravel API
// (GET /api/products) and the pages stay the same.
import { mockCategories, mockProducts } from "@/lib/mock-data";
import type { Category, FilterOptions, Paginated, Product, ProductQuery } from "@/types";

// Fake network delay so we can test loading states
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getProducts(query: ProductQuery = {}): Promise<Paginated<Product>> {
  await delay();

  const { search, categoryId, minPrice, maxPrice, brands, minRating, page = 1, perPage = 8 } = query;

  // Only active products are shown to customers (FR-01)
  let items = mockProducts.filter((p) => p.is_active);

  if (search) {
    const q = search.toLowerCase();
    items = items.filter((p) => p.name.toLowerCase().includes(q));
  }
  if (categoryId) items = items.filter((p) => p.category_id === categoryId);
  if (minPrice !== undefined) items = items.filter((p) => p.price >= minPrice);
  if (maxPrice !== undefined) items = items.filter((p) => p.price <= maxPrice);
  // NEW: a product matches if its brand is one of the selected brands
  if (brands && brands.length > 0) items = items.filter((p) => brands.includes(p.brand));
  // NEW: rating "4 & Up" means rating >= 4
  if (minRating) items = items.filter((p) => p.rating >= minRating);

  // Simple pagination
  const total = items.length;
  const start = (page - 1) * perPage;

  return {
    data: items.slice(start, start + perPage),
    page,
    perPage,
    total,
    lastPage: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getProduct(id: number): Promise<Product | null> {
  await delay(200);
  return mockProducts.find((p) => p.id === id && p.is_active) ?? null;
}

export async function getCategories(): Promise<Category[]> {
  await delay(200);
  return mockCategories.filter((c) => c.is_active);
}

// NEW: brands and rating options with the number of products for each.
// Later this can be one API call, e.g. GET /api/products/filters
export async function getFilterOptions(): Promise<FilterOptions> {
  await delay(200);
  const active = mockProducts.filter((p) => p.is_active);

  // Count products per brand
  const counts = new Map<string, number>();
  active.forEach((p) => counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1));

  // Brands with most products first
  const brands = Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  // "4 & Up", "3 & Up", "2 & Up", "1 & Up"
  const ratings = [4, 3, 2, 1].map((min) => ({
    min,
    count: active.filter((p) => p.rating >= min).length,
  }));

  return { brands, ratings };
}

// NEW: similar products = same category first, then other products if more are needed
export async function getRelatedProducts(
  productId: number,
  categoryId: number,
  limit = 2
): Promise<Product[]> {
  await delay(200);
  const others = mockProducts.filter((p) => p.is_active && p.id !== productId);
  const sameCategory = others.filter((p) => p.category_id === categoryId);
  const rest = others.filter((p) => p.category_id !== categoryId);
  return [...sameCategory, ...rest].slice(0, limit);
}