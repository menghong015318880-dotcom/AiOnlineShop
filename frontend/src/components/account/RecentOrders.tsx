"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import StatusBadge from "@/components/orders/StatusBadge";
import { money } from "@/lib/pricing";
import type { Order } from "@/types";

const PER_PAGE = 5;

// "Apr 30, 2026" and "10:24 AM". Used only after the orders are loaded in the browser.
function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  };
}

// The table of the latest orders (newest first) with pages of 5.
export default function RecentOrders({ orders }: { orders: Order[] }) {
  const [page, setPage] = useState(1);

  const lastPage = Math.max(1, Math.ceil(orders.length / PER_PAGE));
  const current = Math.min(page, lastPage);
  const start = (current - 1) * PER_PAGE;
  const visible = orders.slice(start, start + PER_PAGE);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900">Recent Orders</h2>
        <Link href="/orders" className="text-xs font-medium text-blue-600 hover:underline">
          View All →
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-gray-600">You have no orders yet.</p>
          <Link
            href="/"
            className="mt-3 inline-block rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th className="rounded-l-lg px-3 py-2.5 font-medium">Order ID</th>
                  <th className="px-3 py-2.5 font-medium">Date</th>
                  <th className="px-3 py-2.5 font-medium">Total Amount</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="rounded-r-lg px-3 py-2.5 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visible.map((order) => {
                  const date = formatDate(order.created_at);
                  const first = order.items[0];
                  return (
                    <tr key={order.id}>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                            {first && (
                              <Image src={first.image_url} alt={first.name} fill sizes="40px" className="object-contain p-1" />
                            )}
                          </span>
                          <span className="font-medium text-gray-900">#{order.order_number}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-gray-700">
                        {date.day}
                        <span className="block text-xs text-gray-400">{date.time}</span>
                      </td>
                      <td className="px-3 py-3 font-medium text-gray-900">{money(order.total)}</td>
                      <td className="px-3 py-3"><StatusBadge status={order.status} /></td>
                      <td className="px-3 py-3">
                        <Link
                          href={`/orders/${order.id}`}
                          className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
            <p>
              Showing {visible.length} of {orders.length} orders
            </p>
            {lastPage > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(current - 1)}
                  disabled={current === 1}
                  aria-label="Previous page"
                  className="rounded border border-gray-300 p-1.5 disabled:opacity-40"
                >
                  <FiChevronLeft />
                </button>
                {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-7 w-7 rounded border text-xs ${
                      p === current ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 bg-white"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(current + 1)}
                  disabled={current === lastPage}
                  aria-label="Next page"
                  className="rounded border border-gray-300 p-1.5 disabled:opacity-40"
                >
                  <FiChevronRight />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}