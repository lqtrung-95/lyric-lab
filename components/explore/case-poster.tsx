import { ArtSprite } from "./art/art-sprite";
import { FLAT_SPRITES } from "./art/flat/flat-sprites";

interface PosterDef {
  /** Hai màu nền chuyển sắc. */
  bg: [string, string];
  /** Vật chính của vụ án, kích thước (% chiều rộng) và độ nghiêng. */
  prop: { sprite: string; w: number; rotate: number };
  /** Người nhờ giúp, đứng góc phải. */
  client: string;
}

/** Hình áp phích riêng của từng vụ án: vật bị mất ở giữa, người nhờ giúp bên phải, Gấu Trúc thám tử bên trái, dấu hỏi lớn làm nền. */
const POSTERS: Record<string, PosterDef> = {
  "wooden-box": { bg: ["#f6cf8e", "#e8a860"], prop: { sprite: "woodbox", w: 38, rotate: -8 }, client: "owl" },
  "golden-key": { bg: ["#ffe9a8", "#f0b44c"], prop: { sprite: "key", w: 36, rotate: 18 }, client: "duck" },
  "swapped-cake": { bg: ["#ffd3dc", "#f2a0a0"], prop: { sprite: "cake", w: 36, rotate: -6 }, client: "chef" },
  "fountain-pen": { bg: ["#cce5ff", "#7fb4e6"], prop: { sprite: "pen", w: 30, rotate: 35 }, client: "owl" },
  "spring-painting": { bg: ["#e6d3f5", "#a98bd0"], prop: { sprite: "painting", w: 38, rotate: -5 }, client: "owl" },
  "lost-kite": { bg: ["#bfe3f7", "#7fc9b9"], prop: { sprite: "kite", w: 22, rotate: 12 }, client: "duck" },
};

export function CasePoster({ caseId }: { caseId: string }) {
  const p = POSTERS[caseId] ?? POSTERS["wooden-box"];
  const client = FLAT_SPRITES[p.client];
  const prop = FLAT_SPRITES[p.prop.sprite];
  return (
    <div aria-hidden="true" className="relative w-full overflow-hidden" style={{ aspectRatio: "16 / 10", background: `radial-gradient(circle at 50% 45%, rgba(255,255,255,.55), transparent 60%), linear-gradient(160deg, ${p.bg[0]}, ${p.bg[1]})` }}>
      <span className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 select-none font-serif text-[min(34vw,15rem)] font-extrabold leading-none" style={{ color: "rgba(74,46,27,.10)" }}>?</span>
      <div className="absolute" style={{ left: "50%", top: "50%", width: `${p.prop.w}%`, transform: `translate(-50%, -52%) rotate(${p.prop.rotate}deg)`, filter: "drop-shadow(0 6px 0 rgba(74,46,27,.25))" }}>
        {prop && <ArtSprite sprite={prop} />}
      </div>
      <div className="absolute bottom-[3%] right-[5%] w-[22%]">{client && <ArtSprite sprite={client} />}</div>
      <div className="absolute bottom-[3%] left-[5%] w-[20%]"><ArtSprite sprite={FLAT_SPRITES.guide} /></div>
    </div>
  );
}
