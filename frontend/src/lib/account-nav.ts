import type { IconType } from "react-icons";
import {
  FiClipboard, FiHeadphones, FiHelpCircle, FiHome, FiMapPin, FiPlusCircle, FiTruck,
} from "react-icons/fi";

export interface AccountNavItem {
  label: string;
  href: string;
  Icon: IconType;
  ready: boolean; // false = the page is not built yet (shown as "Soon")
}

export interface AccountNavGroup {
  title?: string;
  items: AccountNavItem[];
}

// The menu of the customer account. Change "ready" to true when you build a page.
export const ACCOUNT_NAV_GROUPS: AccountNavGroup[] = [
  {
    items: [
      { label: "Home", href: "/account", Icon: FiHome, ready: true },
      { label: "Create Order", href: "/", Icon: FiPlusCircle, ready: true },
      { label: "My Orders", href: "/account/orders", Icon: FiClipboard, ready: true },
      { label: "Track Parcel", href: "/account#track", Icon: FiTruck, ready: true },
      { label: "My Address", href: "/account/addresses", Icon: FiMapPin, ready: false },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Contact Us", href: "/contact", Icon: FiHeadphones, ready: true },
      { label: "Help Center", href: "/help", Icon: FiHelpCircle, ready: false },
    ],
  },
];

// Is the page at this link built? Links that are not in the menu are always ready.
export function isAccountPageReady(href: string): boolean {
  const item = ACCOUNT_NAV_GROUPS.flatMap((g) => g.items).find((i) => i.href === href);
  return item ? item.ready : true;
}