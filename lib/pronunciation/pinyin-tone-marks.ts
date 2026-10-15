// Đổi pinyin ghi số thanh ("hao 3", "lv4") sang pinyin có dấu ("hǎo", "lǜ"). Azure trả dạng ghi số.
const MARKS: Record<string, string[]> = {
  a: ["ā", "á", "ǎ", "à"], e: ["ē", "é", "ě", "è"], i: ["ī", "í", "ǐ", "ì"],
  o: ["ō", "ó", "ǒ", "ò"], u: ["ū", "ú", "ǔ", "ù"], ü: ["ǖ", "ǘ", "ǚ", "ǜ"],
};

/** Âm tiết ghi số thanh → có dấu. Thanh 5 (nhẹ) hoặc không có số: bỏ dấu. Dấu đặt theo quy tắc: a/e trước, "ou" đặt ở o, còn lại đặt ở nguyên âm cuối. */
export function numericToToneMark(raw: string): string {
  const m = raw.trim().toLowerCase().match(/^([a-züv]+)\s*([0-5])?$/);
  if (!m) return raw.trim();
  const base = m[1].replace(/v/g, "ü");
  const tone = Number(m[2] ?? 5);
  if (tone < 1 || tone > 4) return base;
  const chars = [...base];
  let at = chars.findIndex((c) => c === "a" || c === "e");
  if (at < 0) at = base.includes("ou") ? chars.indexOf("o") : chars.findLastIndex((c) => c in MARKS);
  if (at < 0) return base;
  chars[at] = MARKS[chars[at]][tone - 1];
  return chars.join("");
}

/** Tách "zhong" → phụ âm đầu "zh" + vần "ong". Âm không phụ âm đầu (an, e, wo...) trả initial rỗng. */
export function splitSyllable(syllable: string): { initial: string; final: string } {
  const s = syllable.toLowerCase().replace(/v/g, "ü");
  const initial = ["zh", "ch", "sh", ..."bpmfdtnlgkhjqxrzcs"].find((i) => s.startsWith(i) && s.length > i.length) ?? "";
  return { initial, final: s.slice(initial.length) };
}
