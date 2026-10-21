// Temporary mock data. Delete this file when the real API is connected.
import type { Category, Product } from "@/types";

// Folder of the product images (inside "public"); in the browser the path starts from /assets/...
const IMG = "/assets/images/products";

export const mockCategories: Category[] = [
  { id: 1, name: "Electronics", description: "Gadgets and accessories", is_active: true },
  { id: 2, name: "Fashion", description: "Clothes and shoes", is_active: true },
  { id: 3, name: "Home", description: "Home and kitchen items", is_active: true },
];

export const mockProducts: Product[] = [
  { id: 1, category_id: 1, name: "Wireless Headphones", description: "Bluetooth headphones with 20h battery.", price: 39.9, stock: 15, image_url: `${IMG}/headphones.png`, is_active: true, brand: "Sony", rating: 4.7, review_count: 98 },
  { id: 2, category_id: 1, name: "Phone Charger 20W", description: "Fast charger with USB-C cable.", price: 12.5, stock: 40, image_url: `${IMG}/charger.png`, is_active: true, brand: "Anker", rating: 4.5, review_count: 210 },
  // stock: 0 is on purpose, to test the "out of stock" state
  { id: 3, category_id: 1, name: "Power Bank 10000mAh", description: "Slim power bank for daily use.", price: 24, stock: 0, image_url: `${IMG}/power-bank.png`, is_active: true, brand: "Anker", rating: 4.2, review_count: 64 },
  { id: 4, category_id: 2, name: "Cotton T-Shirt", description: "Soft cotton t-shirt, regular fit.", price: 9.9, stock: 60, image_url: `${IMG}/t-shirt.png`, is_active: true, brand: "Nike", rating: 4.0, review_count: 45 },
  { id: 5, category_id: 2, name: "Running Shoes", description: "Lightweight shoes for running.", price: 45, stock: 8, image_url: `${IMG}/running-shoes.png`, is_active: true, brand: "Nike", rating: 4.6, review_count: 120 },
  { id: 6, category_id: 3, name: "Electric Kettle 1.7L", description: "Stainless steel kettle with auto shut-off.", price: 18.5, stock: 22, image_url: `${IMG}/kettle.png`, is_active: true, brand: "Philips", rating: 4.4, review_count: 87 },
  { id: 7, category_id: 3, name: "Rice Cooker 1.8L", description: "Simple rice cooker with keep-warm mode.", price: 32, stock: 12, image_url: `${IMG}/rice-cooker.png`, is_active: true, brand: "Philips", rating: 3.1, review_count: 52 },
  { id: 8, category_id: 2, name: "Canvas Backpack", description: "Water-resistant backpack, 20L.", price: 21, stock: 30, image_url: `${IMG}/backpack.png`, is_active: true, brand: "Targus", rating: 4.3, review_count: 67 },
];