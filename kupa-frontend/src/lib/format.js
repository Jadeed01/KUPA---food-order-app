// Change the symbol here to switch currency everywhere (e.g. "₦")
export const formatPrice = (n) => `$${Number(n).toFixed(2)}`;

export const formatExtra = (n) => {
  const v = Number(n);
  return `$${Number.isInteger(v) ? v : v.toFixed(2)}`;
};
export const formatDate = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });