"use client";

import { useEffect, useRef, useState } from "react";
import type { SceneDef } from "@/lib/explore/explore-types";
import { ArtSprite } from "./art/art-sprite";
import { FLAT_SPRITES } from "./art/flat/flat-sprites";
import { SceneBackdrop } from "./art/scene-backdrop";

const DESIGN_WIDTH = 640;
const zOf = (y: number, above?: boolean) => 10 + Math.round(y * 10) + (above ? 500 : 0);

/**
 * Ảnh thu nhỏ của một cảnh: vẽ lại đúng nền, đồ trang trí, đồ vật và NPC của cảnh (không tương tác) ở khung thiết kế 640 px rồi co theo chiều rộng thẻ,
 * nên ảnh minh họa luôn khớp với cảnh thật mà không cần file ảnh.
 */
export function SceneThumb({ scene }: { scene: SceneDef }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setScale(el.clientWidth / DESIGN_WIDTH);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const place = (key: string, sprite: string, x: number, y: number, w: number, z: number) => FLAT_SPRITES[sprite] && (
    <div key={key} className="absolute" style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, transform: "translate(-50%, -100%)", zIndex: z }}>
      <ArtSprite sprite={FLAT_SPRITES[sprite]} />
    </div>
  );

  return (
    <div ref={box} aria-hidden="true" className="relative w-full overflow-hidden" style={{ aspectRatio: "4 / 3" }}>
      <div className="absolute left-0 top-0 origin-top-left" style={{ width: DESIGN_WIDTH, height: (DESIGN_WIDTH * 3) / 4, transform: `scale(${scale})` }}>
        <SceneBackdrop theme={scene.theme} />
        {(scene.decor ?? []).map((d, i) => place(`d${i}`, d.sprite, d.x, d.y, d.w, zOf(d.y)))}
        {scene.objects.map((o) => place(o.id, o.id, o.x, o.y, o.w, zOf(o.y, o.above)))}
        {place("npc", scene.npc.id, scene.npc.x, scene.npc.y, scene.npc.w, zOf(scene.npc.y))}
      </div>
    </div>
  );
}
