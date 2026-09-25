import type { AnalyzedLine } from "@/lib/analysis/analysis-types";

/** Một phần của token có/không thuộc công thức ngữ pháp được gạch chân. */
export interface TokenPart {
  text: string;
  grammarId?: string;
}

/** Một token (từ) của dòng lời, chia thành các phần theo ngữ pháp. */
export interface TokenGroup {
  tokenIndex: number;
  text: string;
  /** Mục từ vựng nếu token này được tô sáng. */
  vocabId?: string;
  /** Token chứa chữ Hán (bấm được để tra từ). */
  isHan: boolean;
  parts: TokenPart[];
}

export interface HighlightSets {
  vocabIds: ReadonlySet<string>;
  /** Cụm ngữ pháp trong dòng này, kèm vị trí ký tự (từ `occurrences[].ranges`). */
  grammar: { id: string; ranges: [number, number][] }[];
}

const HAN = /\p{Script=Han}/u;

/**
 * Chia một dòng lời thành các token để hiển thị: từ vựng được tô sáng cả token, cụm ngữ pháp được gạch chân theo ký tự
 * (có thể cắt ngang token). Mỗi token giữ nguyên để bấm tra từ.
 */
export function buildLineSegments(line: Pick<AnalyzedLine, "tokens">, highlights: HighlightSets): TokenGroup[] {
  const grammarAt = new Map<number, string>();
  for (const g of highlights.grammar) {
    for (const [a, b] of g.ranges) {
      for (let i = a; i < b; i++) if (!grammarAt.has(i)) grammarAt.set(i, g.id);
    }
  }

  let offset = 0;
  return line.tokens.map((token, tokenIndex) => {
    const parts: TokenPart[] = [];
    [...token.text].forEach((ch, k) => {
      const grammarId = grammarAt.get(offset + k);
      const last = parts[parts.length - 1];
      if (last && last.grammarId === grammarId) last.text += ch;
      else parts.push({ text: ch, grammarId });
    });
    offset += token.text.length;
    const vocabId = token.itemId && highlights.vocabIds.has(token.itemId) ? token.itemId : undefined;
    return { tokenIndex, text: token.text, vocabId, isHan: HAN.test(token.text), parts };
  });
}
