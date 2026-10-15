import { beforeEach, describe, expect, it } from "vitest";
import { buildDailyDrill } from "./daily-drill";
import { emptyProgress, loadProgress, markDay, recordTwister, saveProgress, streakOf, toggleLesson } from "./learning-progress";
import { TONGUE_TWISTERS } from "./tongue-twisters";

const store = new Map<string, string>();
beforeEach(() => {
  store.clear();
  (globalThis as unknown as { localStorage: Storage }).localStorage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => void store.set(k, v) } as Storage;
});

describe("tiến độ luyện phát âm", () => {
  it("đánh dấu ngày không trùng, chuỗi ngày tính đúng", () => {
    let p = emptyProgress();
    for (const d of ["2026-10-13", "2026-10-14", "2026-10-14", "2026-10-15"]) p = markDay(p, d);
    expect(p.days).toHaveLength(3);
    expect(streakOf(p, "2026-10-15").current).toBe(3);
    expect(streakOf(p, "2026-10-17").current).toBe(0);
  });
  it("bật/tắt bước lộ trình; điểm 绕口令 chỉ giữ cao nhất", () => {
    let p = toggleLesson(emptyProgress(), "initials");
    expect(p.lessons).toEqual(["initials"]);
    expect(toggleLesson(p, "initials").lessons).toEqual([]);
    p = recordTwister(recordTwister(p, "si-shi", 70), "si-shi", 55);
    expect(p.twisters["si-shi"]).toBe(70);
  });
  it("lưu rồi đọc lại; dữ liệu hỏng thì về bản rỗng", () => {
    saveProgress(markDay(emptyProgress(), "2026-10-15"));
    expect(loadProgress().days).toEqual(["2026-10-15"]);
    store.set("songhanzi:pronunciation-progress", "{hỏng");
    expect(loadProgress()).toEqual(emptyProgress());
    store.set("songhanzi:pronunciation-progress", JSON.stringify({ days: ["x", "2026-10-15"], twisters: { a: "b", c: 5 } }));
    expect(loadProgress()).toMatchObject({ days: ["2026-10-15"], twisters: { c: 5 } });
  });
});

describe("bài tập hằng ngày", () => {
  it("cùng ngày cùng bài, ngày khác thường khác bài", () => {
    expect(buildDailyDrill("2026-10-15")).toEqual(buildDailyDrill("2026-10-15"));
    const twisters = new Set(Array.from({ length: 14 }, (_, i) => buildDailyDrill(`2026-10-${String(i + 1).padStart(2, "0")}`).twister.id));
    expect(twisters.size).toBeGreaterThan(2);
  });
  it("id 绕口令 không trùng", () => {
    expect(new Set(TONGUE_TWISTERS.map((t) => t.id)).size).toBe(TONGUE_TWISTERS.length);
  });
});
