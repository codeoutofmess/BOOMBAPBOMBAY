export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export function formatInrFromMinor(amountMinor) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format((amountMinor || 0) / 100);
}

export function formatInr(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}
