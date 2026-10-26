import type { IconType } from "react-icons";
import { FiBox, FiHome, FiMapPin, FiPlusCircle, FiTruck } from "react-icons/fi";

export interface AccountNavItem {
  label: string;
  href: string;
  Icon: IconType;
  ready: boolean; // False = the page is not built yet (shown as "Soon")
}

// The menu of the customer account. Change "ready" to true when you build a page.
export const ACCOUNT_NAV: AccountNavItem[] = [
  { label: "Dashboard", href: "/account", Icon: FiHome, ready: true },
  { label: "Create Order", href: "/", Icon: FiPlusCircle, ready: true },
  { label: "My Order", href: "/orders", Icon: FiBox, ready: true },
  { label: "Track Parcel", href: "/account#track", Icon: FiTruck, ready: true },
  { label: "My Address", href: "/account/address", Icon: FiMapPin, ready: false },
];

// Is the page at this link built?
// Links that are not in the menu are always ready.
export function isAccountPageReady(href: string): boolean {
  const item = ACCOUNT_NAV.find((i) => i.href === href);
  return item ? item.ready : true;
}