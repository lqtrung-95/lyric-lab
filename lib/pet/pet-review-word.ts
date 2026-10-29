import { cleanSavedMeaning } from "@/lib/lookup/clean-saved-meaning";

/** Từ đang đến hạn ôn mà pet "mang theo" trong bóng thoại. Pinyin lấy từ thẻ đã lưu (nguồn từ điển), không do AI sinh. */
export interface PetReviewWord { term: string; pinyin: string | null; meaning: string }

/** Số thẻ đầu hàng đợi giữ lại cho pet (đủ để đổi từ, không tải thêm gì). */
export const PET_PEEK_SIZE = 3;
const MEANING_MAX = 40;

/** Lấy vài thẻ đầu hàng đợi thành từ cho pet: bỏ thẻ thiếu chữ Hán hoặc nghĩa, làm sạch và cắt ngắn nghĩa. */
export function peekReviewWords(queue: readonly { term: string; pinyin: string | null; meaning: string }[], size = PET_PEEK_SIZE): PetReviewWord[] {
  const out: PetReviewWord[] = [];
  for (const c of queue) {
    if (out.length >= size) break;
    const term = c.term?.trim();
    const meaning = cleanSavedMeaning(c.meaning ?? "", term ?? "").trim();
    if (!term || !meaning) continue;
    out.push({ term, pinyin: c.pinyin?.trim() || null, meaning: meaning.length > MEANING_MAX ? `${meaning.slice(0, MEANING_MAX - 1)}…` : meaning });
  }
  return out;
}

/** Từ cho lần chạm thứ `seed`: quay vòng qua các từ. Không có từ thì null. */
export function pickReviewWord(words: readonly PetReviewWord[], seed: number): PetReviewWord | null {
  if (words.length === 0) return null;
  return words[Number.isFinite(seed) ? Math.abs(Math.trunc(seed)) % words.length : 0];
}

/** Nhãn đọc cho trình đọc màn hình: "笨拙 (bènzhuō): vụng về. Bấm để nghe". */
export const reviewWordLabel = (w: PetReviewWord): string => `${w.term}${w.pinyin ? ` (${w.pinyin})` : ""}: ${w.meaning}. Bấm để nghe`;
