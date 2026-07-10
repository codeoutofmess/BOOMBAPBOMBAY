import { db } from "../config/db.js";

export async function getProductById(productId) {
  const result = await db.query(
    `
    select id, title, type, price_minor, currency, is_active
    from products
    where id = $1
    limit 1
    `,
    [productId]
  );

  if (!result.rows.length) return null;

  const row = result.rows[0];

  return {
    id: row.id,
    title: row.title,
    type: row.type,
    amount: row.price_minor,
    currency: row.currency,
    isActive: row.is_active,
  };
}