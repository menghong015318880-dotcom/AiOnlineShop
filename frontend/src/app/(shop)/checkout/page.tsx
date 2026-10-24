"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FiArrowLeft, FiArrowRight, FiCheckCircle, FiCreditCard, FiDollarSign, FiLock,
  FiMail, FiMapPin, FiPhone, FiShoppingCart, FiUser,
} from "react-icons/fi";
import OrderSummary from "@/components/checkout/OrderSummary";
import Stepper from "@/components/checkout/Stepper";
import { COMMUNES, DISTRICTS, PROVINCES } from "@/lib/cambodia-locations";
import { DISCOUNT_CODES, calcTotals, money } from "@/lib/pricing";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/services/orders";
import type { Order, PaymentMethod, ShippingInfo } from "@/types";

const ADDRESS_KEY = "smartshop-address"; // saved address ("Save this address for next time")

type Errors = Partial<Record<keyof ShippingInfo, string>>;

const PAYMENT_OPTIONS: { value: PaymentMethod; title: string; text: string }[] = [
  { value: "card", title: "Credit / Debit Card", text: "Visa, Mastercard, JCB" },
  { value: "aba", title: "ABA Bank", text: "Pay with ABA Bank" },
  { value: "cash_on_delivery", title: "Cash on Delivery", text: "Pay when you receive your order" },
];

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  card: "Credit / Debit Card",
  aba: "ABA Bank",
  cash_on_delivery: "Cash on Delivery",
};

// ---------- Validation ----------
function validate(f: ShippingInfo): Errors {
  const e: Errors = {};
  if (f.full_name.trim().length < 2) e.full_name = "Please enter your full name";
  if (!/^\+?[0-9\s-]{8,15}$/.test(f.phone.trim())) e.phone = "Please enter a valid phone number";
  if (f.email.trim() && !/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = "Please enter a valid email";
  if (f.address.trim().length < 5) e.address = "Please enter your street address";
  if (!f.province) e.province = "Please select a province";
  if (!f.district.trim()) e.district = "Please select a district";
  if (!f.commune.trim()) e.commune = "Please select a commune";
  return e;
}

// ---------- Small form components ----------
interface TextFieldProps {
  label: string;
  required?: boolean;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  type?: string;
  autoComplete?: string;
}

// Text box with an icon on the left and an error message below
function TextField({ label, required, icon, value, onChange, placeholder, error, type = "text", autoComplete }: TextFieldProps) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-900">
        {label} {required && <span className="text-red-500">*</span>}
        <div className={`mt-1 flex items-center gap-2 rounded-lg border bg-white px-3 ${error ? "border-red-400" : "border-gray-300"}`}>
          <span className="text-gray-400">{icon}</span>
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className="w-full min-w-0 py-2.5 text-sm font-normal outline-none"
          />
        </div>
      </label>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface PlaceFieldProps {
  label: string;
  value: string;
  options: string[];      // empty list = show a text box instead of a select
  waiting?: boolean;      // true = the parent (province/district) is not chosen yet
  placeholder: string;
  error?: string;
  onChange: (value: string) => void;
}

// Province / District / Commune: a select when we have the list, otherwise a text box
function PlaceField({ label, value, options, waiting, placeholder, error, onChange }: PlaceFieldProps) {
  const boxClass = `mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm font-normal outline-none ${
    error ? "border-red-400" : "border-gray-300"
  }`;

  return (
    <div>
      <label className="text-sm font-medium text-gray-900">
        {label} <span className="text-red-500">*</span>
        {waiting || options.length > 0 ? (
          <select
            value={value}
            disabled={waiting}
            onChange={(e) => onChange(e.target.value)}
            className={`${boxClass} disabled:bg-gray-50 disabled:text-gray-400`}
          >
            <option value="">{placeholder}</option>
            {options.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        ) : (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Type your ${label.toLowerCase()}`}
            className={boxClass}
          />
        )}
      </label>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ---------- Page ----------
// useSearchParams must be inside <Suspense> in Next.js.
export default function CheckoutPage() {
  return (
    <Suspense fallback={<p className="py-20 text-center text-gray-500">Loading...</p>}>
      <CheckoutRoute />
    </Suspense>
  );
}

// The cart page opens /checkout?items=1,4 with the ids of the selected items.
function CheckoutRoute() {
  const searchParams = useSearchParams();
  const itemsParam = searchParams.get("items") ?? "";
  return <Checkout key={itemsParam} itemsParam={itemsParam} />;
}

function Checkout({ itemsParam }: { itemsParam: string }) {
  const { items, ready, updateQuantity, removeItem, removeMany } = useCart();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<ShippingInfo>({
    full_name: "", phone: "", email: "", address: "", province: "Phnom Penh", district: "", commune: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [saveAddress, setSaveAddress] = useState(true);
  const [payment, setPayment] = useState<PaymentMethod>("card");

  const [codeText, setCodeText] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [codeMessage, setCodeMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const idempotencyKey = useRef(""); // one key per checkout attempt

  // Which cart items are being bought: the ids in the URL, or all items
  const checkoutItems = useMemo(() => {
    if (!itemsParam) return items;
    const ids = itemsParam.split(",").map(Number);
    return items.filter((i) => ids.includes(i.product_id));
  }, [items, itemsParam]);

  const totals = calcTotals(checkoutItems, coupon?.percent ?? 0);

  // Fill the form with the address saved last time
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ADDRESS_KEY);
      if (saved) setForm((prev) => ({ ...prev, ...(JSON.parse(saved) as Partial<ShippingInfo>) }));
    } catch {
      // Ignore broken or blocked storage
    }
  }, []);

  const goToStep = (next: 1 | 2 | 3) => {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Change one field. Changing the province or district clears the lower levels.
  const setField = (key: keyof ShippingInfo, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "province") { next.district = ""; next.commune = ""; }
      if (key === "district") { next.commune = ""; }
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const applyCode = () => {
    const code = codeText.trim().toUpperCase();
    if (!code) return;
    const percent = DISCOUNT_CODES[code];
    if (percent) {
      setCoupon({ code, percent });
      setCodeMessage(`Code ${code} applied (-${percent}%)`);
    } else {
      setCoupon(null);
      setCodeMessage("This discount code is not valid");
    }
  };

  // Step 1 -> 2
  const continueToPayment = () => {
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    try {
      if (saveAddress) localStorage.setItem(ADDRESS_KEY, JSON.stringify(form));
      else localStorage.removeItem(ADDRESS_KEY);
    } catch {
      // Ignore broken or blocked storage
    }
    goToStep(2);
  };

  // Step 2 -> 3: create the order
  const placeOrder = async () => {
    if (submitting) return; // protects against double clicks
    setSubmitting(true);
    setSubmitError("");

    // The same key is reused if the user retries, so one order is never created twice
    if (!idempotencyKey.current) idempotencyKey.current = crypto.randomUUID();

    try {
      const created = await createOrder({
        items: checkoutItems.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        shipping: form,
        payment_method: payment,
        discount_code: coupon?.code,
        idempotency_key: idempotencyKey.current,
      });
      removeMany(checkoutItems.map((i) => i.product_id)); // remove the ordered items from the cart
      setOrder(created);
      goToStep(3);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not place the order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Wait until the saved cart is loaded
  if (!ready) return <p className="py-20 text-center text-gray-500">Loading...</p>;

  // ===== Step 3: confirmation =====
  if (order) {
    return (
      <div className="mx-auto max-w-2xl py-6">
        <div className="mb-6 flex justify-center"><Stepper current={3} /></div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
          <FiCheckCircle className="mx-auto text-5xl text-green-500" />
          <h1 className="mt-3 text-2xl font-bold text-gray-900">Thank you for your order!</h1>
          <p className="mt-1 text-sm text-gray-600">We have received your order and will contact you soon.</p>
          <p className="mt-4 text-sm text-gray-600">Order number</p>
          <p className="text-xl font-bold text-blue-600">{order.order_number}</p>
        </div>

        <div className="mt-4 grid gap-4 rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-700 sm:grid-cols-2">
          <div>
            <h2 className="font-semibold text-gray-900">Delivery to</h2>
            <p className="mt-2">{order.shipping.full_name}</p>
            <p>{order.shipping.phone}</p>
            <p>{order.shipping.address}</p>
            <p>{order.shipping.commune}, {order.shipping.district}, {order.shipping.province}</p>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Payment</h2>
            <p className="mt-2">{PAYMENT_LABEL[order.payment_method]}</p>
            <p>Status: {order.payment_status === "paid" ? "Paid" : "Pay on delivery"}</p>
            <p className="mt-2">Order status: <span className="font-medium capitalize">{order.status}</span></p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-700">
          <h2 className="font-semibold text-gray-900">Items</h2>
          <ul className="mt-3 space-y-2">
            {order.items.map((i) => (
              <li key={i.product_id} className="flex justify-between gap-4">
                <span>{i.name} × {i.quantity}</span>
                <span>{money(i.line_total)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-gray-200 pt-4">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Discount</dt><dd className="text-green-600">-{money(order.discount)}</dd></div>
            <div className="flex justify-between"><dt>Shipping</dt><dd>{order.delivery_fee === 0 ? "Free" : money(order.delivery_fee)}</dd></div>
            <div className="flex justify-between text-lg font-bold text-gray-900"><dt>Total</dt><dd>{money(order.total)}</dd></div>
          </dl>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/orders"
            className="flex items-center justify-center rounded-lg border border-blue-600 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50"
          >
            View My Orders
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // ===== Nothing to buy =====
  if (checkoutItems.length === 0) {
    return (
      <div className="py-20 text-center">
        <FiShoppingCart className="mx-auto text-5xl text-gray-300" />
        <p className="mt-4 text-gray-700">There are no items to check out.</p>
        <Link href="/cart" className="mt-3 inline-block text-blue-600 hover:underline">
          Back to Cart
        </Link>
      </div>
    );
  }

  // Lists for the address selects
  const districtOptions = DISTRICTS[form.province] ?? [];
  const communeOptions = COMMUNES[`${form.province}|${form.district}`] ?? [];

  return (
    <div className="py-2">
      {/* Title and steps */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {step === 1 ? (
            <Link href="/cart" className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600">
              <FiArrowLeft /> Back to Cart
            </Link>
          ) : (
            <button onClick={() => goToStep(1)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600">
              <FiArrowLeft /> Back to Shipping
            </button>
          )}
          <div className="mt-3 flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-2xl text-white">
              <FiShoppingCart />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
              <p className="text-sm text-gray-600">Complete your order and get your products delivered</p>
            </div>
          </div>
        </div>
        <Stepper current={step} />
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* ===== Left column ===== */}
        <div className="space-y-4">
          {step === 1 && (
            <>
              {/* Shipping information */}
              <section className="rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <FiMapPin className="text-blue-600" /> Shipping Information
                </h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Full Name" required icon={<FiUser />} autoComplete="name"
                    placeholder="Enter your full name"
                    value={form.full_name} error={errors.full_name}
                    onChange={(v) => setField("full_name", v)}
                  />
                  <TextField
                    label="Phone Number" required icon={<FiPhone />} type="tel" autoComplete="tel"
                    placeholder="Enter your phone number"
                    value={form.phone} error={errors.phone}
                    onChange={(v) => setField("phone", v)}
                  />
                </div>

                <div className="mt-4 space-y-4">
                  <TextField
                    label="Email Address" icon={<FiMail />} type="email" autoComplete="email"
                    placeholder="Enter your email (optional)"
                    value={form.email} error={errors.email}
                    onChange={(v) => setField("email", v)}
                  />
                  <TextField
                    label="Address" required icon={<FiMapPin />} autoComplete="street-address"
                    placeholder="Street address, house number, etc."
                    value={form.address} error={errors.address}
                    onChange={(v) => setField("address", v)}
                  />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <PlaceField
                    label="Province" placeholder="Select province"
                    value={form.province} options={PROVINCES} error={errors.province}
                    onChange={(v) => setField("province", v)}
                  />
                  <PlaceField
                    label="District" placeholder="Select district"
                    value={form.district} options={districtOptions} error={errors.district}
                    onChange={(v) => setField("district", v)}
                  />
                  <PlaceField
                    label="Commune" placeholder="Select commune"
                    value={form.commune} options={communeOptions} error={errors.commune}
                    // Wait for the district only when we have a list of districts
                    waiting={districtOptions.length > 0 && !form.district}
                    onChange={(v) => setField("commune", v)}
                  />
                </div>

                <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="h-4 w-4 accent-blue-600"
                  />
                  Save this address for next time
                </label>
              </section>

              {/* Payment method */}
              <section className="rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <FiCreditCard className="text-blue-600" /> Payment Method
                </h2>

                <div className="mt-4 space-y-3">
                  {PAYMENT_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${
                        payment === opt.value ? "border-blue-600 bg-blue-50" : "border-gray-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={payment === opt.value}
                        onChange={() => setPayment(opt.value)}
                        className="h-4 w-4 accent-blue-600"
                      />
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-xl text-blue-600">
                        {opt.value === "cash_on_delivery" ? <FiDollarSign /> : opt.value === "aba" ? <span className="text-xs font-bold">ABA</span> : <FiCreditCard />}
                      </span>
                      <span className="text-sm">
                        <span className="block font-medium text-gray-900">{opt.title}</span>
                        <span className="block text-xs text-gray-500">{opt.text}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              <button
                onClick={continueToPayment}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                <FiLock /> Continue to Payment <FiArrowRight />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              {/* Review before placing the order */}
              <section className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                    <FiMapPin className="text-blue-600" /> Delivery to
                  </h2>
                  <button onClick={() => goToStep(1)} className="text-sm text-blue-600 hover:underline">Edit</button>
                </div>
                <p className="mt-3 font-medium text-gray-900">{form.full_name}</p>
                <p>{form.phone}{form.email && ` · ${form.email}`}</p>
                <p>{form.address}</p>
                <p>{form.commune}, {form.district}, {form.province}</p>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                    <FiCreditCard className="text-blue-600" /> Payment
                  </h2>
                  <button onClick={() => goToStep(1)} className="text-sm text-blue-600 hover:underline">Change</button>
                </div>
                <p className="mt-3 font-medium text-gray-900">{PAYMENT_LABEL[payment]}</p>
                <p className="mt-1">
                  {payment === "cash_on_delivery"
                    ? `You will pay ${money(totals.total)} in cash when you receive your order.`
                    : "This is a demo payment: no money is charged and no card details are needed."}
                </p>
              </section>

              {submitError && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{submitError}</p>
              )}

              <button
                onClick={placeOrder}
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                <FiLock /> {submitting ? "Placing your order..." : `Place Order · ${money(totals.total)}`}
              </button>
            </>
          )}
        </div>

        {/* ===== Right column ===== */}
        <OrderSummary
          items={checkoutItems}
          totals={totals}
          onQuantityChange={updateQuantity}
          onRemove={removeItem}
          codeText={codeText}
          onCodeChange={setCodeText}
          onApplyCode={applyCode}
          codeMessage={codeMessage}
          codeApplied={coupon !== null}
        />
      </div>
    </div>
  );
}