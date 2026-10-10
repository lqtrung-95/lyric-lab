import type { CaptionLine } from "@/lib/captions/caption-provider-types";
import { cleanCaptionLines } from "@/lib/captions/clean-caption-lines";
import { buildLinePinyin } from "@/lib/analysis/build-line-pinyin";
import type { TokenizedLine } from "@/lib/analysis/analysis-types";
import { collectHanTerms, tokenizeLyricLines } from "@/lib/analysis/tokenize-lyric-lines";
import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { pickPrimaryEntry } from "@/lib/dictionary/lookup-words";
import { normalizeLyricLines } from "@/lib/lyrics/normalize-lyric-lines";
import type { LessonLine } from "./video-lesson-types";

type Dictionary = ReadonlyMap<string, DictWordRow[]>;

export interface PreparedLine extends TokenizedLine {
  translation: string | null;
}

/**
 * Bước 1 (chưa cần từ điển): làm sạch dòng tiếng Trung, bỏ dòng không phải lời nói, chia từ (jieba). Chưa có bản dịch (`translation: null`): bản dịch do LLM điền ở bước
 * sau, theo đúng các dòng đã làm sạch này. Dòng gộp ngắn dùng ngưỡng mặc định của `cleanCaptionLines`.
 */
export function prepareLessonLines(zh: CaptionLine[]): PreparedLine[] {
  const lines = tokenizeLyricLines(normalizeLyricLines(cleanCaptionLines(zh)));
  return lines.map((l) => ({ ...l, translation: null }));
}

/** Các từ chữ Hán cần tra từ điển để dựng pinyin và tính level (không trùng). */
export const termsToLookUp = (lines: PreparedLine[]): string[] => collectHanTerms(lines);

/** Bước 2: dựng dòng hoàn chỉnh (pinyin theo từng từ) từ bản đã chuẩn bị và từ điển. */
export function toLessonLines(prepared: PreparedLine[], dictionary: Dictionary): LessonLine[] {
  return prepared.map((l, idx) => ({
    idx,
    start: l.start,
    end: l.end,
    text: l.text,
    pinyin: buildLinePinyin(l.tokens, dictionary),
    translation: l.translation,
    tokens: l.tokens.map((t) => ({ text: t.text })),
  }));
}

/** Cấp HSK trung bình của các từ (mỗi lần xuất hiện tính một lần, bỏ từ ngoài HSK); null nếu không từ nào có cấp. Dùng để lọc "vừa sức". */
export function averageLessonLevel(prepared: PreparedLine[], dictionary: Dictionary): number | null {
  const levels: number[] = [];
  for (const line of prepared) {
    for (const t of line.tokens) {
      if (!t.isHan) continue;
      const level = pickPrimaryEntry(dictionary.get(t.simplified) ?? [])?.hsk_level;
      if (typeof level === "number") levels.push(level);
    }
  }
  return levels.length === 0 ? null : Math.round((levels.reduce((a, b) => a + b, 0) / levels.length) * 10) / 10;
}
