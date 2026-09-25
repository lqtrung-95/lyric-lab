import type { TokenizedLine, VocabCandidate, VocabOccurrence } from "./analysis-types";
import type { LlmOutput } from "./llm-output-schema";

export interface ValidVocab {
  candidate: VocabCandidate;
  meaningInContext: string;
  contextNote?: string;
  priority: number;
}
export interface ValidGrammar {
  pattern: string;
  explanation: string;
  example: { zh: string; vi: string };
  commonMistake?: string;
  level?: number;
  occurrences: VocabOccurrence[];
  priority: number;
}
export interface Dropped {
  kind: "vocab" | "grammar";
  ref: string;
  reason: string;
}
export interface ValidatedOutput {
  vocab: ValidVocab[];
  grammar: ValidGrammar[];
  translations: Map<number, string>;
  dropped: Dropped[];
}

const HAN_RUN = /\p{Script=Han}+/gu;

/** Mọi cụm chữ Hán trong công thức phải xuất hiện theo thứ tự trong dòng (bỏ qua A, B, V, O, dấu +). */
export function patternMatchesLine(pattern: string, lineSimplified: string): boolean {
  const runs = pattern.match(HAN_RUN);
  if (!runs) return false;
  let from = 0;
  for (const run of runs) {
    const at = lineSimplified.indexOf(run, from);
    if (at < 0) return false;
    from = at + run.length;
  }
  return true;
}

/**
 * Áp quy tắc: từ vựng phải nằm trong danh sách ứng viên (đã có vị trí thật); ngữ pháp phải khớp ít nhất một
 * dòng lời thật, chỉ giữ các dòng khớp; bản dịch chỉ nhận cho dòng có thật. Mục không khớp bị loại và ghi lại.
 */
export function validateLlmOutput(out: LlmOutput, lines: TokenizedLine[], candidates: VocabCandidate[]): ValidatedOutput {
  const dropped: Dropped[] = [];
  const byTerm = new Map<string, VocabCandidate>();
  candidates.forEach((c) => {
    byTerm.set(c.term, c);
    byTerm.set(c.traditional, c);
  });

  const seen = new Set<string>();
  const vocab: ValidVocab[] = [];
  for (const v of out.vocab) {
    const candidate = byTerm.get(v.term);
    if (!candidate) dropped.push({ kind: "vocab", ref: v.term, reason: "không có trong danh sách ứng viên" });
    else if (seen.has(candidate.term)) dropped.push({ kind: "vocab", ref: v.term, reason: "trùng" });
    else {
      seen.add(candidate.term);
      vocab.push({ candidate, meaningInContext: v.meaningInContext, contextNote: v.contextNote, priority: v.priority });
    }
  }

  const lineByIndex = new Map(lines.map((l) => [l.index, l]));
  const grammar: ValidGrammar[] = [];
  for (const g of out.grammar) {
    const matched = [...new Set(g.lineIndexes)]
      .map((i) => lineByIndex.get(i))
      .filter((l): l is TokenizedLine => !!l && patternMatchesLine(g.pattern, l.simplified));
    if (matched.length === 0) {
      dropped.push({ kind: "grammar", ref: g.pattern, reason: "công thức không khớp dòng lời nào được nêu" });
      continue;
    }
    grammar.push({
      pattern: g.pattern, explanation: g.explanation, example: g.example, commonMistake: g.commonMistake,
      level: g.level, priority: g.priority,
      occurrences: matched.map((l) => ({ lineIndex: l.index, start: l.start })),
    });
  }

  const translations = new Map<number, string>();
  out.translations.forEach((t) => lineByIndex.has(t.lineIndex) && translations.set(t.lineIndex, t.vi));

  return { vocab, grammar, translations, dropped };
}
