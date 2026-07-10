export const MAX_CART_ITEM_QUANTITY = 20;

export function isValidQuantity(quantity) {
  return (
    Number.isInteger(quantity) &&
    quantity >= 1 &&
    quantity <= MAX_CART_ITEM_QUANTITY
  );
}
