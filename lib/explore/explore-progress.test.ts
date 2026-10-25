import { describe, expect, it } from "vitest";
import { emptyProgress, FADE_AFTER_MS, isDiscovered, isFaded, loadProgress, markDiscovered, recordAnswer, saveProgress, STORAGE_KEY } from "./explore-progress";

describe("explore-progress", () => {
  it("chạm lần đầu thì ghi nhận, chạm lại chỉ cập nhật lần cuối gặp", () => {
    const a = markDiscovered(emptyProgress(), "bed", 1000);
    expect(isDiscovered(a, "bed")).toBe(true);
    const b = markDiscovered(a, "bed", 5000);
    expect(b.terms.bed).toMatchObject({ discoveredAt: 1000, lastSeenAt: 5000 });
  });

  it("trả lời đúng làm sáng lại, trả lời sai không làm sáng", () => {
    const base = markDiscovered(emptyProgress(), "cat", 0);
    const right = recordAnswer(base, "cat", true, 9000);
    expect(right.terms.cat).toMatchObject({ correct: 1, wrong: 0, lastSeenAt: 9000 });
    const wrong = recordAnswer(base, "cat", false, 9000);
    expect(wrong.terms.cat).toMatchObject({ correct: 0, wrong: 1, lastSeenAt: 0 });
  });

  it("vật quá 24 giờ không gặp thì mờ; vật chưa khám phá thì không tính là mờ", () => {
    const p = markDiscovered(emptyProgress(), "cup", 0);
    expect(isFaded(p, "cup", FADE_AFTER_MS)).toBe(false);
    expect(isFaded(p, "cup", FADE_AFTER_MS + 1)).toBe(true);
    expect(isFaded(p, "water", FADE_AFTER_MS * 5)).toBe(false);
  });

  it("lưu rồi đọc lại đúng; dữ liệu hỏng hoặc không có kho lưu thì bắt đầu mới", () => {
    const mem = new Map<string, string>();
    const storage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v) };
    const p = markDiscovered(emptyProgress(), "door", 42);
    saveProgress(storage, p);
    expect(loadProgress(storage)).toEqual(p);
    mem.set(STORAGE_KEY, "{hỏng");
    expect(loadProgress(storage)).toEqual(emptyProgress());
    expect(loadProgress(null)).toEqual(emptyProgress());
  });
});
