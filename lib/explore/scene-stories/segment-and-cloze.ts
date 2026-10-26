/** Một mảnh của câu: chữ thường, hoặc một từ của cảnh (để tô màu và bấm vào). */
export interface Segment { text: string; term?: string }

/** Cắt một câu thành các mảnh, đánh dấu những chỗ là từ của cảnh (ưu tiên từ dài khi trùng chỗ). */
export function segmentLine(zh: string, terms: readonly string[]): Segment[] {
  const sorted = [...new Set(terms)].sort((a, b) => b.length - a.length);
  const out: Segment[] = [];
  let buf = "";
  for (let i = 0; i < zh.length; ) {
    const hit = sorted.find((t) => zh.startsWith(t, i));
    if (hit) {
      if (buf) { out.push({ text: buf }); buf = ""; }
      out.push({ text: hit, term: hit });
      i += hit.length;
    } else {
      buf += zh[i];
      i++;
    }
  }
  if (buf) out.push({ text: buf });
  return out;
}

export interface ClozeItem {
  /** Dòng của truyện có chỗ trống. */
  lineIndex: number;
  before: string;
  answer: string;
  after: string;
  /** Các đáp án (đã xáo), gồm đáp án đúng và các từ khác của cảnh. */
  options: string[];
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Dựng bài điền từ từ chính truyện: mỗi câu được chọn khoét một từ của cảnh (từ đầu tiên trong câu), mỗi từ chỉ khoét một lần,
 * kèm 3 từ khác của cảnh làm đáp án nhiễu. Trả tối đa `count` câu, theo thứ tự trong truyện.
 */
export function buildCloze(lines: readonly { zh: string }[], terms: readonly string[], count = 4, rng: () => number = Math.random): ClozeItem[] {
  const used = new Set<string>();
  const picks: ClozeItem[] = [];
  lines.forEach((line, lineIndex) => {
    const seg = segmentLine(line.zh, terms);
    const idx = seg.findIndex((s) => s.term && !used.has(s.term));
    if (idx < 0) return;
    const answer = seg[idx].term!;
    used.add(answer);
    picks.push({ lineIndex, before: seg.slice(0, idx).map((s) => s.text).join(""), answer, after: seg.slice(idx + 1).map((s) => s.text).join(""), options: [] });
  });
  const chosen = shuffle(picks, rng).slice(0, count).sort((a, b) => a.lineIndex - b.lineIndex);
  const pool = [...new Set(terms)];
  return chosen.map((c) => {
    const distractors = shuffle(pool.filter((t) => t !== c.answer && !c.before.includes(t) && !c.after.includes(t)), rng).slice(0, 3);
    return { ...c, options: shuffle([c.answer, ...distractors], rng) };
  });
}
