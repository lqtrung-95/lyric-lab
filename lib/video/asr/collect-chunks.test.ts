import { describe, expect, it } from "vitest";
import { collectChunks } from "./collect-chunks";

const line = (start: number) => ({ text: `句${start}`, start, end: start + 1 });

describe("collectChunks", () => {
  it("gọi đoạn 0 trước, rồi các đoạn còn lại, và trả dòng đã sắp theo giờ", async () => {
    const calls: number[] = [];
    const progress: string[] = [];
    const out = await collectChunks(async (i) => { calls.push(i); await new Promise((r) => setTimeout(r, i === 1 ? 20 : 1)); return { lines: [line(i * 100)], chunkCount: 4 }; }, (d, t) => progress.push(`${d}/${t}`), { retryDelayMs: 0 });
    expect(calls[0]).toBe(0);
    expect(calls.sort()).toEqual([0, 1, 2, 3]);
    expect(out.map((l) => l.start)).toEqual([0, 100, 200, 300]);
    expect(progress[0]).toBe("1/4");
    expect(progress.at(-1)).toBe("4/4");
  });
  it("thử lại đoạn lỗi tạm rồi thành công", async () => {
    let tries = 0;
    const out = await collectChunks(async (i) => { if (i === 1 && tries++ === 0) throw new Error("tạm"); return { lines: [line(i)], chunkCount: 2 }; }, () => undefined, { retryDelayMs: 0 });
    expect(out).toHaveLength(2);
    expect(tries).toBe(2);
  });
  it("lỗi không thử lại được thì ném ngay, hết lượt thử cũng ném", async () => {
    let tries = 0;
    await expect(collectChunks(async () => { tries++; throw new Error("hết hạn mức"); }, () => undefined, { retryDelayMs: 0, isRetryable: () => false })).rejects.toThrow("hết hạn mức");
    expect(tries).toBe(1);
    await expect(collectChunks(async (i) => { if (i === 2) throw new Error("hỏng"); return { lines: [], chunkCount: 3 }; }, () => undefined, { retryDelayMs: 0, retries: 1 })).rejects.toThrow("hỏng");
  });
});
