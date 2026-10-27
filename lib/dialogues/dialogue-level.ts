import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { pickPrimaryEntry } from "@/lib/dictionary/lookup-words";
import { subwordsOf } from "@/lib/analysis/build-line-pinyin";
import type { LevelBand } from "./dialogue-types";

const COVERAGE = 0.9;

/** Cấp HSK của một từ (từ điển); từ ghép chưa có thì lấy cấp cao nhất trong các chữ/đoạn con đã có cấp. Null nếu không tra được. */
function wordLevel(word: string, dictionary: ReadonlyMap<string, DictWordRow[]>): number | null {
  const direct = pickPrimaryEntry(dictionary.get(word) ?? [])?.hsk_level ?? null;
  if (direct !== null) return direct;
  const parts = subwordsOf(word).map((p) => pickPrimaryEntry(dictionary.get(p) ?? [])?.hsk_level ?? null).filter((l): l is number => l !== null);
  return parts.length > 0 ? Math.max(...parts) : null;
}

/**
 * Cấp HSK của một hội thoại (quy tắc 2: lấy từ từ điển, không để AI đoán): cấp nhỏ nhất mà ≥ 90% từ có cấp nằm trong đó.
 * Dùng phân vị thay vì cấp cao nhất để một tên riêng hay từ hiếm không đẩy cả bài lên cấp cao. Cấp 4 trở lên gộp một nhóm; không có từ nào có cấp thì null.
 */
export function dialogueLevel(words: readonly string[], dictionary: ReadonlyMap<string, DictWordRow[]>): LevelBand | null {
  const levels = words.map((w) => wordLevel(w, dictionary)).filter((l): l is number => l !== null).sort((a, b) => a - b);
  if (levels.length === 0) return null;
  const at = levels[Math.min(levels.length - 1, Math.ceil(levels.length * COVERAGE) - 1)];
  return Math.min(4, Math.max(1, at)) as LevelBand;
}
