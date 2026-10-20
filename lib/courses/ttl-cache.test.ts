import { describe, expect, it } from "vitest";
import { TtlCache } from "./ttl-cache";

describe("TtlCache", () => {
  it("trả giá trị trước hạn, hết hạn thì bỏ", () => {
    let t = 0;
    const c = new TtlCache<string>(100, 10, () => t);
    c.set("a", "A");
    t = 99;
    expect(c.get("a")).toBe("A");
    t = 100;
    expect(c.get("a")).toBeUndefined();
  });
  it("quá số mục tối đa thì xóa mục cũ nhất; ghi lại một khóa làm nó mới nhất", () => {
    const c = new TtlCache<number>(1000, 2, () => 0);
    c.set("a", 1); c.set("b", 2); c.set("a", 3); c.set("c", 4);
    expect(c.get("b")).toBeUndefined();
    expect(c.get("a")).toBe(3);
    expect(c.get("c")).toBe(4);
  });
});
