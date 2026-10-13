/* The /payment-success page, moved unchanged from the original main.js. */
import { API_BASE_URL } from "./config.js";

export function isPaymentSuccessRoute() {
  return window.location.pathname === "/payment-success";
}

export async function renderPaymentSuccessPage() {
  const app = document.querySelector("#app");
  if (!app) return;

  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("order_id") || "";
  const paymentId = params.get("payment_id") || "N/A";

  app.innerHTML = `
    <main class="payment-success-page">
      <section class="payment-success-card">
        <div class="payment-success-kicker">BOOM BAP BOMBAY</div>
        <h1 class="payment-success-title">PAYMENT SUCCESSFUL</h1>

        <p class="payment-success-copy">
          LOADING PURCHASE DETAILS...
        </p>
      </section>
    </main>
  `;

  if (!orderId) {
    app.innerHTML = `
      <main class="payment-success-page">
        <section class="payment-success-card">
          <div class="payment-success-kicker">BOOM BAP BOMBAY</div>
          <h1 class="payment-success-title">PAYMENT SUCCESSFUL</h1>
          <p class="payment-success-copy">
            ORDER ID IS MISSING FROM THE URL.
          </p>
          <div class="payment-success-actions">
            <a class="payment-success-btn" href="/">RETURN TO SITE</a>
          </div>
        </section>
      </main>
    `;
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/orders/${encodeURIComponent(orderId)}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to load order");
    }

    const formattedAmount = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: data.currency || "INR",
      maximumFractionDigits: 2,
    }).format((data.amount || 0) / 100);

    const paidLabel = data.paidAt
      ? new Date(data.paidAt).toLocaleString()
      : "PAYMENT RECORDED";

    const cartItemsMarkup =
      data.isCartOrder && Array.isArray(data.items) && data.items.length
        ? `
          <div class="payment-success-items">
            <h2 class="payment-success-items-title">PURCHASED ITEMS</h2>

            <div class="payment-success-items-list">
              ${data.items
                .map(
                  (item) => `
                    <div class="payment-success-item">
                      <div class="payment-success-item-meta">
                        <div>
                          <span>ITEM</span>
                          <strong>${item.title}</strong>
                        </div>

                        <div>
                          <span>TYPE</span>
                          <strong>${(item.productType || "N/A").toUpperCase()}</strong>
                        </div>

                        <div>
                          <span>QTY</span>
                          <strong>${item.quantity}</strong>
                        </div>

                        <div>
                          <span>LINE TOTAL</span>
                          <strong>${new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: data.currency || "INR",
                            maximumFractionDigits: 2,
                          }).format((item.lineTotalMinor || 0) / 100)}</strong>
                        </div>
                      </div>

                      <a
                        class="payment-success-btn"
                        href="${API_BASE_URL}/api/download/${encodeURIComponent(
                          data.internalOrderId || orderId
                        )}/${encodeURIComponent(item.productId)}"
                      >
                        DOWNLOAD ${item.title}
                      </a>
                    </div>
                  `
                )
                .join("")}
            </div>
          </div>
        `
        : "";

    const actionsMarkup = data.isCartOrder
      ? `
        <div class="payment-success-actions">
          <a class="payment-success-btn" href="/">RETURN TO SITE</a>
        </div>
      `
      : `
        <div class="payment-success-actions">
          <a
            class="payment-success-btn"
            href="${API_BASE_URL}/api/download/${encodeURIComponent(data.internalOrderId || orderId)}"
          >
            DOWNLOAD YOUR PURCHASE
          </a>

          <a class="payment-success-btn" href="/">RETURN TO SITE</a>
        </div>
      `;

    app.innerHTML = `
      <main class="payment-success-page">
        <section class="payment-success-card">
          <div class="payment-success-kicker">BOOM BAP BOMBAY</div>
          <h1 class="payment-success-title">PAYMENT SUCCESSFUL</h1>

          <div class="payment-success-meta">
            <div>
              <span>PRODUCT</span>
              <strong>${data.isCartOrder ? `${data.itemCount || 0} ITEMS` : data.title || "N/A"}</strong>
            </div>

            <div>
              <span>TYPE</span>
              <strong>${data.isCartOrder ? "CART ORDER" : (data.productType || "N/A").toUpperCase()}</strong>
            </div>

            <div>
              <span>AMOUNT PAID</span>
              <strong>${formattedAmount}</strong>
            </div>

            <div>
              <span>ORDER ID</span>
              <strong>${data.internalOrderId || orderId}</strong>
            </div>

            <div>
              <span>PAYMENT ID</span>
              <strong>${data.razorpayPaymentId || paymentId}</strong>
            </div>

            <div>
              <span>STATUS</span>
              <strong>${(data.status || "N/A").toUpperCase()}</strong>
            </div>

            <div>
              <span>PAID AT</span>
              <strong>${paidLabel}</strong>
            </div>
          </div>

          <p class="payment-success-copy">
            YOUR PAYMENT WAS VERIFIED SUCCESSFULLY.
          </p>

          ${cartItemsMarkup}
          ${actionsMarkup}
        </section>
      </main>
    `;
  } catch (error) {
    console.error("Failed to load success page order:", error);

    app.innerHTML = `
      <main class="payment-success-page">
        <section class="payment-success-card">
          <div class="payment-success-kicker">BOOM BAP BOMBAY</div>
          <h1 class="payment-success-title">PAYMENT SUCCESSFUL</h1>

          <div class="payment-success-meta">
            <div>
              <span>ORDER ID</span>
              <strong>${orderId}</strong>
            </div>

            <div>
              <span>PAYMENT ID</span>
              <strong>${paymentId}</strong>
            </div>
          </div>

          <p class="payment-success-copy">
            PAYMENT WAS VERIFIED, BUT ORDER DETAILS COULD NOT BE LOADED.
          </p>

          <div class="payment-success-actions">
            <a class="payment-success-btn" href="/">RETURN TO SITE</a>
          </div>
        </section>
      </main>
    `;
  }
}
