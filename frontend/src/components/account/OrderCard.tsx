import Image from "next/image";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";
import StatusBadge from "@/components/orders/StatusBadge";
import { money } from "@/lib/pricing";
import type { Order } from "@/types";

// "Apr 30, 2026" and "10:24 AM". Used only after the orders are loaded in the browser.
function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  };
}

interface OrderCardProps {
  order: Order;
  selected: boolean;
  onSelect: () => void; // shows this order in the side panel (large screens)
}

// One order in the list.
// Phone: the top has the image and the information, the bottom has the total and the button.
// From sm up: the total and the button are on the right side of the card.
export default function OrderCard({ order, selected, onSelect }: OrderCardProps) {
  const date = formatDate(order.created_at);
  const first = order.items[0];
  const units = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const thumbs = order.items.slice(0, 3);
  const extra = order.items.length - thumbs.length;

  // The total amount (used in both places below)
  const total = (
    <div>
      <p className="text-xs text-gray-500">Total Amount</p>
      <p className="text-xl font-bold text-gray-900">{money(order.total)}</p>
    </div>
  );

  // The buttons (used in both places below)
  const buttons = (
    <>
      {/* Large screens: show the order in the side panel */}
      <button
        onClick={onSelect}
        className="hidden items-center gap-2 xl:flex"
        aria-label={`View details of order ${order.order_number}`}
      >
        <span className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50">
          View Details
        </span>
        <FiChevronRight className="text-gray-400" />
      </button>

      {/* Smaller screens: there is no side panel, so open the full page */}
      <Link
        href={`/orders/${order.id}`}
        className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 xl:hidden"
      >
        View Details
      </Link>
    </>
  );

  return (
    <article
      className={`rounded-xl border bg-white p-4 transition ${
        selected ? "border-blue-500 ring-1 ring-blue-200" : "border-gray-200"
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Main image (smaller on phones) */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-50 sm:h-20 sm:w-20">
          {first && <Image src={first.image_url} alt={first.name} fill sizes="80px" className="object-contain p-2" />}
        </div>

        {/* Number, status, date and small images. min-w-0 lets this block shrink on phones. */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="break-words font-semibold text-gray-900">#{order.order_number}</p>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-xs text-gray-500">{date.day} • {date.time}</p>

          <div className="mt-2 flex items-center gap-1.5">
            {thumbs.map((i) => (
              <span key={i.product_id} className="relative h-8 w-8 overflow-hidden rounded-md border border-gray-200 bg-white">
                <Image src={i.image_url} alt={i.name} fill sizes="32px" className="object-contain p-0.5" />
              </span>
            ))}
            {extra > 0 && <span className="text-xs text-gray-500">+{extra}</span>}
            <span className="ml-1 text-xs text-gray-500">{units} {units === 1 ? "item" : "items"}</span>
          </div>
        </div>

        {/* From sm up: total and buttons on the right */}
        <div className="hidden items-center gap-6 sm:flex">
          {total}
          <div className="flex items-center">{buttons}</div>
        </div>
      </div>

      {/* Phones: total and buttons in a row at the bottom */}
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-100 pt-3 sm:hidden">
        {total}
        <div className="flex items-center">{buttons}</div>
      </div>
    </article>
  );
}