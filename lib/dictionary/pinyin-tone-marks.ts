// Đổi pinyin đánh số của CC-CEDICT ("xi3 huan5", "lu:e4") sang pinyin có dấu thanh ("xǐ huan", "lüè").
const TONES: Record<string, string> = {
  a: "āáǎàa", e: "ēéěèe", i: "īíǐìi", o: "ōóǒòo", u: "ūúǔùu", ü: "ǖǘǚǜü",
};
const VOWELS = "aeiouü";

function markSyllable(raw: string): string {
  const m = raw.match(/^([a-zA-ZüÜ:]+?)([1-5])?$/);
  if (!m) return raw;
  const base = m[1].replace(/u:/gi, "ü").replace(/U:/g, "Ü");
  const tone = m[2] ? Number(m[2]) : 5;
  if (tone === 5) return base;

  const lower = base.toLowerCase();
  // Quy tắc đặt dấu: a hoặc e nếu có; "ou" đặt trên o; còn lại nguyên âm cuối.
  let idx = lower.indexOf("a");
  if (idx < 0) idx = lower.indexOf("e");
  if (idx < 0 && lower.includes("ou")) idx = lower.indexOf("o");
  if (idx < 0) for (let i = lower.length - 1; i >= 0; i--) if (VOWELS.includes(lower[i])) { idx = i; break; }
  if (idx < 0) return base;

  const marked = TONES[lower[idx]][tone - 1];
  return base.slice(0, idx) + (base[idx] !== lower[idx] ? marked.toUpperCase() : marked) + base.slice(idx + 1);
}

export function numberedPinyinToToneMarks(pinyin: string): string {
  return pinyin.split(" ").map(markSyllable).join(" ");
}
