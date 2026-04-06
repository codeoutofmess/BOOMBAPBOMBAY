import { Router } from "express";
import { getOrderByInternalId } from "../services/orderStore.js";
import { getDownloadUrl } from "../services/storageService.js";
import { db } from "../config/db.js";

const router = Router();

router.get("/:internalOrderId", async (req, res) => {
  try {
    const { internalOrderId } = req.params;

    // 1. get order
    const order = await getOrderByInternalId(internalOrderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // 2. check payment
    if (order.status !== "paid") {
      if (!order.razorpayPaymentId) {
  return res.status(403).json({ error: "Invalid payment state" });
}
      return res.status(403).json({ error: "Order not paid" });
    }

    // 3. get product file path
    const result = await db.query(
  `
  select file_path
  from products
  where id = $1
  limit 1
  `,
  [order.productId]
);

    const filePath = result.rows[0]?.file_path;

    if (!filePath) {
      return res.status(404).json({ error: "No file for this product" });
    }

    // 4. generate signed URL
    const url = await getDownloadUrl(filePath);

    console.log("Download granted:", {
  internalOrderId,
  productId: order.product_id,
  time: new Date().toISOString(),
});

await db.query(
  `
  update orders
  set
    download_count = coalesce(download_count, 0) + 1,
    first_downloaded_at = coalesce(first_downloaded_at, now()),
    last_downloaded_at = now()
  where internal_order_id = $1
  `,
  [internalOrderId]
);    

return res.redirect(url);
  } catch (error) {
    console.error("Download error:", error);
    return res.status(500).json({ error: "Download failed" });
  }
});

export default router;