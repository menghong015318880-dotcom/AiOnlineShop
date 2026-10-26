"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiChevronLeft, FiChevronRight, FiPackage } from "react-icons/fi";
import OrderCard from "@/components/account/OrderCard";
import OrderDetailPanel from "@/components/account/OrderDetailPanel";
import { useCart } from "@/context/CartContext";
import { cancelOrder, getOrders } from "@/services/orders";
import { getProducts } from "@/services/products";
import type { Order, OrderStatus, Product } from "@/types";

const PER_PAGE = 5;

type Filter = "all" | OrderStatus;

// The tabs. "confirmed" is shown as "Processing".
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All Orders" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

export default function MyOrdersPage() {
  const router = useRouter();
  const { addItem } = useCart();

  const [orders, setOrders] = useState<Order[] | null>(null); // null = still loading
  const [products, setProducts] = useState<Product[]>([]);    // used by "Reorder"
  const [error, setError] = useState("");

  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // Load the orders and the products once
  useEffect(() => {
    let cancelled = false;

    Promise.all([getOrders(), getProducts({ perPage: 1000 })])
      .then(([orderList, productPage]) => {
        if (cancelled) return;
        setOrders(orderList);
        setProducts(productPage.data);
      })
      .catch(() => !cancelled && setError("Cannot load your orders. Please try again."));

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p className="py-20 text-center text-red-500">{error}</p>;
  if (!orders) return <p className="py-20 text-center text-gray-500">Loading...</p>;

  // Number of orders for each tab
  const countOf = (key: Filter) =>
    key === "all" ? orders.length : orders.filter((o) => o.status === key).length;

  const filtered = orders.filter((o) => filter === "all" || o.status === filter);

  // Pagination
  const lastPage = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, lastPage);
  const visible = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  // The order shown in the side panel: the chosen one, or the first of the page
  const selected = filtered.find((o) => o.id === selectedId) ?? visible[0] ?? null;

  const changeFilter = (key: Filter) => {
    setFilter(key);
    setPage(1);
    setNotice("");
  };

  const select = (order: Order) => {
    setSelectedId(order.id);
    setNotice("");
  };

  // Reorder: put the products of the order in the cart (only the ones that are still in stock)
  const handleReorder = (order: Order) => {
    let added = 0;
    for (const item of order.items) {
      const product = products.find((p) => p.id === item.product_id);
      if (product && product.stock > 0) {
        addItem(product, Math.min(item.quantity, product.stock));
        added += 1;
      }
    }
    if (added === 0) {
      setNotice("These products are not available now.");
      return;
    }
    router.push("/cart");
  };

  const handleCancel = async (order: Order) => {
    if (!window.confirm(`Cancel order ${order.order_number}?`)) return;
    setCancelling(true);
    try {
      const updated = await cancelOrder(order.id);
      setOrders((prev) => (prev ? prev.map((o) => (o.id === updated.id ? updated : o)) : prev));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Could not cancel the order.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      {/* ===== Left: the list ===== */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="mt-1 text-sm text-gray-600">View and manage your orders</p>

        {/* Status tabs with counts */}
        <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
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

        {/* Nothing ordered yet */}
        {orders.length === 0 && (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white py-16 text-center">
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

        {/* Orders exist, but none match the tab */}
        {orders.length > 0 && filtered.length === 0 && (
          <p className="mt-6 rounded-xl border border-gray-200 bg-white py-16 text-center text-gray-500">
            No orders found.
          </p>
        )}

        {visible.length > 0 && (
          <>
            <div className="mt-5 space-y-4">
              {visible.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  selected={selected?.id === order.id}
                  onSelect={() => select(order)}
                />
              ))}
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                  className="rounded-lg border border-gray-300 bg-white p-2.5 disabled:opacity-40"
                >
                  <FiChevronLeft />
                </button>
                {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-10 w-10 rounded-lg border text-sm ${
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
                  className="rounded-lg border border-gray-300 bg-white p-2.5 disabled:opacity-40"
                >
                  <FiChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== Right: the panel of the selected order (large screens only) ===== */}
      <aside className="hidden xl:sticky xl:top-24 xl:block xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
        {selected && (
          <OrderDetailPanel
            order={selected}
            notice={notice}
            cancelling={cancelling}
            onReorder={() => handleReorder(selected)}
            onCancel={() => handleCancel(selected)}
          />
        )}
      </aside>
    </div>
  );
}