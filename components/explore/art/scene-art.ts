import { PIXEL_SPRITES } from "./pixel-sprites";
import type { PixelSprite } from "./pixel-canvas";

/** Hai bộ tranh để so sánh: `ai` = tranh do AI sinh (tách nền thành PNG), `pixel` = vẽ bằng code. */
export type ArtStyle = "ai" | "pixel";

export interface AiSprite {
  src: string;
  /** Rộng / cao của ảnh sau khi tách nền. */
  ratio: number;
  /** Nhân chiều rộng đặt trong cảnh (tranh AI có tỉ lệ khác tranh pixel). */
  scale: number;
}

// Tranh AI hiện có: giường, bàn, ghế, sách, cửa (hạn mức tạo ảnh của dịch vụ đã hết). Vật khác ở chế độ AI rơi về sprite pixel.
export const AI_SPRITES: Record<string, AiSprite> = {
  bed: { src: "/explore/ai/bed.png", ratio: 173 / 185, scale: 0.85 },
  table: { src: "/explore/ai/table.png", ratio: 180 / 152, scale: 1 },
  chair: { src: "/explore/ai/chair.png", ratio: 113 / 180, scale: 0.55 },
  book: { src: "/explore/ai/book.png", ratio: 177 / 159, scale: 1.05 },
  door: { src: "/explore/ai/door.png", ratio: 101 / 174, scale: 1 },
};

export type ResolvedArt = { kind: "img"; ai: AiSprite } | { kind: "pixel"; sprite: PixelSprite; fallback: boolean };

/** Chọn tranh cho một vật theo bộ tranh; `fallback` = đang ở chế độ AI nhưng vật này chưa có tranh AI nên dùng sprite pixel. */
export function resolveArt(id: string, style: ArtStyle): ResolvedArt | null {
  const ai = style === "ai" ? AI_SPRITES[id] : undefined;
  if (ai) return { kind: "img", ai };
  const sprite = PIXEL_SPRITES[id];
  return sprite ? { kind: "pixel", sprite, fallback: style === "ai" } : null;
}
