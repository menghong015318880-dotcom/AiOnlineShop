import Image from "next/image";
import Link from "next/link";
import { FiCheck, FiClock, FiMapPin, FiShoppingCart, FiUser, FiX } from "react-icons/fi";
import StatusBadge from "@/components/orders/StatusBadge";
import { buildSteps, type Step } from "@/lib/order-steps";
import { money } from "@/lib/pricing";
import type { Order } from "@/types";

// "Apr 30, 2026 • 10:24 AM"
function formatDateTime(iso: string) {
  const d = new Date(iso);
  const day = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return `${day} • ${time}`;
}

// Round icon of a step: green check, red X (cancelled), or grey clock (not reached yet)
function StepIcon({ step }: { step: Step }) {
  const color = step.cancelled
    ? "bg-red-500 text-white"
    : step.reached
    ? "bg-green-500 text-white"
    : "border-2 border-gray-300 bg-white text-gray-400";

  return (
    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${color}`}>
      {step.cancelled ? <FiX /> : step.reached ? <FiCheck /> : <FiClock />}
    </span>
  );
}

interface OrderDetailPanelProps {
  order: Order;
  notice: string;        // a message under the Reorder button
  cancelling: boolean;
  onReorder: () => void;
  onCancel: () => void;
}

// The panel of one order: progress, delivery information, items and totals.
export default function OrderDetailPanel({ order, notice, cancelling, onReorder, onCancel }: OrderDetailPanelProps) {
  const steps = buildSteps(order);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      {/* Number and status */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">#{order.order_number}</h2>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-xs text-gray-500">Placed on {formatDateTime(order.created_at)}</p>

      {/* Order progress */}
      <h3 className="mt-5 border-t border-gray-100 pt-4 font-semibold text-gray-900">Order Progress</h3>
      <ul className="mt-3">
        {steps.map((step, i) => (
          <li key={step.key} className="relative pb-4 pl-9 last:pb-0">
            {/* Vertical line to the next step */}
            {i < steps.length - 1 && (
              <span
                className={`absolute left-[11px] top-6 h-[calc(100%-12px)] w-0.5 ${
                  steps[i + 1].reached ? "bg-green-300" : "bg-gray-200"
                }`}
              />
            )}
            <span className="absolute left-0 top-0"><StepIcon step={step} /></span>
            <p
              className={`text-sm font-medium ${
                step.current ? (step.cancelled ? "text-red-600" : "text-green-600") : "text-gray-900"
              }`}
            >
              {step.label}
            </p>
            <p className="text-xs text-gray-500">{step.reached && step.date ? formatDateTime(step.date) : "Waiting"}</p>
          </li>
        ))}
      </ul>

      {/* Shipping information */}
      <h3 className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-4 font-semibold text-gray-900">
        <FiMapPin className="text-blue-600" /> Shipping Information
      </h3>
      <div className="mt-3 flex gap-3 text-sm">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg text-blue-600">
          <FiUser />
        </span>
        <div className="min-w-0 text-gray-600">
          <p className="font-medium text-gray-900">{order.shipping.full_name}</p>
          <p>{order.shipping.phone}</p>
          <p className="mt-1">{order.shipping.address}</p>
          <p>{order.shipping.commune}, {order.shipping.district}, {order.shipping.province}</p>
        </div>
      </div>

      {/* Items */}
      <h3 className="mt-5 border-t border-gray-100 pt-4 font-semibold text-gray-900">Order Items</h3>
      <ul className="mt-3 space-y-3">
        {order.items.map((item) => (
          <li key={item.product_id} className="flex items-center gap-3">
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-50">
              <Image src={item.image_url} alt={item.name} fill sizes="48px" className="object-contain p-1" />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">{item.name}</span>
            <span className="text-sm text-gray-900">{money(item.unit_price)}</span>
            <span className="text-xs text-gray-500">×{item.quantity}</span>
          </li>
        ))}
      </ul>

      {/* Totals */}
      <dl className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm text-gray-600">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(order.subtotal)}</dd></div>
        <div className="flex justify-between">
          <dt>Shipping</dt><dd>{order.delivery_fee === 0 ? "Free" : money(order.delivery_fee)}</dd>
        </div>
        <div className="flex justify-between"><dt>Discount</dt><dd className="text-green-600">-{money(order.discount)}</dd></div>
      </dl>
      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-lg font-bold text-gray-900">Total</span>
        <span className="text-xl font-bold text-gray-900">{money(order.total)}</span>
      </div>

      {/* Actions */}
      <button
        onClick={onReorder}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-blue-600 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50"
      >
        <FiShoppingCart /> Reorder
      </button>
      {notice && <p className="mt-2 text-xs text-red-500">{notice}</p>}

      {/* A customer can cancel only while the order is pending (FR-14) */}
      {order.status === "pending" && (
        <button
          onClick={onCancel}
          disabled={cancelling}
          className="mt-3 w-full rounded-lg border border-red-300 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {cancelling ? "Cancelling..." : "Cancel Order"}
        </button>
      )}

      <Link
        href={`/orders/${order.id}`}
        className="mt-3 block text-center text-xs font-medium text-blue-600 hover:underline"
      >
        Full details and invoice →
      </Link>
    </div>
  );
}