"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FiArrowRight, FiBox, FiMapPin, FiPlusCircle, FiTruck } from "react-icons/fi";
import AssistantPanel from "@/components/account/AssistantPanel";
import RecentOrders from "@/components/account/RecentOrders";
import RecommendedProducts from "@/components/account/RecommendedProducts";
import TrackParcelCard from "@/components/account/TrackParcelCard";
import { useAuth } from "@/context/AuthContext";
import { isAccountPageReady } from "@/lib/account-nav";
import { getOrders } from "@/services/orders";
import { getProducts } from "@/services/products";
import type { Order, Product } from "@/types";

// The 4 quick cards under the welcome box. A page that is not built yet is shown as "Soon".
const QUICK_CARDS = [
  { title: "Create Order", text: "Shop your favorite products", href: "/", Icon: FiPlusCircle, color: "bg-blue-50 text-blue-600" },
  { title: "My Order", text: "View your order history", href: "/orders", Icon: FiBox, color: "bg-green-50 text-green-600" },
  { title: "Track Parcel", text: "Check your delivery status", href: "#track", Icon: FiTruck, color: "bg-violet-50 text-violet-600" },
  { title: "My Address", text: "Manage your shipping address", href: "/account/addresses", Icon: FiMapPin, color: "bg-orange-50 text-orange-600" },
];

export default function AccountDashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");

  // Load the orders and the products once
  useEffect(() => {
    let cancelled = false;

    Promise.all([getOrders(), getProducts({ perPage: 1000 })])
      .then(([orderList, productPage]) => {
        if (cancelled) return;
        setOrders(orderList);
        setProducts(productPage.data);
      })
      .catch(() => !cancelled && setError("Cannot load your dashboard. Please try again."));

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p className="py-20 text-center text-red-500">{error}</p>;
  if (!orders) return <p className="py-20 text-center text-gray-500">Loading...</p>;

  // The newest order that is not cancelled (orders are newest first)
  const trackedOrder = orders.find((o) => o.status !== "cancelled") ?? null;

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      {/* ===== Left column ===== */}
      <div className="space-y-6">
        {/* Welcome box. To add an image, put it in public/assets/images/ and use <Image> here. */}
        <section className="rounded-xl bg-gradient-to-r from-blue-50 to-blue-200 p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900">Hello, {user?.full_name}! 👋</h1>
          <p className="mt-2 font-medium text-gray-900">Welcome back to SmartShop AI!</p>
          <p className="mt-2 max-w-md text-sm text-gray-600">
            Discover amazing products, get personalized recommendations, and enjoy a smarter shopping experience.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Start Shopping <FiArrowRight />
          </Link>
        </section>

        {/* Quick cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {QUICK_CARDS.map(({ title, text, href, Icon, color }) => {
            const content = (
              <>
                <span className={`flex h-10 w-10 items-center justify-center rounded-full text-xl ${color}`}>
                  <Icon />
                </span>
                <span className="mt-3 block font-semibold text-gray-900">{title}</span>
                <span className="mt-1 block text-xs text-gray-500">{text}</span>
              </>
            );

            return isAccountPageReady(href) || href === "#track" ? (
              <Link
                key={title}
                href={href}
                className="rounded-xl border border-gray-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
              >
                {content}
              </Link>
            ) : (
              <div key={title} title="Coming soon" className="cursor-not-allowed rounded-xl border border-gray-100 bg-white p-4 opacity-50">
                {content}
              </div>
            );
          })}
        </div>

        <RecentOrders orders={orders} />
        <RecommendedProducts products={products} />
      </div>

      {/* ===== Right column ===== */}
      <div className="space-y-6">
        <AssistantPanel />
        <TrackParcelCard order={trackedOrder} />

        {/* Promo box. To add an image, put it in public/assets/images/ and use <Image> here. */}
        <section className="rounded-xl bg-gradient-to-br from-indigo-600 to-violet-500 p-6 text-white">
          <h2 className="text-xl font-bold leading-snug">
            Better Products
            <br />
            Smarter Choices
          </h2>
          <p className="mt-2 text-sm text-white/80">Let AI help you find what you love.</p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium hover:bg-black"
          >
            Explore Now <FiArrowRight />
          </Link>
        </section>
      </div>
    </div>
  );
}