import { PIXEL_SPRITES } from "./pixel-sprites";
import type { PixelSprite } from "./pixel-canvas";
import aiManifest from "./ai-sprites.generated.json";
import { GUIDE_PIXEL } from "./pixel-sprites";
import { FLAT_SPRITES } from "./flat/flat-sprites";
import type { FlatSprite } from "./flat/flat-kit";

/** Ba bộ tranh để so sánh: `flat` = vẽ SVG theo phong cách app (Tranh C), `ai` = pixel art do AI sinh (Tranh A), `pixel` = pixel vẽ bằng code (Tranh B). */
export type ArtStyle = "flat" | "ai" | "pixel";

export interface AiSprite {
  src: string;
  /** Rộng / cao của ảnh sau khi tách nền. */
  ratio: number;
  /** Nhân chiều rộng đặt trong cảnh (tranh AI có tỉ lệ khác tranh pixel). */
  scale: number;
}

// Danh sách tranh AI hiện có do script `scripts/generate-explore-art.mts` ghi (tên file và tỉ lệ); `SCALES` là chỉnh tay độ to nhỏ theo từng vật để vừa bố cục.
// Vật chưa có tranh AI ở chế độ AI rơi về sprite pixel (xem `resolveArt`).
const SCALES: Record<string, number> = {};
const GENERATED = aiManifest as Record<string, { src: string; ratio: number }>;
export const AI_SPRITES: Record<string, AiSprite> = Object.fromEntries(Object.entries(GENERATED).map(([id, m]) => [id, { ...m, scale: SCALES[id] ?? 1 }]));

export type ResolvedArt = { kind: "flat"; sprite: FlatSprite } | { kind: "img"; ai: AiSprite } | { kind: "pixel"; sprite: PixelSprite; fallback: boolean };

// Chỉnh tay độ to nhỏ Tranh C theo từng vật (nhân với chiều rộng `w` của vật trong cảnh); mặc định 1.
export const FLAT_SCALES: Record<string, number> = {};

/** Chọn tranh cho một vật theo bộ tranh; `fallback` = đang ở chế độ AI nhưng vật này chưa có tranh AI nên dùng sprite pixel. */
export function resolveArt(id: string, style: ArtStyle, aiSprites: Record<string, AiSprite> = AI_SPRITES): ResolvedArt | null {
  const flat = style === "flat" ? FLAT_SPRITES[id] : undefined;
  if (flat) return { kind: "flat", sprite: flat };
  const ai = style === "ai" ? aiSprites[id] : undefined;
  if (ai) return { kind: "img", ai };
  const sprite = PIXEL_SPRITES[id];
  return sprite ? { kind: "pixel", sprite, fallback: style === "ai" } : null;
}

/** Nhân vật dẫn đường: tranh AI nếu có (`guide` trong danh sách), không thì sprite pixel. */
export function resolveGuideArt(style: ArtStyle): ResolvedArt {
  if (style === "flat") return { kind: "flat", sprite: FLAT_SPRITES.guide };
  const ai = style === "ai" ? AI_SPRITES.guide : undefined;
  return ai ? { kind: "img", ai } : { kind: "pixel", sprite: GUIDE_PIXEL, fallback: style === "ai" };
}
