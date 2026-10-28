/** Một câu để xếp: nghĩa tiếng Việt làm đề, các thẻ từ đã xáo, và thứ tự đúng. */
export interface OrderItem {
  zh: string;
  vi: string;
  /** Thứ tự đúng của các thẻ (đã bỏ dấu câu). */
  tokens: string[];
  /** Các thẻ đã xáo trộn (khác thứ tự đúng). */
  tiles: string[];
  pinyin?: string;
}

export const MIN_TILES = 3;
export const MAX_TILES = 8;

const HAN = /\p{Script=Han}/u;

/** Câu một vế: ngoài dấu kết câu ở cuối, không có dấu câu nào ở giữa (câu nhiều vế xếp thứ tự dễ mơ hồ). */
export const isSingleClause = (zh: string): boolean => !/[。!?!?,,;;、:]/.test(zh.replace(/[。!?!?]+$/, ""));

/** Các thẻ từ của một câu: chỉ lấy từ có chữ Hán (bỏ dấu câu và ký tự khác). */
export const toTiles = (tokens: readonly { simplified: string }[]): string[] => tokens.map((t) => t.simplified).filter((w) => HAN.test(w));

/** Câu vừa sức xếp: đủ dài để có thứ tự, không quá dài để không rối. */
export const isEligible = (tokens: readonly string[]): boolean => tokens.length >= MIN_TILES && tokens.length <= MAX_TILES;

/** Xáo trộn các thẻ sao cho khác thứ tự đúng (thử lại vài lần, rồi xoay vòng nếu vẫn trùng); câu chỉ gồm thẻ giống nhau thì giữ nguyên. */
export function shuffleDifferent(tokens: readonly string[], rng: () => number = Math.random): string[] {
  const same = (a: readonly string[]) => a.every((w, i) => w === tokens[i]);
  if (new Set(tokens).size < 2) return [...tokens];
  for (let attempt = 0; attempt < 12; attempt++) {
    const a = [...tokens];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    if (!same(a)) return a;
  }
  const rotated = [...tokens.slice(1), tokens[0]];
  return same(rotated) ? [...tokens].reverse() : rotated;
}

/** Vị trí đặt sai trong đáp án (rỗng nghĩa là đúng hết). Hai thẻ giống chữ coi như đổi chỗ được. */
export const wrongPositions = (answer: readonly string[], tokens: readonly string[]): number[] =>
  tokens.flatMap((w, i) => (answer[i] === w ? [] : [i]));
