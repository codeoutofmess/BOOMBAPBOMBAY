import { test, describe } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import http from "http";
import express from "express";
import { createPaymentsRouter, verifyRazorpaySignature } from "./payments.js";

const TEST_SECRET = "test_secret_do_not_use_in_prod";

function signature(orderId, paymentId, secret = TEST_SECRET) {
  return crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
}

async function startTestServer(markOrderPaid) {
  process.env.RAZORPAY_KEY_SECRET = TEST_SECRET;

  const app = express();
  app.use(express.json());
  app.use(createPaymentsRouter({ markOrderPaid }));

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  return {
    url: `http://127.0.0.1:${port}/verify`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

describe("verifyRazorpaySignature", () => {
  test("accepts a correctly signed order/payment pair", () => {
    const sig = signature("order_123", "pay_456");
    assert.equal(
      verifyRazorpaySignature(TEST_SECRET, "order_123", "pay_456", sig),
      true
    );
  });

  test("rejects a tampered signature", () => {
    const sig = signature("order_123", "pay_456");
    const tampered = sig.slice(0, -2) + (sig.slice(-2) === "00" ? "11" : "00");
    assert.equal(
      verifyRazorpaySignature(TEST_SECRET, "order_123", "pay_456", tampered),
      false
    );
  });

  test("rejects a signature computed for a different order/payment", () => {
    const sig = signature("order_123", "pay_456");
    assert.equal(
      verifyRazorpaySignature(TEST_SECRET, "order_999", "pay_456", sig),
      false
    );
  });

  test("rejects malformed/non-hex signatures without throwing", () => {
    assert.equal(
      verifyRazorpaySignature(TEST_SECRET, "order_123", "pay_456", "not-hex!!"),
      false
    );
  });
});

describe("POST /verify route", () => {
  test("marks the order paid when the signature and order binding are valid", async () => {
    let calledWith = null;
    const server = await startTestServer(async (razorpayOrderId, razorpayPaymentId) => {
      calledWith = { razorpayOrderId, razorpayPaymentId };
      return { internalOrderId: "internal_abc", status: "paid" };
    });

    try {
      const sig = signature("order_123", "pay_456");
      const res = await fetch(server.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: "order_123",
          razorpay_payment_id: "pay_456",
          razorpay_signature: sig,
          internalOrderId: "internal_abc",
        }),
      });
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.success, true);
      assert.equal(body.internalOrderId, "internal_abc");
      assert.deepEqual(calledWith, {
        razorpayOrderId: "order_123",
        razorpayPaymentId: "pay_456",
      });
    } finally {
      await server.close();
    }
  });

  test("rejects when internalOrderId does not match the order the payment actually belongs to (the fixed vulnerability)", async () => {
    // Simulates: attacker legitimately paid for order_123 (a cheap item) and
    // has a valid signature for it, but submits someone else's internalOrderId
    // ("internal_expensive") hoping to get THAT order marked paid instead.
    const server = await startTestServer(async () => ({
      internalOrderId: "internal_abc", // the order that actually matches order_123
      status: "paid",
    }));

    try {
      const sig = signature("order_123", "pay_456");
      const res = await fetch(server.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: "order_123",
          razorpay_payment_id: "pay_456",
          razorpay_signature: sig,
          internalOrderId: "internal_expensive",
        }),
      });
      const body = await res.json();

      assert.equal(res.status, 400);
      assert.equal(body.error, "Order mismatch");
    } finally {
      await server.close();
    }
  });

  test("rejects an invalid signature before ever touching the database", async () => {
    let dbWasCalled = false;
    const server = await startTestServer(async () => {
      dbWasCalled = true;
      return { internalOrderId: "internal_abc", status: "paid" };
    });

    try {
      const res = await fetch(server.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: "order_123",
          razorpay_payment_id: "pay_456",
          razorpay_signature: "0".repeat(64),
          internalOrderId: "internal_abc",
        }),
      });
      const body = await res.json();

      assert.equal(res.status, 400);
      assert.equal(body.error, "Invalid payment signature");
      assert.equal(dbWasCalled, false);
    } finally {
      await server.close();
    }
  });

  test("404s when no order matches the paid razorpay_order_id", async () => {
    const server = await startTestServer(async () => null);

    try {
      const sig = signature("order_123", "pay_456");
      const res = await fetch(server.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: "order_123",
          razorpay_payment_id: "pay_456",
          razorpay_signature: sig,
          internalOrderId: "internal_abc",
        }),
      });

      assert.equal(res.status, 404);
    } finally {
      await server.close();
    }
  });

  test("400s on missing fields", async () => {
    const server = await startTestServer(async () => null);

    try {
      const res = await fetch(server.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ razorpay_order_id: "order_123" }),
      });

      assert.equal(res.status, 400);
    } finally {
      await server.close();
    }
  });
});
