import { FiCheckCircle, FiClock, FiRefreshCw, FiTruck, FiXCircle } from "react-icons/fi";
import type { OrderStatus } from "@/types";

// Label, color and icon of each order status.
// "confirmed" is shown as "Processing" (the name used in the design).
const META: Record<OrderStatus, { label: string; className: string; Icon: React.ElementType }> = {
  pending: { label: "Pending", className: "bg-gray-100 text-gray-600", Icon: FiClock },
  confirmed: { label: "Processing", className: "bg-orange-100 text-orange-600", Icon: FiRefreshCw },
  shipped: { label: "Shipped", className: "bg-blue-100 text-blue-600", Icon: FiTruck },
  delivered: { label: "Delivered", className: "bg-green-100 text-green-600", Icon: FiCheckCircle },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-600", Icon: FiXCircle },
};

// The name shown to the customer for a status
export const statusLabel = (status: OrderStatus) => META[status].label;

// Small colored pill, e.g. "Delivered" with a check icon
export default function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, className, Icon } = META[status];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${className}`}>
      <Icon className="text-sm" />
      {label}
    </span>
  );
}