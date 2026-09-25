import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { pickPrimaryEntry } from "@/lib/dictionary/lookup-words";
import type { TokenizedLine, VocabCandidate } from "./analysis-types";

// Hư từ / trợ từ: không đáng học riêng dù có trong từ điển.
const PARTICLES = new Set([..."的了着過过吗嗎吧呢啊呀哦嗯哈啦嘛哇喔"]);
const MAX_MEANINGS = 3;

export interface CandidateOptions {
  maxCandidates?: number;
  /** Từ 1 chữ chỉ giữ khi có cấp HSK ≥ mức này (từ 1 chữ cơ bản thường là hư từ, đại từ). */
  minSingleCharLevel?: number;
}

/**
 * Tính sẵn danh sách từ ứng viên cho LLM: từ có trong từ điển, không phải hư từ, xếp theo số lần xuất hiện
 * rồi cấp HSK cao hơn trước (từ khó đáng học hơn). Mọi thông tin (pinyin, cấp, nghĩa) lấy từ từ điển.
 */
export function buildVocabCandidates(
  lines: TokenizedLine[],
  dictionary: ReadonlyMap<string, DictWordRow[]>,
  { maxCandidates = 60, minSingleCharLevel = 3 }: CandidateOptions = {},
): VocabCandidate[] {
  const found = new Map<string, VocabCandidate>();

  for (const line of lines) {
    for (const token of line.tokens) {
      if (!token.isHan || PARTICLES.has(token.simplified)) continue;
      const entry = pickPrimaryEntry(dictionary.get(token.simplified) ?? []);
      if (!entry) continue;
      if (token.simplified.length === 1 && (entry.hsk_level ?? 0) < minSingleCharLevel) continue;

      const existing = found.get(token.simplified);
      const occurrence = { lineIndex: line.index, start: line.start };
      if (existing) {
        if (!existing.occurrences.some((o) => o.lineIndex === line.index)) existing.occurrences.push(occurrence);
      } else {
        found.set(token.simplified, {
          term: token.simplified,
          traditional: entry.traditional,
          pinyin: entry.pinyin,
          hskLevel: entry.hsk_level,
          meanings: entry.meanings.slice(0, MAX_MEANINGS),
          occurrences: [occurrence],
        });
      }
    }
  }

  return [...found.values()]
    .sort((a, b) => b.occurrences.length - a.occurrences.length || (b.hskLevel ?? 0) - (a.hskLevel ?? 0))
    .slice(0, maxCandidates);
}
