import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SCENES } from "@/lib/explore/scenes";
import { INK } from "./flat-kit";
import { FLAT_SPRITES } from "./flat-sprites";

describe("sprite phẳng (phong cách app)", () => {
  it("mọi vật trong cảnh, NPC và nhân vật người chơi đều có sprite với khung hợp lệ", () => {
    const ids = ["guide", ...Object.values(SCENES).flatMap((sc) => [...sc.objects.map((o) => o.id), sc.npc.id, ...sc.exits.map((e) => e.sprite), ...(sc.decor ?? []).map((d) => d.sprite)])];
    for (const id of ids) {
      const s = FLAT_SPRITES[id];
      expect(s, id).toBeDefined();
      expect(s.w).toBeGreaterThan(0);
      expect(s.h).toBeGreaterThan(0);
    }
  });

  it("mỗi sprite vẽ ra SVG có viền mực của app, không có số NaN, và có ít nhất vài hình", () => {
    for (const [id, s] of Object.entries(FLAT_SPRITES)) {
      const markup = renderToStaticMarkup(s.node as never);
      expect(markup, id).toContain(INK);
      expect(markup, id).not.toContain("NaN");
      expect((markup.match(/<(rect|path|circle|ellipse)/g) ?? []).length, id).toBeGreaterThanOrEqual(4);
    }
  });
});
