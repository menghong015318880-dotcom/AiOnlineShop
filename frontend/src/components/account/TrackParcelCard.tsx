"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiCheck, FiCopy, FiFileText, FiRefreshCw, FiTruck } from "react-icons/fi";
import StatusBadge from "@/components/orders/StatusBadge";
import type { Order, OrderStatus } from "@/types";

// The 4 steps of a normal order ("confirmed" is shown as "Processing")
const STEPS: { key: OrderStatus; label: string; Icon: React.ElementType }[] = [
  { key: "pending", label: "Ordered", Icon: FiFileText },
  { key: "confirmed", label: "Processing", Icon: FiRefreshCw },
  { key: "shipped", label: "Shipped", Icon: FiTruck },
  { key: "delivered", label: "Delivered", Icon: FiCheck },
];

// "Apr 28". The first step uses the order date when there is no history.
function dateOf(order: Order, status: OrderStatus): string | null {
  const at = order.status_history?.find((e) => e.status === status)?.at ?? (status === "pending" ? order.created_at : null);
  return at ? new Date(at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null;
}

// Shows the progress of one order (the newest order that is not cancelled).
export default function TrackParcelCard({ order }: { order: Order | null }) {
  const [copied, setCopied] = useState(false);

  const copyNumber = async () => {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.order_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard is blocked: ignore
    }
  };

  const reached = order ? STEPS.findIndex((s) => s.key === order.status) : -1;
  const item = order?.items[0];

  return (
    // id="track": the "Track Parcel" link scrolls here
    <section id="track" className="scroll-mt-24 rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-bold text-gray-900">
          <FiTruck className="text-blue-600" /> Track Your Parcel
        </h2>
        <Link href="/orders" className="text-xs font-medium text-blue-600 hover:underline">
          View All →
        </Link>
      </div>

      {!order || !item ? (
        <p className="py-8 text-center text-sm text-gray-500">No orders to track yet.</p>
      ) : (
        <>
          {/* Steps */}
          <ol className="mt-5 grid grid-cols-4">
            {STEPS.map((step, i) => {
              const done = i <= reached;
              return (
                <li key={step.key} className="relative flex flex-col items-center text-center">
                  {i > 0 && (
                    <span className={`absolute left-[-50%] top-4 h-0.5 w-full ${done ? "bg-blue-500" : "bg-gray-200"}`} />
                  )}
                  <span
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                      i === STEPS.length - 1 && done
                        ? "bg-green-500 text-white"
                        : done
                        ? "bg-blue-600 text-white"
                        : "border-2 border-gray-300 bg-white text-gray-400"
                    }`}
                  >
                    <step.Icon />
                  </span>
                  <span className="mt-2 text-xs font-medium text-gray-900">{step.label}</span>
                  <span className="text-[11px] text-gray-500">{done ? dateOf(order, step.key) ?? "" : ""}</span>
                </li>
              );
            })}
          </ol>

          {/* The order */}
          <Link
            href={`/orders/${order.id}`}
            className="mt-4 flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
          >
            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-50">
              <Image src={item.image_url} alt={item.name} fill sizes="56px" className="object-contain p-1" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-gray-900">
                {item.name}
                {order.items.length > 1 && ` +${order.items.length - 1} more`}
              </span>
              <span className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                #{order.order_number}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault(); // do not open the order page
                    copyNumber();
                  }}
                  aria-label="Copy order number"
                  className="text-gray-400 hover:text-blue-600"
                >
                  {copied ? <FiCheck className="text-green-500" /> : <FiCopy />}
                </button>
              </span>
            </span>
            <StatusBadge status={order.status} />
          </Link>
        </>
      )}
    </section>
  );
}