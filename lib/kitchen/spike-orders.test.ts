import { describe, expect, it } from "vitest";
import { ORDERS, STATIONS, nextOrder, serve } from "./spike-orders";

describe("spike orders", () => {
  it("mỗi đơn trỏ tới một bếp có thật", () => { for (const o of ORDERS) expect(STATIONS.some((s) => s.id === o.stationId)).toBe(true); });
  it("đơn kế tiếp không lặp lại đơn hiện tại", () => {
    for (let i = 0; i < 20; i++) expect(nextOrder(ORDERS[0], Math.random)).not.toBe(ORDERS[0]);
  });
  it("đúng món có tiền, sai món hoặc tay không thì không", () => {
    expect(serve(ORDERS[0], "steamer")).toEqual({ correct: true, coins: 6 });
    expect(serve(ORDERS[0], "soy")).toEqual({ correct: false, coins: 0 });
    expect(serve(ORDERS[0], null).correct).toBe(false);
  });
});
