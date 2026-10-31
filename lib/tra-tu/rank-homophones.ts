import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { popularityBonus } from "./rank-results";

export interface SoundAlike { simplified: string; pinyin: string; hskLevel: number | null; meaning: string; gloss: string | null }

const SURNAME = /^\p{Lu}/u;

/**
 * Từ cùng âm với `self`: nhóm "cùng cách đọc" (pinyin y hệt, cùng thanh) và nhóm "cùng âm khác thanh" (khác thanh điệu, ví dụ mā / mǎ / mà). Mỗi từ một dòng (cách đọc phổ biến nhất),
 * phổ biến trước, tên riêng (pinyin viết hoa) bị bỏ. Cùng độ dài với từ đang xem trước (so sánh công bằng: 1 chữ với 1 chữ).
 */
export function rankSoundAlikes(rows: DictWordRow[], self: string, selfPinyin: string, limit: number): { same: SoundAlike[]; otherTone: SoundAlike[] } {
  const selfLen = [...self].length;
  const best = new Map<string, DictWordRow>();
  for (const r of rows) {
    if (r.simplified === self || SURNAME.test(r.pinyin) || [...r.simplified].length !== selfLen) continue;
    const cur = best.get(r.simplified);
    if (!cur || popularityBonus(r.hsk_level, r.frequency) > popularityBonus(cur.hsk_level, cur.frequency)) best.set(r.simplified, r);
  }
  const norm = (p: string) => p.trim().toLowerCase();
  const sorted = [...best.values()].sort((a, b) => popularityBonus(b.hsk_level, b.frequency) - popularityBonus(a.hsk_level, a.frequency));
  const mk = (r: DictWordRow): SoundAlike => ({ simplified: r.simplified, pinyin: r.pinyin, hskLevel: r.hsk_level, meaning: r.meanings[0] ?? "", gloss: null });
  return {
    same: sorted.filter((r) => norm(r.pinyin) === norm(selfPinyin)).slice(0, limit).map(mk),
    otherTone: sorted.filter((r) => norm(r.pinyin) !== norm(selfPinyin)).slice(0, limit).map(mk),
  };
}
