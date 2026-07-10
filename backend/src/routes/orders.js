import { Router } from "express";
import { razorpay } from "../config/razorpay.js";
import { env } from "../config/env.js";
import { products } from "../data/products.js";
import { createLocalOrder, setRazorpayOrderId } from "../services/orderStore.js";

const router = Router();

router.post("/create", async (req, res) => {
  try {
    const { productId } = req.body;

    const product = products[productId];
    if (!product) {
      return res.status(400).json({ error: "Invalid productId" });
    }

    const localOrder = createLocalOrder(product);

    const razorpayOrder = await razorpay.orders.create({
      amount: product.amount,
      currency: product.currency,
      receipt: localOrder.internalOrderId,
      notes: {
        internalOrderId: localOrder.internalOrderId,
        productId: product.id,
        productType: product.type,
        title: product.title,
      },
    });

    setRazorpayOrderId(localOrder.internalOrderId, razorpayOrder.id);

    return res.json({
      keyId: env.razorpayKeyId,
      internalOrderId: localOrder.internalOrderId,
      razorpayOrderId: razorpayOrder.id,
      amount: product.amount,
      currency: product.currency,
    });
  } catch (error) {
    console.error("Create order failed:", error);
    return res.status(500).json({ error: "Failed to create order" });
  }
});

export default router;