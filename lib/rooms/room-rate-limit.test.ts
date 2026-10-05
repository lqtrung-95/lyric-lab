import { describe, expect, it } from "vitest";
import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";
import { allowRoomRequest } from "./room-rate-limit";

describe("allowRoomRequest", () => {
  it("cho qua tới hạn mức rồi chặn, và đếm riêng từng tài khoản", () => {
    let now = 0;
    const l = new InMemoryRateLimiter(3, 60_000, () => now);
    expect([1, 2, 3, 4].map(() => allowRoomRequest("u1", l))).toEqual([true, true, true, false]);
    expect(allowRoomRequest("u2", l)).toBe(true);
    now = 61_000; // hết cửa sổ
    expect(allowRoomRequest("u1", l)).toBe(true);
  });
});
