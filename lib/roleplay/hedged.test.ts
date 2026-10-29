import { describe, expect, it } from "vitest";
import { hedged } from "./hedged";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("hedged", () => {
  it("model đầu nhanh thì không gọi model sau", async () => {
    const called: string[] = [];
    const out = await hedged(["a", "b"], async (m) => { called.push(m); return m; }, 50);
    expect(out).toBe("a");
    await sleep(80);
    expect(called).toEqual(["a"]);
  });
  it("model đầu lỗi thì chạy ngay model sau", async () => {
    const t0 = Date.now();
    const out = await hedged(["a", "b"], async (m) => { if (m === "a") throw new Error("x"); return m; }, 500);
    expect(out).toBe("b");
    expect(Date.now() - t0).toBeLessThan(200);
  });
  it("model đầu chậm thì chạy song song model sau và lấy kết quả sớm nhất", async () => {
    const t0 = Date.now();
    const out = await hedged(["slow", "fast"], async (m) => { await sleep(m === "slow" ? 400 : 10); return m; }, 40);
    expect(out).toBe("fast");
    expect(Date.now() - t0).toBeLessThan(250);
  });
  it("mọi model lỗi thì ném lỗi cuối; danh sách rỗng cũng ném", async () => {
    await expect(hedged(["a", "b"], async () => { throw new Error("boom"); }, 10)).rejects.toThrow("boom");
    await expect(hedged([], async () => 1, 10)).rejects.toThrow();
  });
  it("giới hạn số lượt chạy cùng lúc", async () => {
    let running = 0, peak = 0;
    await hedged(["a", "b", "c", "d"], async (m) => { running++; peak = Math.max(peak, running); await sleep(m === "d" ? 5 : 60); running--; return m; }, 10, 2).catch(() => undefined);
    expect(peak).toBeLessThanOrEqual(2);
  });
});
