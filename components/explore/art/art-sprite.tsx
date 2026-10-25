import type { FlatSprite } from "./flat/flat-kit";

/** Vẽ một sprite phẳng (Tranh C): SVG rộng 100% khung cha, cao theo tỉ lệ khung vẽ. */
export function ArtSprite({ sprite }: { sprite: FlatSprite }) {
  return (
    <svg viewBox={`0 0 ${sprite.w} ${sprite.h}`} aria-hidden="true" className="block h-auto w-full overflow-visible">
      {sprite.node}
    </svg>
  );
}
