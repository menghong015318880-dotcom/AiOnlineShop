"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FaRobot } from "react-icons/fa";
import { FiHelpCircle, FiSearch, FiSend, FiStar, FiTruck } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { money } from "@/lib/pricing";
import { getAiReply } from "@/services/ai";
import type { Product } from "@/types";

interface Message {
  id: number;
  role: "bot" | "user";
  text: string;
  products?: Product[];
  orderId?: number;
}

// Quick questions under the greeting
const CHIPS = [
  { label: "Find products", Icon: FiSearch },
  { label: "Product recommendations", Icon: FiStar },
  { label: "Track my order", Icon: FiTruck },
  { label: "Help & Support", Icon: FiHelpCircle },
];

// The chat box of the dashboard. The answers come from services/ai.ts (a mock for now).
export default function AssistantPanel() {
  const { user } = useAuth();
  const firstName = user?.full_name.split(" ")[0] ?? "there";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "bot",
      text: `Hi ${firstName}! I'm your AI shopping assistant. How can I help you today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const nextId = useRef(1);
  const box = useRef<HTMLDivElement>(null);

  // Scroll to the newest message
  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight });
  }, [messages, busy]);

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;

    setMessages((prev) => [...prev, { id: nextId.current++, role: "user", text }]);
    setInput("");
    setBusy(true);

    try {
      const reply = await getAiReply(text);
      setMessages((prev) => [...prev, { id: nextId.current++, role: "bot", ...reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: nextId.current++, role: "bot", text: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    // id="assistant": the "Chat Now" button of the sidebar scrolls here
    <section id="assistant" className="scroll-mt-24 rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-bold text-gray-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-lg text-blue-600">
            <FaRobot />
          </span>
          AI Shopping Assistant
        </h2>
        <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs text-green-600">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Online
        </span>
      </div>

      {/* Messages */}
      <div ref={box} className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "flex justify-end" : ""}>
            <div
              className={`max-w-[90%] rounded-xl px-4 py-3 text-sm ${
                m.role === "user" ? "bg-blue-600 text-white" : "bg-blue-50 text-gray-700"
              }`}
            >
              <p>{m.text}</p>

              {m.products && (
                <ul className="mt-2 space-y-1.5">
                  {m.products.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/products/${p.id}`}
                        className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-gray-900 hover:bg-blue-100"
                      >
                        <span className="min-w-0 truncate">{p.name}</span>
                        <span className="shrink-0 font-semibold">{money(p.price)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {m.orderId !== undefined && (
                <Link href={`/orders/${m.orderId}`} className="mt-2 inline-block font-medium text-blue-600 hover:underline">
                  View order details →
                </Link>
              )}
            </div>
          </div>
        ))}

        {busy && <p className="px-1 text-xs text-gray-400">Assistant is typing...</p>}
      </div>

      {/* Quick questions */}
      <div className="mt-3 flex flex-wrap gap-2">
        {CHIPS.map(({ label, Icon }) => (
          <button
            key={label}
            onClick={() => send(label)}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 disabled:opacity-50"
          >
            <Icon /> {label}
          </button>
        ))}
      </div>

      {/* Message box */}
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={300} // a limit on the message length
          placeholder="Type your message..."
          className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="Send"
          className="flex w-11 items-center justify-center rounded-lg bg-blue-600 text-lg text-white hover:bg-blue-700 disabled:bg-blue-300"
        >
          <FiSend />
        </button>
      </form>
    </section>
  );
}