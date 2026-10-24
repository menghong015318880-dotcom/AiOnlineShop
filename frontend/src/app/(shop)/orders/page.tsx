"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FiChevronLeft, FiChevronRight, FiEye, FiFilter, FiPackage, FiSearch, FiShoppingBag,
} from "react-icons/fi";
import StatusBadge from "@/components/orders/StatusBadge";
import { money } from "@/lib/pricing";
import { getOrders } from "@/services/orders";
import type { Order, OrderStatus } from "@/types";

const PER_PAGE = 6;

type Filter = "all" | OrderStatus;

// Tabs and the dropdown use this same list
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All Orders" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

// "Oct 14, 2026" and "10:24 AM". Used only after the orders are loaded in the browser.
function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null); // null = still loading
  const [error, setError] = useState("");

  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Load the orders once
  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch(() => setError("Cannot load your orders. Please try again."));
  }, []);

  if (error) return <p className="py-20 text-center text-red-500">{error}</p>;
  if (!orders) return <p className="py-20 text-center text-gray-500">Loading...</p>;

  // Number of orders for each tab
  const countOf = (key: Filter) =>
    key === "all" ? orders.length : orders.filter((o) => o.status === key).length;

  // Apply the status filter and the search (by order number)
  const query = search.trim().toLowerCase().replace("#", "");
  const filtered = orders.filter(
    (o) =>
      (filter === "all" || o.status === filter) &&
      (!query || o.order_number.toLowerCase().includes(query))
  );

  // Pagination
  const lastPage = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, lastPage);
  const start = (currentPage - 1) * PER_PAGE;
  const visible = filtered.slice(start, start + PER_PAGE);

  // Changing the filter or the search goes back to page 1
  const changeFilter = (key: Filter) => { setFilter(key); setPage(1); };
  const changeSearch = (text: string) => { setSearch(text); setPage(1); };

  return (
    <div className="py-2">
      <section className="rounded-xl border border-gray-200 bg-white">
        {/* Title, search and status dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl text-blue-600">
              <FiShoppingBag />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
              <p className="text-sm text-gray-600">View and manage your past orders</p>
            </div>
          </div>

          <div className="flex w-full flex-wrap gap-3 sm:w-auto">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-gray-300 px-3 sm:w-64 sm:flex-none">
              <FiSearch className="text-gray-400" />
              <input
                value={search}
                onChange={(e) => changeSearch(e.target.value)}
                placeholder="Search by order ID..."
                className="w-full min-w-0 py-2.5 text-sm outline-none"
              />
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-3">
              <FiFilter className="text-gray-500" />
              <select
                value={filter}
                onChange={(e) => changeFilter(e.target.value as Filter)}
                aria-label="Filter by status"
                className="bg-transparent py-2.5 text-sm outline-none"
              >
                {FILTERS.map((f) => (
                  <option key={f.key} value={f.key}>
                    {f.key === "all" ? "All Status" : f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Status tabs with counts */}
        <div className="flex gap-3 overflow-x-auto border-t border-gray-200 px-5 py-4">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => changeFilter(f.key)}
              className={`whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-medium ${
                filter === f.key
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"
              }`}
            >
              {f.label} ({countOf(f.key)})
            </button>
          ))}
        </div>

        <div className="px-5 pb-5">
          {/* Nothing ordered yet */}
          {orders.length === 0 && (
            <div className="py-16 text-center">
              <FiPackage className="mx-auto text-5xl text-gray-300" />
              <p className="mt-4 text-gray-700">You have no orders yet.</p>
              <Link
                href="/"
                className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Start Shopping
              </Link>
            </div>
          )}

          {/* Orders exist, but none match the filter or the search */}
          {orders.length > 0 && filtered.length === 0 && (
            <p className="py-16 text-center text-gray-500">No orders found.</p>
          )}

          {visible.length > 0 && (
            <>
              {/* Column titles (hidden on phones) */}
              <div className="hidden rounded-lg bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 md:grid md:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_150px]">
                <span>Order Details</span>
                <span>Date</span>
                <span>Status</span>
                <span>Total</span>
                <span>Action</span>
              </div>

              <ul className="mt-3 space-y-3">
                {visible.map((order) => {
                  const date = formatDate(order.created_at);
                  const first = order.items[0];
                  const units = order.items.reduce((sum, i) => sum + i.quantity, 0);
                  const thumbs = order.items.slice(0, 3);
                  const extra = order.items.length - thumbs.length;

                  return (
                    <li key={order.id} className="rounded-xl border border-gray-200">
                      <div className="grid items-center gap-3 p-4 md:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_150px]">
                        {/* Order details: main image, number, item count, small images */}
                        <div className="flex items-center gap-4">
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                            {first && (
                              <Image src={first.image_url} alt={first.name} fill sizes="64px" className="object-contain p-1.5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900">Order #{order.order_number}</p>
                            <p className="text-xs text-gray-500">{units} {units === 1 ? "item" : "items"}</p>
                            {order.items.length > 1 && (
                              <div className="mt-1.5 flex items-center gap-1.5">
                                {thumbs.map((i) => (
                                  <span key={i.product_id} className="relative h-7 w-7 overflow-hidden rounded-md border border-gray-200 bg-white">
                                    <Image src={i.image_url} alt={i.name} fill sizes="28px" className="object-contain p-0.5" />
                                  </span>
                                ))}
                                {extra > 0 && <span className="text-xs text-gray-500">+{extra}</span>}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-sm text-gray-700">
                          <p>{date.day}</p>
                          <p className="text-xs text-gray-500">{date.time}</p>
                        </div>

                        <div><StatusBadge status={order.status} /></div>

                        <p className="font-semibold text-gray-900">{money(order.total)}</p>

                        {/* Opens the order detail page */}
                        <Link
                          href={`/orders/${order.id}`}
                          className="flex items-center justify-center gap-2 rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                        >
                          <FiEye /> View Details
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Footer: count and pagination */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
                <p>
                  Showing {start + 1} - {start + visible.length} of {filtered.length} orders
                </p>
                {lastPage > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      aria-label="Previous page"
                      className="rounded border border-gray-300 p-2 disabled:opacity-40"
                    >
                      <FiChevronLeft />
                    </button>
                    {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`h-9 w-9 rounded border text-sm ${
                          p === currentPage ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 bg-white"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(currentPage + 1)}
                      disabled={currentPage === lastPage}
                      aria-label="Next page"
                      className="rounded border border-gray-300 p-2 disabled:opacity-40"
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}