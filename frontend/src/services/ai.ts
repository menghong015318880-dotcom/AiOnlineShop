/* 
  AI assistant service (MOUK). It answers with simple word matching on the catelog.
  Later, replace getAiReply with the Laravel API (POST /api/ai/chat). The real assistant must:
    - run on the server (the AI API key must never be in the browser),
    - answer only from the catelog (read-only data),
    - treat the customer's message as untrusted text (prompt injection),
    - have a limit of message per user.
*/

import { money } from "@/lib/pricing";
import { getOrders } from "./orders";
import { getProducts } from "./products";
import type { OrderStatus, Product } from "@/types";
import ProductTabs from "@/components/Product-detail/ProductTabs";

export interface AiReply {
  text: string;
  products?: Product[]; // products to show under the text
  orderId?: number;     // order to link to
}

const STATUS_TEXT: Record<OrderStatus, string> = {
  pending: "pending (waiting for confirmation)",
  confirmed: "being processed",
  shipped: "on the way",
  delivered: "delivered",
  cancelled: "cancelled",
};

// Words that do not help to find a product
const STOP_WORDS = new Set([
  "find", "show", "for", "the", "and", "with", "some", "want", "need", "looking",
  "please", "products", "product", "buy", "get", "can", "you", "any", "have",
  "under", "below", "less", "than", "max", "somthing",
]);

// "headphones" -> "headphone", so a plural word still matches
const stem = (word: string) => (word.length > 3 && word.endsWith("s") ? word.slice(0, -1) :word);

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getAiReply(message: string): Promise<AiReply> {
  await delay();
  const text = message.toLowerCase();

  // 1. Help and support
  if (/\b(help|support|contact|shipping|return|refund|payment)\b/.test(text)) {
    return {
      text: "Shipping is free on orders over $50. You can pay by card, ABA Bank or cash on delivery. " +
      "For anything else, please use the Contact page and our team will help you.",
    };
  }

  // 2. Order tracking: the newest order
  if (/\b(track|order|orders|parcel|status)b/.test(text)) {
    const latest = (await getOrders())[0]; // newest first
    if (!latest) return { text: "You have no orders yet. Start shopping and I can help you track your orders." };
    return {
      text: `Your latest order #${latest.order_number} is ${STATUS_TEXT[latest.status]}. Total: ${money(latest.total)}.`,
      orderId: latest.id,
    };
  }

  const products = (await getProducts({ perPage: 1000 })).data;
  const inStockFirst = (a: Product, b: Product) => Number(b.stock > 0) - Number(a.stock > 0);
  
  // 3. Recommendations: the best rated products
  if (/\b(recommend|recommendation|recommendations|best|popular|top)\b/.test(text)) {
    const top = products
      .filter((p) => p.stock > 0)
      .sort((a, b) => b.rating - a.rating || b.review_count - a.review_count)
      .slice(0, 4);
      return { text: "Here are our top rated products right now.", products: top };
  }

  // 4. Search by words and by price ("headphones under $50")
  const priceMatch = text.match(/(?:under|below|less than|max)\s*\$?\s*(\d+(?:\.\d+)?)/);
  const maxPrice = priceMatch ? Number(priceMatch[1]) : undefined;
  const words = text
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w))
    .map(stem);

  if (words.length === 0 && maxPrice === undefined) {
    return { text: `Tell me what you are looking for, for example: "headphones under $50"` };
  }

  const found = products
    .filter((p) => {
      const haystack = `${p.name} ${p.brand}, ${p.description}`.toLowerCase();
      const wordOK = words.length === 0 || words.some((w) => haystack.includes(w));
      const priceOK = maxPrice === undefined || p.price <= maxPrice;
      return wordOK && priceOK;
    })
    .sort(inStockFirst)
    .slice(0, 4);

  if (found.length === 0) {
    return { text: "I could not find a matching product. Try other words, or ask for recommendations." };
  }
  return { text: `I found ${found.length} product${found.length === 1 ? "" : "s"} for you:`, products: found};
}