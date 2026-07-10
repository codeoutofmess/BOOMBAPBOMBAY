import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { isValidQuantity, MAX_CART_ITEM_QUANTITY } from "./quantity.js";

describe("isValidQuantity", () => {
  test("accepts quantities within range", () => {
    assert.equal(isValidQuantity(1), true);
    assert.equal(isValidQuantity(5), true);
    assert.equal(isValidQuantity(MAX_CART_ITEM_QUANTITY), true);
  });

  test("rejects zero and negative quantities", () => {
    assert.equal(isValidQuantity(0), false);
    assert.equal(isValidQuantity(-1), false);
  });

  test("rejects quantities above the cap", () => {
    assert.equal(isValidQuantity(MAX_CART_ITEM_QUANTITY + 1), false);
    assert.equal(isValidQuantity(1e9), false);
  });

  test("rejects non-integers", () => {
    assert.equal(isValidQuantity(1.5), false);
    assert.equal(isValidQuantity(NaN), false);
  });
});
