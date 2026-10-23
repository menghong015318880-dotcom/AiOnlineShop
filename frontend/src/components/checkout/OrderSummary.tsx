import Image from "next/image";
import { FiShield, FiShoppingCart, FiTag, FiTrash2 } from "react-icons/fi";
import { money, type Totals } from "@/lib/pricing";
import type { CartItem } from "@/types";

interface OrderSummaryProps {
  items: CartItem[];
  totals: Totals;
  onQuantityChange: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
  codeText: string;
  onCodeChange: (text: string) => void;
  onApplyCode: () => void;
  codeMessage: string;
  codeApplied: boolean;
}

// Right column of the checkout: items, discount code and totals.
export default function OrderSummary({
  items,
  totals,
  onQuantityChange,
  onRemove,
  codeText,
  onCodeChange,
  onApplyCode,
  codeMessage,
  codeApplied,
}: OrderSummaryProps) {
  return (
    <aside className="rounded-xl border border-gray-200 bg-white p-5 lg:sticky lg:top-20">
      <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
        <FiShoppingCart className="text-blue-600" /> Order Summary
      </h2>

      {/* Items */}
      <ul className="mt-4 divide-y divide-gray-100">
        {items.map((item) => {
          // Quantity choices: 1 up to 10 (or the stock, if it is lower)
          const maxOption = Math.max(Math.min(item.stock, 10), item.quantity);

          return (
            <li key={item.product_id} className="flex items-center gap-3 py-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                <Image src={item.image_url} alt={item.name} fill sizes="64px" className="object-contain p-1" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">{item.brand}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="h-2 w-2 rounded-full bg-green-500" /> In Stock
                </p>
              </div>

              <select
                value={item.quantity}
                onChange={(e) => onQuantityChange(item.product_id, Number(e.target.value))}
                aria-label={`Quantity of ${item.name}`}
                className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm"
              >
                {Array.from({ length: maxOption }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>

              <p className="w-20 text-right text-sm font-semibold text-gray-900">
                {money(item.price * item.quantity)}
              </p>

              <button
                onClick={() => onRemove(item.product_id)}
                aria-label={`Remove ${item.name}`}
                className="p-1.5 text-gray-400 hover:text-red-500"
              >
                <FiTrash2 />
              </button>
            </li>
          );
        })}
      </ul>

      {/* Discount code */}
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onApplyCode();
        }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-gray-300 px-3">
          <FiTag className="text-gray-400" />
          <input
            value={codeText}
            onChange={(e) => onCodeChange(e.target.value)}
            placeholder="Enter discount code"
            className="w-full min-w-0 py-2.5 text-sm outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Apply
        </button>
      </form>
      {codeMessage && (
        <p className={`mt-1 text-xs ${codeApplied ? "text-green-600" : "text-red-500"}`}>{codeMessage}</p>
      )}

      {/* Totals */}
      <dl className="mt-4 space-y-2 text-sm text-gray-700">
        <div className="flex justify-between">
          <dt>Subtotal ({totals.units} {totals.units === 1 ? "item" : "items"})</dt>
          <dd>{money(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Discount</dt>
          <dd className="text-green-600">-{money(totals.discount)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Shipping</dt>
          <dd>{totals.shipping === 0 ? "Free" : money(totals.shipping)}</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
        <span className="text-lg font-bold text-gray-900">Total</span>
        <span className="text-2xl font-bold text-gray-900">{money(totals.total)}</span>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-lg bg-blue-50 p-3 text-xs text-gray-600">
        <FiShield className="mt-0.5 shrink-0 text-lg text-blue-600" />
        <p>
          <span className="block font-medium text-blue-700">Your payment information is secure</span>
          We never store your card details.
        </p>
      </div>
    </aside>
  );
}