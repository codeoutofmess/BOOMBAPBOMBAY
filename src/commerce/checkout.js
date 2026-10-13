/* Razorpay checkout, moved unchanged from the original main.js. The backend
   contract (routes, payload shapes, verify step) is exactly as before. */
import { getCartCheckoutPayload, clearCart } from "../cartStore.js";
import { API_BASE_URL } from "./config.js";
import { renderCartUI, closeCartDrawer } from "./cart-ui.js";

export async function startRazorpayCheckout(product, beat, options = {}) {
  const {
    onStart,
    onReset,
  } = options;

  try {

    if (!product?.id) {
  throw new Error("Missing product id");
}

if (!product?.type) {
  throw new Error("Missing product type");
}

if (!beat?.title) {
  throw new Error("Missing product title");
}

    if (typeof onStart === "function") onStart();

    const res = await fetch(`${API_BASE_URL}/api/orders/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: product.id,
        productType: product.type,
        title: beat.title,
        priceInr: product.priceInr,
        currency: product.currency,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to create order");
    }

    const order = await res.json();

    if (!window.Razorpay) {
      throw new Error("Razorpay SDK not loaded");
    }

    const rzp = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: "BOOM BAP BOMBAY",
      description: beat.title,
      order_id: order.razorpayOrderId,
      image: "/assets/boombap-logo.svg",

      handler: async function (response) {
        try {
          const verifyRes = await fetch(`${API_BASE_URL}/api/payments/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              internalOrderId: order.internalOrderId,
            }),
          });

          const verifyData = await verifyRes.json();

          if (!verifyRes.ok || !verifyData.success) {
            throw new Error(verifyData.error || "Payment verification failed");
          }

          window.location.href =
            `/payment-success?order_id=${encodeURIComponent(order.internalOrderId)}` +
            `&payment_id=${encodeURIComponent(response.razorpay_payment_id)}`;
        } catch (verifyError) {
          console.error("Verification error:", verifyError);
          if (typeof onReset === "function") onReset();
          alert("Payment was completed, but verification failed. Please contact support.");
        }
      },

      modal: {
        ondismiss: function () {
          console.log("Razorpay checkout closed by user");
          if (typeof onReset === "function") onReset();
        },
      },

      theme: {
        color: "#ab1212",
      },
    });

    rzp.open();
  } catch (err) {
    console.error(err);
    if (typeof onReset === "function") onReset();
    alert(err.message || "Checkout failed. Try again.");
  }
}

export async function startCartRazorpayCheckout(options = {}) {
  const { onStart, onReset } = options;

  try {
    const items = getCartCheckoutPayload();

    if (!items.length) {
      alert("Your cart is empty.");
      return;
    }

    if (typeof onStart === "function") onStart();

    const res = await fetch(`${API_BASE_URL}/api/cart/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items }),
    });

    const rawText = await res.text();
let orderData;

try {
  orderData = JSON.parse(rawText);
} catch (e) {
  console.error("Cart checkout non-JSON response:", rawText);
  throw new Error(`Cart checkout returned non-JSON response (${res.status})`);
}

if (!res.ok || !orderData.success) {
  throw new Error(orderData.error || "Failed to create cart order");
}

    if (!window.Razorpay) {
      throw new Error("Razorpay SDK not loaded");
    }

    const rzp = new window.Razorpay({
      key: orderData.order.key,
      amount: orderData.order.amount,
      currency: orderData.order.currency,
      name: "BOOM BAP BOMBAY",
      description: `Cart Checkout (${orderData.order.itemCount} items)`,
      order_id: orderData.order.razorpayOrderId,
      image: "/assets/boombap-logo.svg",

      handler: async function (response) {
        try {
          const verifyRes = await fetch(`${API_BASE_URL}/api/payments/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              internalOrderId: orderData.order.internalOrderId,
            }),
          });

          const verifyData = await verifyRes.json();

          if (!verifyRes.ok || !verifyData.success) {
            throw new Error(verifyData.error || "Cart payment verification failed");
          }

          clearCart();
          renderCartUI();
          closeCartDrawer();

          window.location.href =
            `/payment-success?order_id=${encodeURIComponent(orderData.order.internalOrderId)}` +
            `&payment_id=${encodeURIComponent(response.razorpay_payment_id)}`;
        } catch (verifyError) {
          console.error("Cart verification error:", verifyError);
          if (typeof onReset === "function") onReset();
          alert("Payment completed, but verification failed. Please contact support.");
        }
      },

      modal: {
        ondismiss: function () {
          if (typeof onReset === "function") onReset();
        },
      },

      theme: {
        color: "#ab1212",
      },
    });

    rzp.open();
  } catch (err) {
    console.error(err);
    if (typeof onReset === "function") onReset();
    alert(err.message || "Cart checkout failed. Try again.");
  }
}
