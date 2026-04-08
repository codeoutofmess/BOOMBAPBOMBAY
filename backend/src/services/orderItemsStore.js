import { db } from "../config/db.js";

export async function createOrderItems(internalOrderId, items) {
  for (const item of items) {
    await db.query(
      `
      insert into order_items (
        internal_order_id,
        product_id,
        title_snapshot,
        type_snapshot,
        unit_price_minor,
        quantity,
        line_total_minor,
        file_path_snapshot
      )
      values ($1,$2,$3,$4,$5,$6,$7,$8)
      `,
      [
        internalOrderId,
        item.product_id,
        item.title,
        item.type,
        item.unit_price,
        item.quantity,
        item.line_total,
        item.file_path,
      ]
    );
  }
}