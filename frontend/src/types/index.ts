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
  price: number;  // decimal from the server (e.g 49.99)
  stock: number;  // 0 means out of stock
  image_url: string;
  is_active: boolean;
}

// Query options for the product list (search, filter, pagination)
export interface ProductQuery {
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
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