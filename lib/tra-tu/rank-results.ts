import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { COMMON_READING } from "@/lib/dictionary/lookup-words";
import type { ClassifiedQuery } from "./classify-query";
import { plainPinyin, toneKey } from "./pinyin-plain";
import type { MatchKind, WordReading, WordResult } from "./types";

/** Một dòng từ điển do một nguồn tìm kiếm trả về, kèm nguồn đó (để biết khớp theo cách nào). */
export interface Candidate {
  row: DictWordRow;
  source: "han" | "pinyin" | "sino-viet" | "vi-gloss" | "english";
  /** Chỉ cho nguồn `vi-gloss`: độ mạnh khớp (xem `GlossHit`). */
  strength?: number;
}

// Người Việt gõ một từ tiếng Việt thường muốn nghĩa ("yêu" → 爱), hơn là âm Hán Việt trùng chữ ("yếu" → 要): khớp trọn nghĩa đã duyệt xếp trên khớp Hán Việt.
const GLOSS_SCORE: Record<number, number> = { 3: 700, 2: 540, 1: 400 };

const VARIANT = /^(old |archaic |erhua |japanese |korean )?(variant|see |used in )/i;
const SURNAME = /^[A-ZÀ-Ỹ]/;

/** Điểm "phổ biến": cấp HSK thấp và tần suất cao lên trước. Nhỏ hơn mọi chênh lệch giữa các kiểu khớp để chỉ phân thắng bại trong cùng kiểu. */
export function popularityBonus(hsk: number | null, frequency: number | null): number {
  const level = hsk ? 70 - hsk * 8 : 0;
  const freq = frequency && frequency < 1_000_000 ? Math.max(0, 30 - Math.log10(Math.max(frequency, 1)) * 5) : 0;
  return level + freq;
}

/** Độ mạnh khớp nghĩa tiếng Anh: ngăn ";" của CC-CEDICT thành các ý ngắn; "to love" tính là khớp "love". */
export function englishStrength(meanings: string[], q: string): { match: number; kind: MatchKind } | null {
  let best = 0;
  const word = new RegExp(`(^|[^a-z])${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`);
  for (const m of meanings) for (const part of m.toLowerCase().split(";")) {
    const p = part.trim().replace(/^(to|a|an|the) /, "");
    if (p === q) best = Math.max(best, 520);
    else if (word.test(part)) best = Math.max(best, 300);
    else if (part.includes(q)) best = Math.max(best, 120);
  }
  return best ? { match: best, kind: "english" } : null;
}

function hanScore(row: DictWordRow, han: string, simplified: string): { score: number; kind: MatchKind } {
  if (row.simplified === simplified || row.traditional === han || row.simplified === han) return { score: 1000, kind: "exact" };
  if (row.simplified.startsWith(simplified) || row.traditional.startsWith(han)) return { score: 600 - (row.simplified.length - simplified.length) * 12, kind: "han-prefix" };
  return { score: 160 - row.simplified.length * 4, kind: "han-contains" };
}

function pinyinScore(row: DictWordRow, q: ClassifiedQuery): number {
  const plain = plainPinyin(row.pinyin);
  const exact = plain === q.plainPinyin;
  const toned = toneKey(q.raw);
  // Người gõ có dấu thanh thì thưởng mục khớp đúng thanh: "mā" ra 妈 trước 马/吗.
  const toneBonus = toneKey(row.pinyin).startsWith(toned) && toned !== q.plainPinyin ? 60 : 0;
  return (exact ? 700 : 450 - Math.min(plain.length - (q.plainPinyin?.length ?? 0), 20) * 6) + toneBonus;
}

function scoreCandidate(c: Candidate, q: ClassifiedQuery, simplifiedHan: string): { score: number; kind: MatchKind } {
  const { row } = c;
  const pop = popularityBonus(row.hsk_level, row.frequency);
  if (c.source === "han") { const h = hanScore(row, q.han ?? "", simplifiedHan); return { score: h.score + pop, kind: h.kind }; }
  if (c.source === "pinyin") return { score: pinyinScore(row, q) + pop, kind: "pinyin" };
  // Nhiều âm tiết khớp đúng là tín hiệu rất cụ thể ("thành thị" → 城市), hơn một ý nghĩa trùng văn bản.
  if (c.source === "sino-viet") return { score: (q.folded?.includes(" ") ? 760 : 650) + pop, kind: "sino-viet" };
  if (c.source === "vi-gloss") return { score: (GLOSS_SCORE[c.strength ?? 1] ?? 400) + pop, kind: "vi-gloss" };
  const e = englishStrength(row.meanings, q.folded ?? "") ?? { match: 100, kind: "english" as const };
  return { score: e.match + pop, kind: "english" };
}

/**
 * Thứ tự các cách đọc trong một từ: cách đọc ghi đè thủ công (`COMMON_READING`) trước, mục họ người/biến thể sau cùng; còn lại theo cấp HSK, tần suất,
 * rồi số ý nghĩa nhiều hơn (cách đọc thông dụng có nhiều nghĩa hơn: 的 "de" 5 nghĩa so với "dī" 1 nghĩa dù cùng cấp HSK 1).
 */
export function sortReadings(rows: DictWordRow[]): WordReading[] {
  const forced = COMMON_READING[rows[0]?.simplified ?? ""];
  const weight = (r: DictWordRow) => (forced && toneKey(r.pinyin) === toneKey(forced) ? 0
    : VARIANT.test(r.meanings[0] ?? "") || SURNAME.test(r.pinyin) ? 3 : r.hsk_level ? 1 : 2);
  return [...rows]
    .sort((a, b) => weight(a) - weight(b) || (a.hsk_level ?? 99) - (b.hsk_level ?? 99) || (a.frequency ?? 1e9) - (b.frequency ?? 1e9) || b.meanings.length - a.meanings.length)
    .map((r) => ({ pinyin: r.pinyin, meanings: r.meanings, hskLevel: r.hsk_level, frequency: r.frequency }));
}

/** Gộp các dòng ứng viên thành từ (theo giản+phồn), điểm của từ = điểm cao nhất của một dòng khớp, rồi xếp giảm dần. `simplifiedHan` là truy vấn chữ Hán đã đổi sang giản thể. */
export function rankCandidates(candidates: Candidate[], q: ClassifiedQuery, simplifiedHan: string, limit: number): WordResult[] {
  const groups = new Map<string, { rows: Map<string, DictWordRow>; score: number; kind: MatchKind }>();
  for (const c of candidates) {
    const key = `${c.row.simplified}|${c.row.traditional}`;
    const { score, kind } = scoreCandidate(c, q, simplifiedHan);
    const g = groups.get(key) ?? { rows: new Map(), score: -1, kind };
    g.rows.set(c.row.pinyin, c.row);
    if (score > g.score) { g.score = score; g.kind = kind; }
    groups.set(key, g);
  }
  const results = [...groups.values()].map((g): WordResult => {
    const rows = [...g.rows.values()];
    const readings = sortReadings(rows);
    const levels = readings.map((r) => r.hskLevel).filter((l): l is number => l !== null);
    return {
      simplified: rows[0].simplified, traditional: rows[0].traditional, readings, sinoViet: null, gloss: null,
      hskLevel: levels.length ? Math.min(...levels) : null, match: g.kind, score: g.score,
    };
  });
  return results.sort((a, b) => b.score - a.score || a.simplified.length - b.simplified.length).slice(0, limit);
}
