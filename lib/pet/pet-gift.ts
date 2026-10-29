import type { PreviewItem } from "@/lib/analysis/analysis-types";

/**
 * Quà pet mang về sau khi người dùng nghe hết một bài: MỘT từ trong bài đó (chữ Hán, pinyin từ từ điển, nghĩa ngắn).
 * Chỉ lấy từ mục học đã phân tích, KHÔNG lưu cả câu lời bài hát và không để AI viết lời (quy tắc 1, 7).
 */
export interface PetGift { videoId: string; term: string; pinyin: string | null; meaning: string; day: string }

export const PET_GIFT_KEY = "lyric-lab-pet-gift";
export const PET_GIFT_EVENT = "lyric-lab-pet-gift";
const MEANING_MAX = 40;

/** Từ làm quà: từ vựng (không phải ngữ pháp) có nghĩa, ưu tiên mục quan trọng nhất; bỏ cụm quá dài. */
export function pickGiftItem(items: readonly PreviewItem[]): PreviewItem | null {
  const ok = items.filter((i) => i.type === "vocab" && i.term.trim() !== "" && [...i.term].length <= 6 && i.meaningInContext.trim() !== "");
  if (ok.length === 0) return null;
  return [...ok].sort((a, b) => b.priority - a.priority)[0];
}

export function giftFromItem(videoId: string, item: PreviewItem, day: string, shorten: (meaning: string, term: string) => string): PetGift {
  const meaning = shorten(item.meaningInContext, item.term).trim();
  return {
    videoId, term: item.term.trim(), pinyin: item.reading?.trim() || null,
    meaning: [...meaning].length > MEANING_MAX ? `${[...meaning].slice(0, MEANING_MAX - 1).join("")}…` : meaning, day,
  };
}

/** Đọc một khối bất kỳ (localStorage) thành quà; sai dạng thì null. */
export function parseGift(raw: unknown): PetGift | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" && v.trim() !== "" ? v : null);
  const videoId = str(r.videoId), term = str(r.term), meaning = str(r.meaning), day = str(r.day);
  if (!videoId || !term || !meaning || !day) return null;
  return { videoId, term, meaning, day, pinyin: typeof r.pinyin === "string" && r.pinyin.trim() ? r.pinyin : null };
}
