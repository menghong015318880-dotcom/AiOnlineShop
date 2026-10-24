"use client";
import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FiArrowLeft, FiCheck, FiClock, FiCreditCard, FiDownload,
  FiFileText, FiMapPin, FiShield, FiShoppingBag, FiTruck, FiX,
} from "react-icons/fi";
import StatusBadge from "@/components/orders/StatusBadge";
import { money } from "@/lib/pricing";
import { cancelOrder, getOrder } from "@/services/orders";
import type { Order, OrderStatus, PaymentMethod } from "@/types";

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  card: "Credit / Debit Card",
  aba: "ABA Bank",
  cash_on_delivery: "Cash on Delivery",
};

// The normal life of an order. "confirmed" is shown as "Processing".
const FLOW: { key: OrderStatus; label: string }[] = [
  { key: "pending", label: "Order Placed" },
  { key: "confirmed", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

interface Step {
  key: OrderStatus;
  label: string;
  reached: boolean;    // the order got to this step
  current: boolean;    // this is the latest step
  date?: string;       // ISO date, when we know it
  cancelled?: boolean;
}

// When did the order reach a status? Older orders have no history,
// but we always know when the order was placed.
function dateOf(order: Order, status: OrderStatus): string | undefined {
  const found = order.status_history?.find((e) => e.status === status);
  if (found) return found.at;
  return status === "pending" ? order.created_at : undefined;
}

// Build the steps shown in the stepper and in the timeline
function buildSteps(order: Order): Step[] {
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

// "Oct 14, 2026, 10:24 AM". Only used after the order is loaded in the browser.
function formatDate(iso?: string, withYear = true) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Round icon of a step: green check, red X (cancelled), or grey clock (not reached yet)
function StepIcon({ step }: { step: Step }) {
  const color = step.cancelled
    ? "bg-red-500 text-white"
    : step.reached
    ? "bg-green-500 text-white"
    : "border-2 border-gray-300 bg-white text-gray-400";

  return (
    <span className={`flex h-8 w-8 items-center justify-center rounded-full text-base ${color}`}>
      {step.cancelled ? <FiX /> : step.reached ? <FiCheck /> : <FiClock />}
    </span>
  );
}

// Order detail page. useParams must be inside <Suspense> in Next.js.
export default function OrderDetailPage() {
  return (
    <Suspense fallback={<p className="py-20 text-center text-gray-500">Loading...</p>}>
      <OrderDetailRoute />
    </Suspense>
  );
}

// Reads the id from the URL (/orders/3). key={id} resets the page for another order.
function OrderDetailRoute() {
  const params = useParams<{ id: string }>();
  return <OrderDetail key={params.id} id={Number(params.id)} />;
}

function OrderDetail({ id }: { id: number }) {
  // undefined = loading, null = not found
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getOrder(id)
      .then((o) => !cancelled && setOrder(o))
      .catch(() => !cancelled && setOrder(null));
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (order === undefined) return <p className="py-20 text-center text-gray-500">Loading...</p>;

  if (order === null) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-700">Order not found.</p>
        <Link href="/orders" className="mt-3 inline-block text-blue-600 hover:underline">
          Back to Order History
        </Link>
      </div>
    );
  }

  const steps = buildSteps(order);
  const units = order.items.reduce((sum, i) => sum + i.quantity, 0);

  // A customer can cancel only while the order is pending (FR-14)
  const handleCancel = async () => {
    if (!window.confirm(`Cancel order ${order.order_number}?`)) return;
    setCancelling(true);
    try {
      setOrder(await cancelOrder(order.id));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Could not cancel the order.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="py-2">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* ===== Left column ===== */}
        <div className="space-y-6">
          {/* Header and horizontal stepper */}
          <section className="rounded-xl border border-gray-200 bg-white">
            <div className="p-5">
              <Link
                href="/orders"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 print:hidden"
              >
                <FiArrowLeft /> Back to Order History
              </Link>

              <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl text-blue-600">
                    <FiFileText />
                  </span>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Order Detail</h1>
                    <p className="mt-1 flex flex-wrap items-center gap-2 font-semibold text-gray-900">
                      Order #{order.order_number} <StatusBadge status={order.status} />
                    </p>
                    <p className="mt-1 text-xs text-gray-500">Placed on {formatDate(order.created_at)}</p>
                  </div>
                </div>

                <div className="flex gap-3 print:hidden">
                  {/* Download Invoice: opens the print window, where you can "Save as PDF" */}
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                  >
                    <FiDownload /> Download Invoice
                  </button>
                  {/* Track Order: scrolls to the timeline */}
                  <a
                    href="#tracking"
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <FiTruck /> Track Order
                  </a>
                </div>
              </div>
            </div>

            {/* Horizontal stepper */}
            <ol
              className="grid border-t border-gray-200 px-5 py-6"
              style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
            >
              {steps.map((step, i) => (
                <li key={step.key} className="relative flex flex-col items-center text-center">
                  {/* Line from the previous step to this one */}
                  {i > 0 && (
                    <span
                      className={`absolute left-[-50%] top-4 h-0.5 w-full ${
                        step.cancelled ? "bg-red-300" : step.reached ? "bg-green-400" : "bg-gray-200"
                      }`}
                    />
                  )}
                  <span className="relative z-10"><StepIcon step={step} /></span>
                  <span className="mt-2 text-sm font-medium text-gray-900">{step.label}</span>
                  <span className="text-xs text-gray-500">
                    {step.reached ? formatDate(step.date, false) : "—"}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {/* Items */}
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-lg font-bold text-gray-900">Items in Order ({units})</h2>

            <ul className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-200">
              {order.items.map((item) => (
                <li key={item.product_id} className="flex items-center gap-4 p-4">
                  <Link
                    href={`/products/${item.product_id}`}
                    className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-50"
                  >
                    <Image src={item.image_url} alt={item.name} fill sizes="64px" className="object-contain p-1.5" />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.product_id}`}
                      className="font-medium text-gray-900 hover:text-blue-600"
                    >
                      {item.name}
                    </Link>
                    {item.quantity > 1 && (
                      <p className="text-xs text-gray-500">{money(item.unit_price)} each</p>
                    )}
                  </div>

                  <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                  <span className="w-24 text-right font-semibold text-gray-900">{money(item.line_total)}</span>
                </li>
              ))}
            </ul>

            {/* Address, shipping method and payment */}
            <div className="mt-5 grid gap-5 rounded-xl border border-gray-200 p-4 text-sm text-gray-700 md:grid-cols-3">
              <div className="flex gap-3">
                <FiMapPin className="mt-0.5 shrink-0 text-xl text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Shipping Address</h3>
                  <p className="mt-2 font-medium text-gray-900">{order.shipping.full_name}</p>
                  <p>{order.shipping.address}</p>
                  <p>{order.shipping.commune}, {order.shipping.district}, {order.shipping.province}</p>
                  <p className="mt-1">{order.shipping.phone}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <FiTruck className="mt-0.5 shrink-0 text-xl text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Shipping Method</h3>
                  <p className="mt-2 font-medium text-gray-900">Standard Shipping</p>
                  {/* PLACEHOLDER text: confirm the real delivery time */}
                  <p className="text-xs text-gray-500">3 - 5 business days</p>
                  <span className="mt-2 inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                    {order.delivery_fee === 0 ? "Free" : money(order.delivery_fee)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <FiCreditCard className="mt-0.5 shrink-0 text-xl text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Payment Method</h3>
                  <p className="mt-2 font-medium text-gray-900">{PAYMENT_LABEL[order.payment_method]}</p>
                  <p className="text-xs text-gray-500">
                    {order.payment_status === "paid" ? "Paid" : "Pay on delivery"}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ===== Right column ===== */}
        <aside className="space-y-6">
          {/* Order summary */}
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <FiFileText className="text-blue-600" /> Order Summary
            </h2>

            <dl className="mt-4 space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <dt>Subtotal ({units} {units === 1 ? "item" : "items"})</dt>
                <dd>{money(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Discount</dt>
                <dd className="text-green-600">-{money(order.discount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Shipping</dt>
                <dd>{order.delivery_fee === 0 ? "Free" : money(order.delivery_fee)}</dd>
              </div>
            </dl>

            <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-gray-900">{money(order.total)}</span>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-lg bg-blue-50 p-3 text-xs text-gray-600">
              <FiShield className="mt-0.5 shrink-0 text-xl text-blue-600" />
              <p>
                <span className="block font-medium text-blue-700">Your order is protected</span>
                We use secure payment and encryption to keep your information safe.
              </p>
            </div>

            {order.status === "pending" && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="mt-4 w-full rounded-lg border border-red-300 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 print:hidden"
              >
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            )}
          </section>

          {/* Vertical tracking timeline */}
          <section id="tracking" className="scroll-mt-24 rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <FiClock className="text-blue-600" /> Tracking Timeline
            </h2>

            <ul className="mt-5">
              {steps.map((step, i) => (
                <li
                  key={step.key}
                  // The latest step is highlighted
                  className={`relative rounded-lg py-2 pl-12 pr-3 ${
                    step.current ? (step.cancelled ? "bg-red-50" : "bg-green-50") : ""
                  }`}
                >
                  {/* Vertical line to the next step */}
                  {i < steps.length - 1 && (
                    <span
                      className={`absolute left-[27px] top-10 h-[calc(100%-8px)] w-0.5 ${
                        steps[i + 1].reached ? "bg-green-300" : "bg-gray-200"
                      }`}
                    />
                  )}
                  <span className="absolute left-3 top-2"><StepIcon step={step} /></span>
                  <p className={`text-sm font-medium ${
                    step.current ? (step.cancelled ? "text-red-600" : "text-green-700") : "text-gray-900"
                  }`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-500">
                    {step.reached ? formatDate(step.date) : "Waiting"}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <Link
            href="/orders"
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 print:hidden"
          >
            <FiShoppingBag /> View More Orders
          </Link>
        </aside>
      </div>
    </div>
  );
}