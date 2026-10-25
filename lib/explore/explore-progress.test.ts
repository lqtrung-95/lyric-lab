import { describe, expect, it } from "vitest";
import { clearScene, emptyProgress, FADE_AFTER_MS, LEGACY_SCENE_ID, progressKey, isDiscovered, isFaded, loadProgress, markDiscovered, recordAnswer, saveProgress, STORAGE_KEY } from "./explore-progress";

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
    const p = markDiscovered(emptyProgress(), progressKey("phong", "door"), 42);
    saveProgress(storage, p);
    expect(loadProgress(storage)).toEqual(p);
    mem.set(STORAGE_KEY, "{hỏng");
    expect(loadProgress(storage)).toEqual(emptyProgress());
    expect(loadProgress(null)).toEqual(emptyProgress());
  });

  it("khóa theo cảnh; dữ liệu cũ khóa theo id trần được chuyển sang cảnh đầu tiên khi đọc", () => {
    expect(progressKey("quan-an", "tea")).toBe("quan-an:tea");
    const old = { terms: { bed: { discoveredAt: 1, lastSeenAt: 2, correct: 1, wrong: 0 }, "quan-an:tea": { discoveredAt: 3, lastSeenAt: 3, correct: 0, wrong: 0 } } };
    const loaded = loadProgress({ getItem: () => JSON.stringify(old) });
    expect(Object.keys(loaded.terms).sort()).toEqual([progressKey(LEGACY_SCENE_ID, "bed"), "quan-an:tea"].sort());
    expect(loaded.terms[progressKey(LEGACY_SCENE_ID, "bed")].correct).toBe(1);
  });

  it("clearScene chỉ xóa tiến độ của cảnh đó", () => {
    let p = markDiscovered(emptyProgress(), progressKey("phong", "bed"), 1);
    p = markDiscovered(p, progressKey("quan-an", "tea"), 1);
    expect(Object.keys(clearScene(p, "phong").terms)).toEqual(["quan-an:tea"]);
  });
});
