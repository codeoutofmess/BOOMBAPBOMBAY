import { Router } from "express";
import { getOrderByInternalId } from "../services/orderStore.js";
import { getDownloadUrl } from "../services/storageService.js";
import { db } from "../config/db.js";

const router = Router();

router.get("/:internalOrderId/:productId", async (req, res) => {
  try {
    const { internalOrderId, productId } = req.params;

    const order = await getOrderByInternalId(internalOrderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== "paid") {
      if (!order.razorpayPaymentId) {
        return res.status(403).json({ error: "Invalid payment state" });
      }
      return res.status(403).json({ error: "Order not paid" });
    }

    const itemResult = await db.query(
      `
      select file_path_snapshot
      from order_items
      where internal_order_id = $1
        and product_id = $2
      limit 1
      `,
      [internalOrderId, productId]
    );

    const filePath = itemResult.rows[0]?.file_path_snapshot;

    if (!filePath) {
      return res.status(404).json({ error: "Purchased item not found for this order" });
    }

    const url = await getDownloadUrl(filePath);

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
    console.error("Item download error:", error);
    return res.status(500).json({ error: "Download failed" });
  }
});

router.get("/:internalOrderId", async (req, res) => {
  try {
    const { internalOrderId } = req.params;

    const order = await getOrderByInternalId(internalOrderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== "paid") {
      if (!order.razorpayPaymentId) {
        return res.status(403).json({ error: "Invalid payment state" });
      }
      return res.status(403).json({ error: "Order not paid" });
    }

    if (order.isCartOrder) {
      return res.status(400).json({
        error: "Cart orders require an item-specific download URL",
      });
    }

    if (!order.productId) {
      return res.status(404).json({ error: "No product found for this order" });
    }

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

    const url = await getDownloadUrl(filePath);

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