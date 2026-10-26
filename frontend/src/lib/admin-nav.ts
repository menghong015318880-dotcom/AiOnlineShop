import type { IconType } from "react-icons";
import { FiBox, FiGrid, FiHome, FiShoppingCart } from "react-icons/fi";

export interface AdminNavItem {
  label: string;
  href: string;
  Icon: IconType;
  ready: boolean; // false = the page is not built yet (shown as "Soon")
}

export interface AdminNavGroup {
  title?: string;
  items: AdminNavItem[];
}

// Only the pages of the project scope. More items (Customers, Reports, ...) wait for semester 2.
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  { items: [{ label: "Dashboard", href: "/admin", Icon: FiHome, ready: true }] },
  {
    title: "Order Management",
    items: [{ label: "Orders", href: "/admin/orders", Icon: FiShoppingCart, ready: false }],
  },
  {
    title: "Product Management",
    items: [
      { label: "Products", href: "/admin/products", Icon: FiBox, ready: false },
      { label: "Categories", href: "/admin/categories", Icon: FiGrid, ready: false },
    ],
  },
];

// Is the page at this link built? Links that are not in the menu (like "/") are always ready.
export function isAdminPageReady(href: string): boolean {
  const item = ADMIN_NAV_GROUPS.flatMap((g) => g.items).find((i) => i.href === href);
  return item ? item.ready : true;
}