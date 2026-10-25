import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ROOM_SCENE } from "@/lib/explore/scenes/room-scene";
import { resolveArt, resolveGuideArt } from "../scene-art";
import { INK } from "./flat-kit";
import { FLAT_SPRITES } from "./flat-sprites";

describe("Tranh C (SVG phẳng)", () => {
  it("mọi vật trong cảnh và nhân vật dẫn đường đều có sprite với khung hợp lệ", () => {
    for (const id of [...ROOM_SCENE.objects.map((o) => o.id), "guide"]) {
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

  it("resolveArt ở chế độ flat luôn ra sprite phẳng, kể cả nhân vật dẫn đường", () => {
    for (const o of ROOM_SCENE.objects) expect(resolveArt(o.id, "flat")?.kind, o.id).toBe("flat");
    expect(resolveGuideArt("flat").kind).toBe("flat");
    expect(resolveArt("khong-co", "flat")).toBeNull();
  });
});
