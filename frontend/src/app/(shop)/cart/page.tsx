"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FiArrowRight, FiHeadphones, FiLock, FiMinus, FiPlus,
  FiShield, FiShoppingBag, FiShoppingCart, FiTrash2, FiTruck,
} from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { FREE_SHIPPING_MIN, SHIPPING_FEE, money } from "@/lib/pricing";


export default function CartPage() {
  const { items, ready, updateQuantity, removeItem, removeMany } = useCart();

  // Items are selected by default. We only remember the ones the user un-checked.
  const [unselected, setUnselected] = useState<number[]>([]);

  const selected = items.filter((i) => !unselected.includes(i.product_id));
  const allSelected = items.length > 0 && selected.length === items.length;

  // ----- Totals (only for selected items) -----
  // "original" uses old_price when it exists; discount = original - price
  const unitOriginal = (i: (typeof items)[number]) =>
    i.old_price && i.old_price > i.price ? i.old_price : i.price;

  const units = selected.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = selected.reduce((sum, i) => sum + unitOriginal(i) * i.quantity, 0);
  const discount = selected.reduce((sum, i) => sum + (unitOriginal(i) - i.price) * i.quantity, 0);
  const afterDiscount = subtotal - discount;
  const shipping = selected.length === 0 || afterDiscount >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
  const total = afterDiscount + shipping;

  // Progress to free shipping
  const progress = Math.min(100, (afterDiscount / FREE_SHIPPING_MIN) * 100);
  const remaining = Math.max(0, FREE_SHIPPING_MIN - afterDiscount);

  // ----- Actions -----
  const toggleOne = (id: number) =>
    setUnselected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleAll = () =>
    setUnselected(allSelected ? items.map((i) => i.product_id) : []);

  const removeSelected = () => removeMany(selected.map((i) => i.product_id));

  // Wait until the saved cart is loaded, so the empty message does not flash
  if (!ready) return <p className="py-20 text-center text-gray-500">Loading...</p>;

  return (
    <div className="py-2">
      {/* Page title */}
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-2xl text-white">
          <FiShoppingCart />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
          <p className="text-sm text-gray-600">Review your items and proceed to checkout</p>
        </div>
      </div>

      {/* Empty cart */}
      {items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-gray-200 bg-white py-16 text-center">
          <FiShoppingBag className="mx-auto text-5xl text-gray-300" />
          <p className="mt-4 text-gray-700">Your cart is empty.</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* ===== Left: items ===== */}
          <section className="rounded-xl border border-gray-200 bg-white">
            {/* Select all / Remove selected */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-gray-900">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-5 w-5 accent-blue-600"
                />
                Select All
              </label>
              <button
                onClick={removeSelected}
                disabled={selected.length === 0}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-500 disabled:opacity-40"
              >
                Remove Selected <FiTrash2 />
              </button>
            </div>

            {/* Item rows */}
            <ul className="divide-y divide-gray-100">
              {items.map((item) => {
                const checked = !unselected.includes(item.product_id);
                const hasDiscount = item.old_price !== undefined && item.old_price > item.price;
                const percent = hasDiscount
                  ? Math.round((1 - item.price / (item.old_price as number)) * 100)
                  : 0;

                return (
                  <li key={item.product_id} className="flex flex-wrap items-center gap-4 p-4">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOne(item.product_id)}
                      aria-label={`Select ${item.name}`}
                      className="h-5 w-5 accent-blue-600"
                    />

                    {/* Image */}
                    <Link
                      href={`/products/${item.product_id}`}
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-50"
                    >
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-contain p-2"
                      />
                    </Link>

                    {/* Name and stock */}
                    <div className="min-w-[140px] flex-1">
                      <Link
                        href={`/products/${item.product_id}`}
                        className="font-medium text-gray-900 hover:text-blue-600"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-gray-500">{item.brand}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-600">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        {item.stock <= 5 ? `Only ${item.stock} left` : "In Stock"}
                      </p>
                    </div>

                    {/* Unit price, old price and discount */}
                    <div className="w-28">
                      <p className="font-semibold text-gray-900">{money(item.price)}</p>
                      {hasDiscount && (
                        <p className="mt-0.5 flex items-center gap-2 text-xs">
                          <span className="text-gray-400 line-through">
                            {money(item.old_price as number)}
                          </span>
                          <span className="rounded-full bg-red-100 px-1.5 py-0.5 font-semibold text-red-600">
                            -{percent}%
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Quantity: 1 up to the stock */}
                    <div className="flex items-center rounded-lg border border-gray-300">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                        className="p-2.5 text-gray-600 hover:text-blue-600 disabled:opacity-40"
                      >
                        <FiMinus />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        aria-label="Increase quantity"
                        className="p-2.5 text-gray-600 hover:text-blue-600 disabled:opacity-40"
                      >
                        <FiPlus />
                      </button>
                    </div>

                    {/* Line total */}
                    <p className="w-24 text-right font-semibold text-gray-900">
                      {money(item.price * item.quantity)}
                    </p>

                    {/* Delete */}
                    <button
                      onClick={() => removeItem(item.product_id)}
                      aria-label={`Remove ${item.name}`}
                      className="p-2 text-gray-500 hover:text-red-500"
                    >
                      <FiTrash2 className="text-lg" />
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Free shipping progress */}
            <div className="m-4 flex flex-wrap items-center gap-4 rounded-xl bg-blue-50 p-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl text-blue-600">
                <FiTruck />
              </span>
              <div className="min-w-[180px] flex-1 text-sm">
                <p className="font-medium text-gray-900">
                  Free shipping on orders over ${FREE_SHIPPING_MIN}
                </p>
                <p className="text-xs text-gray-600">
                  {remaining > 0
                    ? `You're ${money(remaining)} away from free shipping!`
                    : "You've got free shipping!"}
                </p>
              </div>
              <div className="w-full sm:w-64">
                <div className="h-2 overflow-hidden rounded-full bg-blue-100">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-1 text-right text-xs text-gray-500">
                  {money(Math.min(afterDiscount, FREE_SHIPPING_MIN))} / {money(FREE_SHIPPING_MIN)}
                </p>
              </div>
            </div>
          </section>

          {/* ===== Right: order summary ===== */}
          <aside className="space-y-4 lg:sticky lg:top-20">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

              <dl className="mt-4 space-y-3 text-sm text-gray-700">
                <div className="flex justify-between">
                  <dt>Subtotal ({units} {units === 1 ? "item" : "items"})</dt>
                  <dd>{money(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Discount</dt>
                  <dd className="text-green-600">-{money(discount)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Shipping</dt>
                  <dd>{shipping === 0 ? "Free" : money(shipping)}</dd>
                </div>
              </dl>

              <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">{money(total)}</span>
              </div>

              {/* The /checkout page is built next. Until then this link shows a 404. */}
              {selected.length > 0 ? (
                <Link
                  href={`/checkout?items=${selected.map((i) => i.product_id).join(",")}`}
                  className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <FiLock /> Proceed to Checkout <FiArrowRight />
                </Link>
              ) : (
                <button
                  disabled
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-300 py-3 text-sm font-medium text-white"
                >
                  <FiLock /> Select items to checkout
                </button>
              )}

              <p className="my-3 text-center text-xs text-gray-400">or</p>

              <Link
                href="/"
                className="flex items-center justify-center rounded-lg border border-gray-300 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Continue Shopping
              </Link>
            </div>

            {/* Reassurance card */}
            <ul className="space-y-4 rounded-xl border border-gray-200 bg-blue-50/50 p-5">
              {[
                { Icon: FiShield, title: "Secure Payment", text: "Your information is safe with us" },
                { Icon: FiTruck, title: "Fast & Reliable Delivery", text: "We deliver to your doorstep" },
                { Icon: FiHeadphones, title: "24/7 Customer Support", text: "We're here to help" },
              ].map(({ Icon, title, text }) => (
                <li key={title} className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xl text-blue-600">
                    <Icon />
                  </span>
                  <div className="text-sm leading-tight">
                    <p className="font-medium text-gray-900">{title}</p>
                    <p className="text-xs text-gray-500">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}
    </div>
  );
}