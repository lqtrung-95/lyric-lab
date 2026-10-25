// Kho prompt sinh tranh AI cho các cảnh Khám phá. Mọi vật dùng CHUNG một câu mô tả phong cách (`STYLE`) để cả bộ cùng một "bàn tay"; chỉ phần mô tả vật khác nhau.
// Dùng cho script `scripts/generate-explore-art.mts` (ComfyUI chạy ở máy) và để ghi lại cách đã tạo tranh.

// Lưu ý: không đưa câu phủ định ("no shadow", "no floor") vào prompt dương, mô hình sinh ảnh hay làm ngược lại và vẽ ra đúng thứ đó; phủ định để ở NEGATIVE.
// "pixel art" là từ khóa kích hoạt của LoRA pixel-art-xl (nếu không dùng LoRA thì vẫn đẩy mô hình về phong cách pixel).
export const STYLE = "pixel art, a single game item, soft brown outlines, warm earthy palette, three-quarter top-down view, single isolated object centered, plain flat solid pure white background";
export const NEGATIVE = "sprite sheet, collection, set of items, tileset, border, frame, vines, plants, decorations, extra objects, nightstand, multiple objects, shadow, drop shadow, ground shadow, cast shadow, floor, wall, room, gradient background, text, watermark, signature, logo, cropped, blurry, low quality, photo, 3d render, people";

/** Khung hình sinh ra: vuông cho đa số vật, đứng cho vật cao (cửa, đèn). Kích thước chuẩn SDXL. */
export type ArtAspect = "square" | "portrait";
export const ASPECT_SIZE: Record<ArtAspect, { width: number; height: number }> = {
  square: { width: 1024, height: 1024 },
  portrait: { width: 832, height: 1216 },
};

export interface ArtItem {
  /** Trùng `id` của vật trong cảnh (hoặc "guide" cho nhân vật dẫn đường). */
  id: string;
  /** Mô tả riêng của vật (chưa kèm STYLE). */
  subject: string;
  aspect: ArtAspect;
  /** Thứ riêng của vật này cần tránh (nối vào prompt âm), ví dụ bàn không kèm ghế. */
  avoid?: string;
}

export const ROOM_ART_ITEMS: ArtItem[] = [
  { id: "bed", subject: "a cozy wooden bed with a green leaf-patterned blanket and a pillow", aspect: "square" },
  { id: "table", subject: "a simple wooden rectangular table with four legs, empty top, only the table", aspect: "square", avoid: "chairs, stools, benches, tablecloth, plates, food, objects on the table" },
  { id: "chair", subject: "a simple wooden chair with a curved backrest", aspect: "square" },
  { id: "book", subject: "a thick closed red hardcover book lying flat with a golden spine", aspect: "square" },
  { id: "door", subject: "a wooden arched front door with a small round window and a brass handle, seen straight from the front", aspect: "portrait" },
  { id: "window", subject: "a square window with a wooden frame and open green curtains, seen straight from the front", aspect: "square" },
  { id: "cup", subject: "a white ceramic mug with a blue stripe and a small handle", aspect: "square" },
  { id: "water", subject: "a tall clear glass of water with light blue water", aspect: "square" },
  { id: "laptop", subject: "a small open laptop computer with a softly glowing blue screen", aspect: "square" },
  { id: "tv", subject: "a small retro television set with a wooden body, a rounded screen and two knobs, standing on short legs", aspect: "square" },
  { id: "cat", subject: "a cute orange tabby cat sitting and looking up", aspect: "square" },
  { id: "flower", subject: "a potted red flower with green leaves in a terracotta pot", aspect: "square" },
  { id: "apple", subject: "one shiny red apple with a short brown stem, a single round apple", aspect: "square", avoid: "separate leaf, floating leaf, branch, tree, pole, multiple apples, stand" },
  { id: "lamp", subject: "a tall floor lamp with a warm cream lampshade and a wooden pole", aspect: "portrait" },
  { id: "guide", subject: "a cute small red panda explorer character wearing a little teal backpack, standing and waving, front view", aspect: "square" },
];

/** Prompt đầy đủ cho một vật. `extra` (từ dòng lệnh) nối thêm cuối, ví dụ từ khóa kích hoạt của LoRA. */
export function buildPrompt(item: ArtItem, extra = ""): string {
  return [item.subject, STYLE, extra.trim()].filter(Boolean).join(", ");
}

/** Prompt âm đầy đủ cho một vật: phần chung cộng phần riêng của vật (nếu có). */
export function buildNegative(item: ArtItem): string {
  return item.avoid ? `${NEGATIVE}, ${item.avoid}` : NEGATIVE;
}
