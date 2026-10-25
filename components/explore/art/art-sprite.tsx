import { toRects } from "./pixel-canvas";
import type { ResolvedArt } from "./scene-art";

/** Vẽ một sprite đã chọn: ảnh PNG (tranh AI) hoặc SVG pixel (tranh code). Rộng 100% khung cha, cao theo tỉ lệ. */
export function ArtSprite({ art }: { art: ResolvedArt }) {
  if (art.kind === "flat") {
    return <svg viewBox={`0 0 ${art.sprite.w} ${art.sprite.h}`} aria-hidden="true" className="block h-auto w-full overflow-visible">{art.sprite.node}</svg>;
  }
  if (art.kind === "img") {
    // eslint-disable-next-line @next/next/no-img-element -- ảnh tĩnh nhỏ, cố ý không qua trình tối ưu ảnh của Vercel (hạn mức)
    return <img src={art.ai.src} alt="" draggable={false} className="block h-auto w-full select-none" />;
  }
  const { sprite } = art;
  return (
    <svg viewBox={`0 0 ${sprite.w} ${sprite.h}`} shapeRendering="crispEdges" aria-hidden="true" className="block h-auto w-full">
      {toRects(sprite).map((r, i) => <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill={r.fill} />)}
    </svg>
  );
}
