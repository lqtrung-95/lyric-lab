// Đáp án nhiễu cho câu "chọn pinyin": đổi thanh điệu của MỘT âm tiết trong đáp án đúng. Đáp án nhiễu kiểu này không loại trừ được bằng cách
// nhìn hình thức (cùng chữ cái, chỉ khác dấu), nên chỉ người thật sự biết thanh điệu mới chọn đúng.
const MARKS: Record<string, string[]> = {
  a: ["ā", "á", "ǎ", "à"], e: ["ē", "é", "ě", "è"], i: ["ī", "í", "ǐ", "ì"],
  o: ["ō", "ó", "ǒ", "ò"], u: ["ū", "ú", "ǔ", "ù"], ü: ["ǖ", "ǘ", "ǚ", "ǜ"],
};
const MARK_INFO = new Map<string, { base: string; tone: number }>(Object.entries(MARKS).flatMap(([base, list]) => list.map((c, i): [string, { base: string; tone: number }] => [c, { base, tone: i + 1 }])));

type Random = () => number;

/** Mọi biến thể khác đáp án đúng bằng cách đổi thanh (1–4) của một âm tiết đã có dấu. Âm tiết thanh nhẹ (không dấu) giữ nguyên. */
export function allToneVariants(pinyin: string): string[] {
  const syllables = pinyin.trim().split(/\s+/);
  const out = new Set<string>();
  syllables.forEach((syl, si) => {
    const chars = [...syl];
    const at = chars.findIndex((c) => MARK_INFO.has(c));
    if (at < 0) return;
    const { base, tone } = MARK_INFO.get(chars[at])!;
    for (let t = 1; t <= 4; t++) {
      if (t === tone) continue;
      const next = [...chars];
      next[at] = MARKS[base][t - 1];
      const copy = [...syllables];
      copy[si] = next.join("");
      out.add(copy.join(" "));
    }
  });
  out.delete(pinyin.trim());
  return [...out];
}

/** `count` biến thể thanh điệu khác nhau (xáo ngẫu nhiên); ít hơn `count` nếu từ không đủ âm tiết có dấu để đổi. */
export function toneVariants(pinyin: string, count: number, random: Random = Math.random): string[] {
  const all = allToneVariants(pinyin);
  for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
  return all.slice(0, count);
}
