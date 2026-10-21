// Shared types for the frontend.
// They follow the API contract, so the real Laravel API can return the same shapes later.

export interface Category {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;        // decimal from the server (e.g. 49.99)
  stock: number;        // 0 means out of stock
  image_url: string;
  is_active: boolean;
  brand: string;        // NEW: brand name, e.g. "Sony"
  rating: number;       // NEW: average rating, 0 to 5
  review_count: number; // NEW: number of reviews
}

// Query options for the product list (search, filter, pagination)
export interface ProductQuery {
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];    // NEW: selected brands (any of them)
  minRating?: number;   // NEW: show products with rating >= this value
  page?: number;
  perPage?: number;
}

// Standard shape for paginated lists, like Laravel's paginator
export interface Paginated<T> {
  data: T[];
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
}

// NEW: options shown in the filter sidebar, with the number of products for each
export interface BrandOption {
  name: string;
  count: number;
}

export interface RatingOption {
  min: number;   // 4 means "4 & Up"
  count: number;
}

export interface FilterOptions {
  brands: BrandOption[];
  ratings: RatingOption[];
}