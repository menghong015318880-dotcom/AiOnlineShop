import { redirect } from "next/navigation";

// The order list now lives in the account area, with the sidebar.
// This keeps the old links (header menu, checkout, ...) working.
export default function OrdersPage() {
  redirect("/account/orders");
}