const CART_KEY = "bbb_cart_v1";

function readCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("bbb:cart-updated"));
}

export function getCartItems() {
  return readCart();
}

export function getCartCount() {
  return readCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotalMinor() {
  return readCart().reduce(
    (sum, item) => sum + item.priceMinor * item.quantity,
    0
  );
}

export function addToCart(product, beat) {
  if (!product?.id) throw new Error("Missing product id");
  if (!beat?.title) throw new Error("Missing beat title");

  const items = readCart();
  const existing = items.find((item) => item.productId === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    items.push({
      productId: product.id,
      type: product.type,
      title: beat.title,
      priceMinor: Math.round((product.priceInr || 0) * 100),
      currency: product.currency || "INR",
      quantity: 1,
    });
  }

  writeCart(items);
}

export function removeFromCart(productId) {
  const items = readCart().filter((item) => item.productId !== productId);
  writeCart(items);
}

export function changeCartQuantity(productId, nextQuantity) {
  const qty = Math.max(1, Number(nextQuantity || 1));
  const items = readCart().map((item) =>
    item.productId === productId ? { ...item, quantity: qty } : item
  );
  writeCart(items);
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new CustomEvent("bbb:cart-updated"));
}

export function getCartCheckoutPayload() {
  return readCart().map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
  }));
}