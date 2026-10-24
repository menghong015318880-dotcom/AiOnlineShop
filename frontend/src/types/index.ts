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
  brand: string;        // brand name, e.g. "Sony"
  rating: number;       // average rating, 0 to 5
  review_count: number; // number of reviews
  old_price?: number;   // NEW: price before discount (optional)
  images?: string[];    // NEW: extra gallery images (optional, falls back to image_url)
  features?: string[];
}

// Query options for the product list (search, filter, pagination)
export interface ProductQuery {
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];    // selected brands (any of them)
  minRating?: number;   // show products with rating >= this value
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

// Options shown in the filter sidebar, with the number of products for each
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

// An item in the cart. It keeps a small copy of the product, so the cart page
// can show it without loading the product again.
export interface CartItem {
  product_id: number;
  name: string;
  brand: string;
  price: number;
  old_price?: number;

  image_url: string;
  stock: number; // used to limit the quantity (FR-08)
  quantity: number;
}

// ----- Checkout and orders -----
export type PaymentMethod = "card" | "aba" | "cash_on_delivery";
export type PaymentStatus = "unpaid" | "paid";
export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

// Delivery information typed by the customer
export interface ShippingInfo {
  full_name: string;
  phone: string;
  email: string; // optional
  address: string;
  province: string;
  district: string;
  commune: string;
}

export interface OrderItem {
  product_id: number;
  name: string;
  image_url: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface Order {
  id: number;
  order_number: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total: number;
  shipping: ShippingInfo;
  items: OrderItem[];
  idempotency_key: string;
  created_at: string;
}

// What the browser sends to create an order.
// Only product ids and qunatities: the SERVER calculates every price and the total.
export interface CreateOrderInput {
  items: { product_id: number; quantity: number }[];
  shipping: ShippingInfo;
  payment_method: PaymentMethod;
  discount_code?: string;
  idempotency_key: string; // same key = same order (protects against double clicks)
}

