import type { AnalyzedLine } from "@/lib/analysis/analysis-types";
import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";

const HAN = /\p{Script=Han}/u;

/** Một từ chữ Hán trong lời kèm số lần xuất hiện, cấp HSK từ từ điển (null = ngoài HSK hoặc không tra được) và mục từ vựng nếu là từ cốt lõi. */
export interface WordStat {
  term: string;
  level: number | null;
  itemId?: string;
  count: number;
}

/** Cấp HSK thấp nhất trong các mục từ điển của một từ, ưu tiên mục không phải họ người (pinyin viết hoa chữ đầu). */
export function levelFromRows(rows: DictWordRow[] | undefined): number | null {
  if (!rows?.length) return null;
  const normal = rows.filter((r) => !/^[A-ZÀ-Ỹ]/.test(r.pinyin));
  const levels = (normal.length ? normal : rows).map((r) => r.hsk_level).filter((l): l is number => l !== null);
  return levels.length ? Math.min(...levels) : null;
}

/** Danh sách từ chữ Hán khác nhau của lời (để tra từ điển một lượt). */
export function distinctHanTerms(lines: Pick<AnalyzedLine, "tokens">[]): string[] {
  return [...new Set(lines.flatMap((l) => l.tokens.map((t) => t.text).filter((t) => HAN.test(t))))];
}

/** Gom các từ chữ Hán của lời theo (từ, mục từ vựng) kèm số lần xuất hiện và cấp HSK do `levelOf` cho. */
export function collectWordStats(lines: Pick<AnalyzedLine, "tokens">[], levelOf: (term: string) => number | null): WordStat[] {
  const map = new Map<string, WordStat>();
  for (const line of lines) {
    for (const t of line.tokens) {
      if (!HAN.test(t.text)) continue;
      const key = `${t.text}|${t.itemId ?? ""}`;
      const found = map.get(key);
      if (found) found.count++;
      else map.set(key, { term: t.text, level: levelOf(t.text), itemId: t.itemId, count: 1 });
    }
  }
  return [...map.values()];
}
