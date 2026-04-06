import { Router } from "express";
import crypto from "crypto";
import { markOrderPaid } from "../services/orderStore.js";

const router = Router();

router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      internalOrderId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !internalOrderId
    ) {
      return res.status(400).json({ error: "Missing verification fields" });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return res.status(500).json({ error: "Missing Razorpay secret in backend" });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
  return res.status(400).json({ error: "Invalid payment signature" });
}

// 🔥 THIS IS THE MISSING PIECE
await markOrderPaid({
  internalOrderId,
  razorpayOrderId: razorpay_order_id,
  razorpayPaymentId: razorpay_payment_id,
});

return res.json({
  success: true,
  internalOrderId,
  razorpayOrderId: razorpay_order_id,
  razorpayPaymentId: razorpay_payment_id,
});
  } catch (error) {
    console.error("Payment verification failed:", error);
    return res.status(500).json({ error: "Payment verification failed" });
  }
});

export default router;