import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isVideoTourDone, markVideoTourDone, VIDEO_TOUR_STEPS } from "./video-tour";

describe("VIDEO_TOUR_STEPS", () => {
  it("mỗi bước có tiêu đề, nội dung và ít nhất một đích; id không trùng", () => {
    for (const s of VIDEO_TOUR_STEPS) {
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.body.length).toBeGreaterThan(0);
      expect(s.targets.length).toBeGreaterThan(0);
    }
    expect(new Set(VIDEO_TOUR_STEPS.map((s) => s.id)).size).toBe(VIDEO_TOUR_STEPS.length);
  });
  it("các đích đều dùng thuộc tính data-tour (không dựa vào class dễ đổi)", () => {
    for (const t of VIDEO_TOUR_STEPS.flatMap((s) => s.targets)) expect(t).toContain("data-tour=");
  });
});

describe("cờ đã xem hướng dẫn video", () => {
  const store = new Map<string, string>();
  beforeEach(() => {
    store.clear();
    vi.stubGlobal("localStorage", { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) });
    vi.stubGlobal("window", {});
    vi.stubGlobal("navigator", { webdriver: false });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("chưa xem thì tự mở; sau khi đánh dấu thì không tự mở nữa", () => {
    expect(isVideoTourDone()).toBe(false);
    markVideoTourDone();
    expect(isVideoTourDone()).toBe(true);
  });
  it("khóa riêng, không lẫn với hướng dẫn màn Nghe bài hát", () => {
    store.set("lyric-lab-listen-tour", "done");
    expect(isVideoTourDone()).toBe(false);
  });
  it("trình duyệt tự động hoá coi như đã xem (không che test khác), trừ khi bật cờ ép", () => {
    vi.stubGlobal("navigator", { webdriver: true });
    expect(isVideoTourDone()).toBe(true);
    vi.stubGlobal("window", { __forceVideoTour: true });
    expect(isVideoTourDone()).toBe(false);
  });
  it("không đọc được bộ nhớ thì coi như đã xem để khỏi hiện lặp lại", () => {
    vi.stubGlobal("localStorage", { getItem: () => { throw new Error("blocked"); } });
    expect(isVideoTourDone()).toBe(true);
  });
});
