import { describe, expect, it } from "vitest";
import { InMemoryRateLimiter } from "./in-memory-rate-limiter";

describe("InMemoryRateLimiter", () => {
  it("chặn khi vượt hạn mức, các khóa độc lập, mở lại sau cửa sổ", () => {
    let t = 0;
    const limiter = new InMemoryRateLimiter(2, 1000, () => t);
    expect(limiter.tryConsume("a")).toBe(true);
    expect(limiter.tryConsume("a")).toBe(true);
    expect(limiter.tryConsume("a")).toBe(false);
    expect(limiter.tryConsume("b")).toBe(true);
    t = 1001;
    expect(limiter.tryConsume("a")).toBe(true);
  });
});
