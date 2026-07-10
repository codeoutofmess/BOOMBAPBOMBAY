import crypto from "crypto";
import Razorpay from "razorpay";

import { db } from "../config/db.js";
import { env } from "../config/env.js";
import { getProductById } from "./productStore.js";
import { createOrderItems } from "./orderItemsStore.js";

const razorpay = new Razorpay({
  key_id: env.razorpayKeyId,
  key_secret: env.razorpayKeySecret,
});

export async function createCartOrder(req, res) {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const validatedItems = [];
    let totalAmount = 0;
    let totalItemCount = 0;

    for (const rawItem of items) {
      const productId = rawItem.productId;
      const quantity = Number(rawItem.quantity || 1);

      if (!productId) {
        return res.status(400).json({ error: "Missing productId" });
      }

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ error: "Invalid quantity" });
      }

      const product = await getProductById(productId);

      if (!product) {
        return res.status(400).json({ error: `Product not found: ${productId}` });
      }

      if (!product.isActive) {
        return res.status(400).json({ error: `Product inactive: ${productId}` });
      }

      if (!product.file_path) {
        return res.status(400).json({ error: `Missing file_path: ${productId}` });
      }

      const lineTotal = product.amount * quantity;

      validatedItems.push({
        product_id: product.id,
        title: product.title,
        type: product.type,
        unit_price: product.amount,
        quantity,
        line_total: lineTotal,
        file_path: product.file_path,
      });

      totalAmount += lineTotal;
      totalItemCount += quantity;
    }

    const internalOrderId = `bbb_${crypto.randomUUID()}`;

    await db.query(
      `
      insert into orders (
        internal_order_id,
        status,
        amount_minor,
        currency,
        item_count
      )
      values ($1,$2,$3,$4,$5)
      `,
      [internalOrderId, "created", totalAmount, "INR", totalItemCount]
    );

    await createOrderItems(internalOrderId, validatedItems);

    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount,
      currency: "INR",
      receipt: internalOrderId,
    });

    await db.query(
      `
      update orders
      set razorpay_order_id = $1
      where internal_order_id = $2
      `,
      [razorpayOrder.id, internalOrderId]
    );

    return res.json({
      success: true,
      order: {
        internalOrderId,
        razorpayOrderId: razorpayOrder.id,
        amount: totalAmount,
        currency: "INR",
        key: env.razorpayKeyId,
        itemCount: totalItemCount,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Cart checkout failed" });
  }
}