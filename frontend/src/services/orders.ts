// Order service (MOCK). It saves orders in localStorage.
// Later, replace the bodies with the Laravel API:
//   createOrder  -> POST /api/orders (with the Idempotency-Key header)
//   getOrders    -> GET  /api/orders
//   cancelOrder  -> POST /api/orders/{id}/cancel
// The pages stay the same.
import { mockProducts } from "@/lib/mock-data";
import { DISCOUNT_CODES, calcTotals, round2 } from "@/lib/pricing";
import type { CreateOrderInput, Order, OrderItem } from "@/types";

const STORAGE_KEY = "smartshop-orders";

// Fake network delay
const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

function readOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeOrders(orders: Order[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    throw new Error("Could not save the order in this browser.");
  }
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  await delay();
  const orders = readOrders();

  // The same idempotency key returns the existing order (no duplicate orders)
  const existing = orders.find((o) => o.idempotency_key === input.idempotency_key);
  if (existing) return existing;

  if (input.items.length === 0) throw new Error("Your order has no items.");

  // The server never trusts prices sent by the browser: it reads them from the catalog.
  // (This mock does not reduce the stock; the real backend must do it in a transaction.)
  const lines = input.items.map(({ product_id, quantity }) => {
    const product = mockProducts.find((p) => p.id === product_id && p.is_active);
    if (!product) throw new Error("A product in your order is no longer available.");
    if (quantity < 1 || quantity > product.stock) {
      throw new Error(`Not enough stock for ${product.name}.`);
    }
    return { product, quantity };
  });

  const percent = input.discount_code ? DISCOUNT_CODES[input.discount_code.toUpperCase()] ?? 0 : 0;
  const totals = calcTotals(
    lines.map((l) => ({ price: l.product.price, old_price: l.product.old_price, quantity: l.quantity })),
    percent
  );

  const items: OrderItem[] = lines.map(({ product, quantity }) => ({
    product_id: product.id,
    name: product.name,
    image_url: product.image_url,
    unit_price: product.price,
    quantity,
    line_total: round2(product.price * quantity),
  }));

  const order: Order = {
    id: orders.length + 1,
    order_number: `SS-${Date.now().toString().slice(-8)}`,
    status: "pending",
    payment_method: input.payment_method,
    // Card and ABA are simulated as paid; cash on delivery is paid at delivery
    payment_status: input.payment_method === "cash_on_delivery" ? "unpaid" : "paid",
    subtotal: totals.subtotal,
    discount: totals.discount,
    delivery_fee: totals.shipping,
    total: totals.total,
    shipping: input.shipping,
    items,
    idempotency_key: input.idempotency_key,
    created_at: new Date().toISOString(),
  };

  writeOrders([...orders, order]);
  return order;
}

// All orders, newest first (used by the order history page)
export async function getOrders(): Promise<Order[]> {
  await delay(300);
  return readOrders().reverse();
}

// Cancel an order. Only a pending order can be cancelled (FR-14).
// The real backend must also give the stock back.
export async function cancelOrder(orderId: number): Promise<Order> {
  await delay(300);
  const orders = readOrders();
  const index = orders.findIndex((o) => o.id === orderId);

  if (index === -1) throw new Error("Order not found.");
  if (orders[index].status !== "pending") throw new Error("Only a pending order can be cancelled.");

  const updated: Order = { ...orders[index], status: "cancelled" };
  orders[index] = updated;
  writeOrders(orders);
  return updated;
}