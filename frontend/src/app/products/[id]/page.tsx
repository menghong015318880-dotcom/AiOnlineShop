"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  FiAward, FiChevronRight, FiHeadphones, FiHome, FiMinus, FiPlus,
  FiShield, FiShoppingCart, FiTruck, FiZap,
} from "react-icons/fi";
import { FaRobot } from "react-icons/fa";
import ProductGallery from "@/components/Product-detail/ProductGallery";
import ProductTabs from "@/components/Product-detail/ProductTabs";
import SimilarProducts from "@/components/Product-detail/SimilarProducts";
import Stars from "@/components/Product-detail/Stars";
import { useCart } from "@/context/CartContext";
import { getCategories, getProduct, getRelatedProducts } from "@/services/products";
import type { Category, Product } from "@/types";

// Static info shown in the card on the right (not from the database)
const PERKS = [
  { Icon: FiTruck, title: "Free Shipping", text: "On orders over $50" },
  { Icon: FiShield, title: "Secure Payment", text: "100% secure checkout" },
  { Icon: FiHeadphones, title: "24/7 Support", text: "We're here to help" },
  { Icon: FiAward, title: "1 Year Warranty", text: "Official warranty" },
];

// Product detail page. useParams must be inside <Suspense> in Next.js.
export default function ProductDetailPage() {
  return (
    <Suspense fallback={<p className="py-10 text-center text-gray-500">Loading...</p>}>
      <ProductDetailRoute />
    </Suspense>
  );
}

// Reads the id from the URL (/products/3).
// key={id} resets the page (quantity, gallery) when another product is opened.
function ProductDetailRoute() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  return <ProductDetail key={id} id={id} />;
}

function ProductDetail({ id }: { id: number }) {
  const router = useRouter();
  const { addItem } = useCart(); // cart from CartContext

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Load the product, the categories and the similar products
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [p, cats] = await Promise.all([getProduct(id), getCategories()]);
      if (cancelled) return;
      setProduct(p);
      setCategories(cats);
      if (p) {
        const rel = await getRelatedProducts(p.id, p.category_id, 2);
        if (!cancelled) setRelated(rel);
      }
      setLoading(false);
    }

    load().catch(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Add a product to the cart (the cart limits the quantity to the stock)
  const handleAddToCart = (p: Product, qty = 1) => addItem(p, qty);

  if (loading) return <p className="py-20 text-center text-gray-500">Loading...</p>;

  if (!product) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-700">Product not found.</p>
        <Link href="/" className="mt-3 inline-block text-blue-600 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  const categoryName = categories.find((c) => c.id === product.category_id)?.name;
  const outOfStock = product.stock <= 0;
  const images = product.images && product.images.length > 0 ? product.images : [product.image_url];

  // Discount percent, only when an old price exists and is higher than the current price
  const discount =
    product.old_price && product.old_price > product.price
      ? Math.round((1 - product.price / product.old_price) * 100)
      : 0;

  // Quantity can not be lower than 1 or higher than the stock (FR-08)
  const decrease = () => setQuantity((q) => Math.max(1, q - 1));
  const increase = () => setQuantity((q) => Math.min(product.stock, q + 1));

  return (
    <div className="py-2">
      {/* Breadcrumb: Home > Category > Product */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="flex items-center gap-1 hover:text-blue-600">
          <FiHome /> Home
        </Link>
        <FiChevronRight />
        {categoryName && (
          <>
            <Link href="/#products" className="hover:text-blue-600">{categoryName}</Link>
            <FiChevronRight />
          </>
        )}
        <span className="text-gray-900">{product.name}</span>
      </nav>

      {/* Top section: gallery | info | side cards */}
      <div className="mt-5 grid gap-6 lg:grid-cols-2 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_300px]">
        <ProductGallery images={images} alt={product.name} />

        {/* Product info */}
        <div>
          <span className="inline-block rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-700">
            {product.brand}
          </span>
          <h1 className="mt-3 text-2xl font-bold text-gray-900 md:text-3xl">{product.name}</h1>

          <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
            <Stars value={product.rating} />
            <span>{product.rating.toFixed(1)} ({product.review_count} reviews)</span>
          </div>

          {/* Price, old price and discount */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-3xl font-bold text-blue-600">${product.price.toFixed(2)}</span>
            {discount > 0 && product.old_price && (
              <>
                <span className="text-gray-400 line-through">${product.old_price.toFixed(2)}</span>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                  -{discount}%
                </span>
              </>
            )}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-gray-600">{product.description}</p>

          {/* Stock message */}
          <p className={`mt-4 text-sm font-medium ${outOfStock ? "text-red-500" : "text-green-600"}`}>
            {outOfStock ? "Out of stock" : `In stock (${product.stock} available)`}
          </p>

          {/* Quantity and buttons */}
          <p className="mt-5 text-sm text-gray-700">Quantity</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-lg border border-gray-300">
              <button
                onClick={decrease}
                disabled={outOfStock || quantity <= 1}
                aria-label="Decrease quantity"
                className="p-3 text-gray-600 hover:text-blue-600 disabled:opacity-40"
              >
                <FiMinus />
              </button>
              <span className="w-10 text-center text-sm font-medium">{outOfStock ? 0 : quantity}</span>
              <button
                onClick={increase}
                disabled={outOfStock || quantity >= product.stock}
                aria-label="Increase quantity"
                className="p-3 text-gray-600 hover:text-blue-600 disabled:opacity-40"
              >
                <FiPlus />
              </button>
            </div>

            <button
              onClick={() => handleAddToCart(product, quantity)}
              disabled={outOfStock}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <FiShoppingCart /> Add to Cart
            </button>

            {/* Buy Now: add to the cart, then open the cart page.
                Later this will go to the checkout page. */}
            <button
              onClick={() => {
                handleAddToCart(product, quantity);
                router.push("/cart");
              }}
              disabled={outOfStock}
              className="flex items-center gap-2 rounded-lg border border-blue-600 px-5 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
            >
              <FiZap /> Buy Now
            </button>
          </div>
        </div>

        {/* Side cards */}
        <aside className="space-y-4 lg:col-span-2 xl:col-span-1">
          <ul className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
            {PERKS.map(({ Icon, title, text }) => (
              <li key={title} className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-xl text-blue-600">
                  <Icon />
                </span>
                <div className="text-sm leading-tight">
                  <p className="font-medium text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500">{text}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Ask AI card: the real chat is built later */}
          <button
            onClick={() => alert("AI assistant coming soon")}
            className="flex w-full items-center gap-3 rounded-xl bg-blue-50 p-5 text-left hover:bg-blue-100"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-2xl text-white">
              <FaRobot />
            </span>
            <span className="flex-1 text-sm">
              <span className="block font-semibold text-gray-900">Ask AI Assistant</span>
              <span className="block text-xs text-gray-600">
                Have questions about this product? Our AI assistant is here to help!
              </span>
            </span>
            <FiChevronRight className="text-gray-500" />
          </button>
        </aside>
      </div>

      {/* Bottom section: tabs | similar products.
          items-start: each box is as tall as its own content. */}
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <ProductTabs product={product} categoryName={categoryName} />
        <SimilarProducts products={related} onAddToCart={(p) => handleAddToCart(p, 1)} />
      </div>
    </div>
  );
}