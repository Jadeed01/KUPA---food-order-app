export const STATUS_STEPS = [
  { key: "pending", label: "Order placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "on_the_way", label: "On the way" },
  { key: "delivered", label: "Delivered" },
];

export const statusStyle = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-sky-50 text-sky-700",
  preparing: "bg-orange-50 text-orange-700",
  on_the_way: "bg-indigo-50 text-indigo-700",
  delivered: "bg-kupa-50 text-kupa-700",
  cancelled: "bg-red-50 text-red-600",
};

export const paymentLabel = {
  cash: "Cash on delivery",
  card: "Card (simulated)",
};