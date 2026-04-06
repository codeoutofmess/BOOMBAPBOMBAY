import { Router } from "express";
import crypto from "crypto";
import { env } from "../config/env.js";
import { markOrderPaidByRazorpayOrderId } from "../services/orderStore.js";

const router = Router();

router.post("/razorpay", async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", env.razorpayWebhookSecret)
      .update(req.body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({ error: "Invalid webhook signature" });
    }

    const event = JSON.parse(req.body.toString("utf8"));

    if (event.event === "payment.captured" || event.event === "order.paid") {
      const razorpayOrderId =
        event.payload?.payment?.entity?.order_id ||
        event.payload?.order?.entity?.id ||
        null;

      const razorpayPaymentId =
        event.payload?.payment?.entity?.id || null;

      if (razorpayOrderId) {
        const updated = await markOrderPaidByRazorpayOrderId(
          razorpayOrderId,
          razorpayPaymentId
        );

        console.log(
          "Webhook marked order paid:",
          updated?.internalOrderId || "not found"
        );
      }
    }

    return res.status(200).send("ok");
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({ error: "Webhook handling failed" });
  }
});

export default router;