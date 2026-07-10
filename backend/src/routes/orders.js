import { Router } from "express";
import { razorpay } from "../config/razorpay.js";
import { env } from "../config/env.js";
import { getProductById } from "../services/productStore.js";
import {
  createLocalOrder,
  setRazorpayOrderId,
  getOrderByInternalId,
} from "../services/orderStore.js";

const router = Router();

router.post("/create", async (req, res) => {
  try {
    const { productId } = req.body;

    const product = await getProductById(productId);
    if (!product || !product.isActive) {
      return res.status(400).json({ error: "Invalid productId" });
    }

    const localOrder = await createLocalOrder(product);

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

    await setRazorpayOrderId(localOrder.internalOrderId, razorpayOrder.id);

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

router.get("/:internalOrderId", async (req, res) => {
  try {
    const { internalOrderId } = req.params;
    const order = await getOrderByInternalId(internalOrderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    return res.json({
      internalOrderId: order.internalOrderId,
      productId: order.productId,
      productType: order.productType,
      title: order.title,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      razorpayOrderId: order.razorpayOrderId,
      razorpayPaymentId: order.razorpayPaymentId,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      downloadCount: order.downloadCount,
firstDownloadedAt: order.firstDownloadedAt,
lastDownloadedAt: order.lastDownloadedAt,
    });
  } catch (error) {
    console.error("Get order failed:", error);
    return res.status(500).json({ error: "Failed to fetch order" });
  }
});

export default router;