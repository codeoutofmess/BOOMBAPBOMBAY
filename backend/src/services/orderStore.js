import crypto from "crypto";
import { db } from "../config/db.js";

// CREATE ORDER (before payment)
export async function createLocalOrder(product) {
  const internalOrderId = crypto.randomUUID();

  const result = await db.query(
    `
    insert into orders (
      internal_order_id,
      product_id,
      product_type,
      title,
      amount_minor,
      currency,
      status
    )
    values ($1, $2, $3, $4, $5, $6, 'created')
    returning
      internal_order_id,
      product_id,
      product_type,
      title,
      amount_minor,
      currency,
      status,
      created_at
    `,
    [
      internalOrderId,
      product.id,
      product.type,
      product.title,
      product.amount,
      product.currency,
    ]
  );

  const row = result.rows[0];

  return {
    internalOrderId: row.internal_order_id,
    productId: row.product_id,
    productType: row.product_type,
    title: row.title,
    amount: row.amount_minor,
    currency: row.currency,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function setRazorpayOrderId(internalOrderId, razorpayOrderId) {
  const result = await db.query(
    `
    update orders
    set razorpay_order_id = $2
    where internal_order_id = $1
    returning internal_order_id, product_id, amount_minor, currency, status, razorpay_order_id, created_at
    `,
    [internalOrderId, razorpayOrderId]
  );

  if (!result.rows.length) return null;

  const row = result.rows[0];

  return {
    internalOrderId: row.internal_order_id,
    productId: row.product_id,
    amount: row.amount_minor,
    currency: row.currency,
    status: row.status,
    razorpayOrderId: row.razorpay_order_id,
    createdAt: row.created_at,
  };
}

// MARK ORDER AS PAID (after verification)
export async function markOrderPaid({
  internalOrderId,
  razorpayOrderId,
  razorpayPaymentId,
}) {
  const result = await db.query(
    `
    update orders
    set
      status = 'paid',
      razorpay_order_id = $2,
      razorpay_payment_id = $3,
      paid_at = now()
    where internal_order_id = $1
    returning *
    `,
    [internalOrderId, razorpayOrderId, razorpayPaymentId]
  );

  return result.rows[0];
}

// GET ORDER (for success page)
export async function getOrderById(internalOrderId) {
  const result = await db.query(
    `
    select o.*, p.title, p.type
    from orders o
    join products p on p.id = o.product_id
    where o.internal_order_id = $1
    limit 1
    `,
    [internalOrderId]
  );

  if (!result.rows.length) return null;

  const row = result.rows[0];

  return {
  internalOrderId: row.internal_order_id,
  productId: row.product_id,
  productType: row.product_type || row.type,
  title: row.title,
  amount: row.amount_minor,
  currency: row.currency,
  status: row.status,
  razorpayOrderId: row.razorpay_order_id,
  razorpayPaymentId: row.razorpay_payment_id,
  createdAt: row.created_at,
  paidAt: row.paid_at,
  downloadCount: row.download_count,
  firstDownloadedAt: row.first_downloaded_at,
  lastDownloadedAt: row.last_downloaded_at,
};
}

export async function markOrderPaidByRazorpayOrderId(
  razorpayOrderId,
  razorpayPaymentId
) {
  const result = await db.query(
    `
    update orders
    set
      status = 'paid',
      razorpay_payment_id = $2,
      paid_at = now()
    where razorpay_order_id = $1
    returning internal_order_id, product_id, amount_minor, currency, status, paid_at
    `,
    [razorpayOrderId, razorpayPaymentId]
  );

  if (!result.rows.length) return null;

  const row = result.rows[0];

  return {
    internalOrderId: row.internal_order_id,
    productId: row.product_id,
    amount: row.amount_minor,
    currency: row.currency,
    status: row.status,
    paidAt: row.paid_at,
  };
}

export async function getOrderByInternalId(internalOrderId) {
  return getOrderById(internalOrderId);
}