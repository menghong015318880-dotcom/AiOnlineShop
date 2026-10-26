import type { Order, OrderStatus } from "@/types";

// The normal life of an order. "confirmed" is shown as "Processing".
const FLOW: { key: OrderStatus; label: string }[] = [
  { key: "pending", label: "Order Placed" },
  { key: "confirmed", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

export interface Step {
  key: OrderStatus;
  label: string;
  reached: boolean;  // the order got to this step
  current: boolean;  // this is the latest step
  date?: string;     // ISO date, when we know it
  cancelled?: boolean;
}

// when did the order reach a status? Older orders have no history,
// but we always know when the order was placed.
function dateOf(order: Order, status: OrderStatus): string | undefined {
  const found = order.status_history?.find((e) => e.status === status);
  if (found) return found.at;
  return status === "pending" ? order.created_at : undefined;
}

// Build the steps of an order for a progress list
export function buildSteps(order: Order): Step[] {
  if (order.status === "cancelled") {
    return [
      { key: "pending", label: "Order Placed", reached: true, current: false, date: dateOf(order, "pending") },
      { key: "cancelled", label: "Cancelled", reached: true, current: true, date: dateOf(order, "cancelled"), cancelled: true },
    ];
  }
  const index = FLOW.findIndex((s) => s.key === order.status);
  return FLOW.map((s, i) => ({
    key: s.key,
    label: s.label,
    reached: i <= index,
    current: i === index,
    date: dateOf(order, s.key),
  }));
}