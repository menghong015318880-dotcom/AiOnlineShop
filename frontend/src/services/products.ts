// Product service: the ONLY place pages use to get products.
// Now it reads mock data. Later, change the body to call the Laravel API
// (GET /api/products) and the pages stay the same.
import { mockCategories, mockProducts } from "@/lib/mock-data";
import type { Category, Paginated, Product, ProductQuery } from "@/types";

// Fake network delay so we can test loading states
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getProducts(query: ProductQuery = {}): Promise<Paginated<Product>> {
  await delay();

  const { search, categoryId, minPrice, maxPrice, page = 1, perPage = 8 } = query;

  // Only active products are shown to customers (FR-01)
  let items = mockProducts.filter((p) => p.is_active);

  if (search) {
    const q = search.toLowerCase();
    items = items.filter((p) => p.name.toLowerCase().includes(q));
  }
  if (categoryId) items = items.filter((p) => p.category_id === categoryId);
  if (minPrice !== undefined) items = items.filter((p) => p.price >= minPrice);
  if (maxPrice !== undefined) items = items.filter((p) => p.price <= maxPrice);

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