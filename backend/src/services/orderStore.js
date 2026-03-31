import crypto from "crypto";

const orders = new Map();

export function createLocalOrder(product) {
  const internalOrderId = `bbb_${crypto.randomUUID()}`;

  const record = {
    internalOrderId,
    productId: product.id,
    productType: product.type,
    title: product.title,
    amount: product.amount,
    currency: product.currency,
    status: "created",
    razorpayOrderId: null,
    razorpayPaymentId: null,
    createdAt: new Date().toISOString(),
    paidAt: null,
  };

  orders.set(internalOrderId, record);
  return record;
}

export function setRazorpayOrderId(internalOrderId, razorpayOrderId) {
  const order = orders.get(internalOrderId);
  if (!order) return null;
  order.razorpayOrderId = razorpayOrderId;
  return order;
}

export function markOrderPaidByRazorpayOrderId(razorpayOrderId, razorpayPaymentId) {
  for (const order of orders.values()) {
    if (order.razorpayOrderId === razorpayOrderId) {
      order.status = "paid";
      order.razorpayPaymentId = razorpayPaymentId;
      order.paidAt = new Date().toISOString();
      return order;
    }
  }
  return null;
}

export function getOrderByInternalId(internalOrderId) {
  return orders.get(internalOrderId) || null;
}