import { describe, expect, it } from "vitest";
import { FLAT_SPRITES } from "@/components/explore/art/flat/flat-sprites";
import { READINGS } from "./reading-catalog";
import { READING_SCENES } from "./reading-scenes";

describe("tranh minh họa truyện", () => {
  it("mỗi truyện có đúng một tranh cho mỗi đoạn, mọi hình đều có trong kho", () => {
    for (const r of READINGS) {
      const scenes = READING_SCENES[r.id];
      expect(scenes, r.id).toBeDefined();
      expect(scenes.length, r.id).toBe(r.paragraphs.length);
      for (const sc of scenes) {
        expect(sc.items.length).toBeGreaterThanOrEqual(2);
        expect(sc.items.length).toBeLessThanOrEqual(6);
        for (const id of sc.items) expect(FLAT_SPRITES[id], `${r.id}:${id}`).toBeDefined();
      }
    }
  });
  it("không có tranh thừa cho truyện không tồn tại", () => {
    const ids = new Set(READINGS.map((r) => r.id));
    for (const k of Object.keys(READING_SCENES)) expect(ids.has(k), k).toBe(true);
  });
});
