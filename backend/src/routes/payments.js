import { Router } from "express";
import crypto from "crypto";
import { markOrderPaidByRazorpayOrderId } from "../services/orderStore.js";

export function verifyRazorpaySignature(secret, orderId, paymentId, signature) {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expectedSignature, "hex");
  const providedBuf = Buffer.from(String(signature || ""), "hex");

  return (
    expectedBuf.length === providedBuf.length &&
    crypto.timingSafeEqual(expectedBuf, providedBuf)
  );
}

// Accepts its order-lookup dependency so tests can exercise the real route
// logic (including the order-binding check below) without a live database.
export function createPaymentsRouter({
  markOrderPaid = markOrderPaidByRazorpayOrderId,
} = {}) {
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

      const signatureValid = verifyRazorpaySignature(
        secret,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      if (!signatureValid) {
        return res.status(400).json({ error: "Invalid payment signature" });
      }

      // Mark paid by looking up the order via the Razorpay order id that was
      // actually signed for — never trust the client-supplied internalOrderId
      // as the target of the update, or a valid signature for a cheap order
      // could be replayed to mark a different, more expensive order as paid.
      const updated = await markOrderPaid(razorpay_order_id, razorpay_payment_id);

      if (!updated) {
        return res.status(404).json({ error: "Order not found for this payment" });
      }

      if (updated.internalOrderId !== internalOrderId) {
        return res.status(400).json({ error: "Order mismatch" });
      }

      return res.json({
        success: true,
        internalOrderId: updated.internalOrderId,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      });
    } catch (error) {
      console.error("Payment verification failed:", error);
      return res.status(500).json({ error: "Payment verification failed" });
    }
  });

  return router;
}

export default createPaymentsRouter();
