/* Cart drawer. Same behaviour as before; the open button now lives in the
   fixed chrome (#cartFab) instead of floating over the content. */
import {
  getCartItems,
  getCartCount,
  getCartTotalMinor,
  removeFromCart,
  clearCart,
  addToCart,
} from "../cartStore.js";
import { formatInrFromMinor } from "./config.js";
import { startCartRazorpayCheckout } from "./checkout.js";

let lastFocus = null;

function injectCartShell() {
  if (document.getElementById("cartDrawer")) return;

  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div class="cart-drawer" id="cartDrawer" aria-hidden="true">
        <div class="cart-drawer__backdrop" id="cartDrawerBackdrop"></div>

        <aside class="cart-panel" role="dialog" aria-modal="true" aria-labelledby="cartTitle">
          <div class="cart-panel__top">
            <h2 class="cart-panel__title" id="cartTitle">CART</h2>
            <button class="cart-panel__close" id="cartCloseBtn" type="button" aria-label="Close cart">✕</button>
          </div>

          <div class="cart-panel__items" id="cartItems"></div>

          <div class="cart-panel__footer">
            <div class="cart-panel__total-row">
              <span>TOTAL</span>
              <strong id="cartTotal">₹0.00</strong>
            </div>

            <div class="cart-panel__actions">
              <button class="btn btn--line btn--sm" id="cartClearBtn" type="button">CLEAR</button>
              <button class="btn btn--red" id="cartCheckoutBtn" type="button">CHECKOUT</button>
            </div>
          </div>
        </aside>
      </div>
    `
  );
}

export function renderCartUI() {
  const countEl = document.getElementById("cartFabCount");
  const itemsEl = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  const checkoutBtn = document.getElementById("cartCheckoutBtn");

  if (!countEl || !itemsEl || !totalEl || !checkoutBtn) return;

  const items = getCartItems();

  countEl.textContent = String(getCartCount());
  totalEl.textContent = formatInrFromMinor(getCartTotalMinor());

  if (!items.length) {
    itemsEl.innerHTML = `<p class="cart-empty micro">Your cart is empty. The line-up is waiting.</p>`;
    checkoutBtn.disabled = true;
    return;
  }

  checkoutBtn.disabled = false;

  itemsEl.innerHTML = items
    .map(
      (item) => `
        <div class="cart-item" data-product-id="${item.productId}">
          <div class="cart-item__meta">
            <div class="cart-item__title">${item.title}</div>
            <div class="cart-item__sub">${item.type.toUpperCase()} · QTY ${item.quantity}</div>
          </div>
          <div class="cart-item__side">
            <div class="cart-item__price">${formatInrFromMinor(item.priceMinor * item.quantity)}</div>
            <button class="cart-item__remove" type="button" data-remove-id="${item.productId}">REMOVE</button>
          </div>
        </div>
      `
    )
    .join("");
}

export function openCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  if (!drawer) return;
  lastFocus = document.activeElement;
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("cart-open");
  window.dispatchEvent(new CustomEvent("bbb:lock", { detail: true }));
  document.getElementById("cartCloseBtn")?.focus();
}

export function closeCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  if (!drawer || !drawer.classList.contains("is-open")) return;
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("cart-open");
  window.dispatchEvent(new CustomEvent("bbb:lock", { detail: false }));
  lastFocus?.focus?.();
}

/* Adds an item and gives the chrome counter a little kick so the action
   registers even though the drawer stays closed. */
export function addItemToCart(product, item) {
  addToCart(product, item);
  const fab = document.getElementById("cartFab");
  if (fab) {
    fab.classList.remove("is-bumped");
    void fab.offsetWidth;
    fab.classList.add("is-bumped");
  }
}

export function initCart() {
  injectCartShell();

  const fab = document.getElementById("cartFab");
  const closeBtn = document.getElementById("cartCloseBtn");
  const backdrop = document.getElementById("cartDrawerBackdrop");
  const clearBtn = document.getElementById("cartClearBtn");
  const itemsEl = document.getElementById("cartItems");
  const checkoutBtn = document.getElementById("cartCheckoutBtn");

  fab?.addEventListener("click", openCartDrawer);
  closeBtn.addEventListener("click", closeCartDrawer);
  backdrop.addEventListener("click", closeCartDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCartDrawer();
  });

  clearBtn.addEventListener("click", () => {
    clearCart();
    renderCartUI();
  });

  itemsEl.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-remove-id]");
    if (!btn) return;
    removeFromCart(btn.getAttribute("data-remove-id"));
    renderCartUI();
  });

  checkoutBtn.addEventListener("click", () => {
    startCartRazorpayCheckout({
      onStart: () => {
        checkoutBtn.disabled = true;
        checkoutBtn.textContent = "PROCESSING...";
      },
      onReset: () => {
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = "CHECKOUT";
      },
    });
  });

  window.addEventListener("bbb:cart-updated", renderCartUI);
  renderCartUI();
}
