import type { AnalyzedLine } from "@/lib/analysis/analysis-types";

/** Một phần của token có/không thuộc công thức ngữ pháp được gạch chân. */
export interface TokenPart {
  text: string;
  grammarId?: string;
  /** Âm tiết pinyin từng chữ trong `text`, cùng thứ tự — chỉ có khi phần này là chữ Hán, để ghép ruby trên từng chữ. */
  pinyinChars?: string[];
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
 * (có thể cắt ngang token). Mỗi token giữ nguyên để bấm tra từ. Kèm pinyin từng chữ Hán để hiện ngay trên đúng chữ đó
 * (ruby) thay vì một dòng pinyin riêng phía trên cả câu.
 */
export function buildLineSegments(line: Pick<AnalyzedLine, "tokens" | "pinyin">, highlights: HighlightSets): TokenGroup[] {
  const grammarAt = new Map<number, string>();
  for (const g of highlights.grammar) {
    for (const [a, b] of g.ranges) {
      for (let i = a; i < b; i++) if (!grammarAt.has(i)) grammarAt.set(i, g.id);
    }
  }

  // `line.pinyin` ghép pinyin của từng token bằng dấu cách, mỗi chữ Hán đúng một âm tiết (kể cả các âm tiết bên
  // trong một token nhiều chữ), còn token không phải chữ Hán giữ nguyên text làm một "khối" duy nhất — nên số âm
  // tiết ứng với một token Hán luôn bằng đúng số chữ của token đó, lấy lần lượt theo thứ tự là khớp đúng.
  const syllables = line.pinyin.split(/\s+/).filter(Boolean);
  let si = 0;

  let offset = 0;
  return line.tokens.map((token, tokenIndex) => {
    const tokenIsHan = HAN.test(token.text);
    const parts: TokenPart[] = [];
    [...token.text].forEach((ch, k) => {
      const grammarId = grammarAt.get(offset + k);
      const syllable = tokenIsHan ? syllables[si++] : undefined;
      const last = parts[parts.length - 1];
      if (last && last.grammarId === grammarId) {
        last.text += ch;
        if (syllable !== undefined) last.pinyinChars = [...(last.pinyinChars ?? []), syllable];
      } else {
        parts.push({ text: ch, grammarId, pinyinChars: syllable !== undefined ? [syllable] : undefined });
      }
    });
    if (!tokenIsHan) si += 1; // token không Hán chiếm đúng một khối trong chuỗi pinyin, không tách theo ký tự
    offset += token.text.length;
    const vocabId = token.itemId && highlights.vocabIds.has(token.itemId) ? token.itemId : undefined;
    return { tokenIndex, text: token.text, vocabId, isHan: tokenIsHan, parts };
  });
}
