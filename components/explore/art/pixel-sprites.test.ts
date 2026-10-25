import { describe, expect, it } from "vitest";
import { ROOM_SCENE } from "@/lib/explore/scenes/room-scene";
import { PALETTE, toRects } from "./pixel-canvas";
import { GUIDE_PIXEL, PIXEL_SPRITES } from "./pixel-sprites";
import { AI_SPRITES, resolveArt } from "./scene-art";

describe("sprite pixel", () => {
  it("mọi vật trong cảnh đều có sprite, hàng đủ độ dài, chỉ dùng màu trong bảng", () => {
    for (const o of ROOM_SCENE.objects) {
      const s = PIXEL_SPRITES[o.id];
      expect(s, o.id).toBeDefined();
      expect(s.rows).toHaveLength(s.h);
      for (const row of s.rows) {
        expect(row).toHaveLength(s.w);
        for (const ch of row) expect(ch === "." || ch in PALETTE, `${o.id}: ${ch}`).toBe(true);
      }
    }
    expect(GUIDE_PIXEL.rows.every((r) => r.length === GUIDE_PIXEL.w)).toBe(true);
  });

  it("toRects gộp ô liền nhau cùng màu và bỏ ô trong suốt", () => {
    const rects = toRects({ w: 5, h: 1, rows: ["kkk.w"] });
    expect(rects).toEqual([{ x: 0, y: 0, w: 3, h: 1, fill: PALETTE.k }, { x: 4, y: 0, w: 1, h: 1, fill: PALETTE.w }]);
  });
});

describe("resolveArt", () => {
  it("chế độ AI dùng tranh AI nếu có, không thì rơi về pixel kèm cờ fallback; chế độ pixel luôn pixel", () => {
    expect(resolveArt("bed", "ai")?.kind).toBe("img");
    expect(resolveArt("cat", "ai")).toMatchObject({ kind: "pixel", fallback: true });
    expect(resolveArt("bed", "pixel")).toMatchObject({ kind: "pixel", fallback: false });
    expect(Object.keys(AI_SPRITES).every((id) => id === "guide" || id in PIXEL_SPRITES)).toBe(true);
  });
});
