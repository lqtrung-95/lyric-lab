import type { AnalyzedLine } from "@/lib/analysis/analysis-types";

export interface LineSegment {
  text: string;
  /** Mục từ vựng nếu đoạn này là nguyên một từ được tô sáng. */
  vocabId?: string;
  /** Mục ngữ pháp nếu đoạn này thuộc công thức được gạch chân. */
  grammarId?: string;
}

export interface HighlightSets {
  vocabIds: ReadonlySet<string>;
  /** Cụm ngữ pháp trong dòng này, kèm vị trí ký tự (từ `occurrences[].ranges`). */
  grammar: { id: string; ranges: [number, number][] }[];
}

/**
 * Chia một dòng lời thành các đoạn để tô sáng: từ vựng (cả từ là một đoạn) và cụm ngữ pháp (gạch chân theo ký tự).
 */
export function buildLineSegments(line: Pick<AnalyzedLine, "tokens">, highlights: HighlightSets): LineSegment[] {
  const grammarAt = new Map<number, string>();
  for (const g of highlights.grammar) {
    for (const [a, b] of g.ranges) {
      for (let i = a; i < b; i++) if (!grammarAt.has(i)) grammarAt.set(i, g.id);
    }
  }

  const segments: LineSegment[] = [];
  let offset = 0;
  for (const token of line.tokens) {
    const vocabId = token.itemId && highlights.vocabIds.has(token.itemId) ? token.itemId : undefined;
    // Mỗi token tách thành các đoạn liên tiếp có cùng trạng thái ngữ pháp.
    let buffer = "";
    let current: string | undefined;
    [...token.text].forEach((ch, k) => {
      const g = grammarAt.get(offset + k);
      if (buffer && g !== current) {
        segments.push({ text: buffer, vocabId, grammarId: current });
        buffer = "";
      }
      buffer += ch;
      current = g;
    });
    if (buffer) segments.push({ text: buffer, vocabId, grammarId: current });
    offset += token.text.length;
  }
  return segments;
}
