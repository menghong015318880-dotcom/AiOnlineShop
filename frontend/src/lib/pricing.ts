// Price rules shared by the cart, the checkout and the (mock) order service.

export const FREE_SHIPPING_MIN = 50; // free shipping when the total after discount reaches $50
export const SHIPPING_FEE = 3;       // TEMPORARY: confirm the real delivery fee rule

// DEMO discount codes (percent). The real check must be done by the Laravel backend.
export const DISCOUNT_CODES: Record<string, number> = {
  WELCOME10: 10,
};

// Format a number like $1,298.00
export const money = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Round to cents, to avoid values like 12.300000000000001
export const round2 = (n: number) => Math.round(n * 100) / 100;

export interface PricedLine {
  price: number;
  old_price?: number;
  quantity: number;
}

export interface Totals {
  units: number;         // total number of units
  subtotal: number;      // sum of the original prices (old_price when it exists)
  discount: number;      // product discounts + discount code
  afterDiscount: number;
  shipping: number;
  total: number;
}

// Calculate all the amounts of an order
export function calcTotals(lines: PricedLine[], couponPercent = 0): Totals {
  const original = (l: PricedLine) => (l.old_price && l.old_price > l.price ? l.old_price : l.price);

  const units = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotal = round2(lines.reduce((sum, l) => sum + original(l) * l.quantity, 0));
  const productDiscount = round2(lines.reduce((sum, l) => sum + (original(l) - l.price) * l.quantity, 0));
  const afterProduct = subtotal - productDiscount;

  // The discount code is applied on the price after product discounts
  const couponDiscount = round2((afterProduct * couponPercent) / 100);
  const discount = round2(productDiscount + couponDiscount);
  const afterDiscount = round2(subtotal - discount);

  const shipping = lines.length === 0 || afterDiscount >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
  const total = round2(afterDiscount + shipping);

  return { units, subtotal, discount, afterDiscount, shipping, total };
}