import { numericToToneMark } from "@/lib/pronunciation/pinyin-tone-marks";
import { syllablesOf, type Syl } from "./pinyin-parts";

const build = (syls: readonly Syl[], sep: string): string => syls.map((s) => numericToToneMark(`${s.initial}${s.final}${s.tone}`)).join(sep);
const squash = (s: string): string => s.normalize("NFC").toLowerCase().replace(/[\s'’·-]+/g, "");

/**
 * Các lựa chọn "âm đọc" cho một từ: cách đọc đúng và `count - 1` cách đọc SAI chỉ khác về thanh điệu (đổi thanh một hoặc hai âm tiết), nên phải nghe/nhớ thanh mới chọn đúng.
 * Trả `answer` là vị trí cách đọc đúng. Null khi từ không dựng lại được chính xác (âm tiết lạ) hoặc không có chỗ nào đổi thanh an toàn.
 * Tránh các đổi thanh có thể vẫn đọc đúng: 不 và 一 (biến điệu theo chữ sau) và thanh 3 đứng trước thanh 3 (đọc thành thanh 2).
 */
export function toneOptions(han: string, pinyin: string, rng: () => number, count = 3): { options: string[]; answer: number } | null {
  const syls = syllablesOf(pinyin);
  if (!syls) return null;
  const sep = /\s/.test(pinyin.trim()) ? " " : "";
  if (squash(build(syls, "")) !== squash(pinyin)) return null;
  const chars = [...han];
  const free = syls.map((_, i) => i).filter((i) => !(chars.length === syls.length && "不一".includes(chars[i])));
  if (free.length === 0) return null;
  const right = build(syls, sep);
  const seen = new Set([right]);
  const wrongs: string[] = [];
  for (let tries = 0; tries < 60 && wrongs.length < count - 1; tries++) {
    const copy = syls.map((s) => ({ ...s }));
    for (let k = rng() < 0.3 && free.length > 1 ? 2 : 1; k > 0; k--) {
      const i = free[Math.floor(rng() * free.length)];
      const alts = [1, 2, 3, 4, 5].filter((t) => t !== syls[i].tone);
      copy[i].tone = alts[Math.floor(rng() * alts.length)];
    }
    if (syls.some((s, i) => s.tone === 3 && syls[i + 1]?.tone === 3 && copy[i].tone === 2)) continue;
    const text = build(copy, sep);
    if (!seen.has(text)) { seen.add(text); wrongs.push(text); }
  }
  if (wrongs.length < count - 1) return null;
  const answer = Math.floor(rng() * count);
  return { options: [...wrongs.slice(0, answer), right, ...wrongs.slice(answer)], answer };
}
