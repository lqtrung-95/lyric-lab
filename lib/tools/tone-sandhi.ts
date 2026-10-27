import { alignPinyin } from "@/lib/pinyin/align-ruby";
import { numericToToneMark } from "@/lib/pronunciation/pinyin-tone-marks";
import type { ConvertedLine } from "./han-converter-shared";

export type SandhiRule = "third" | "bu" | "yi-fourth" | "yi-other" | "yi-between";

export const SANDHI_RULE_TEXT: Record<SandhiRule, string> = {
  third: "Hai thanh 3 liền nhau: chữ đứng trước đọc thành thanh 2.",
  bu: "不 đứng trước thanh 4 đọc là bú (thanh 2).",
  "yi-fourth": "一 đứng trước thanh 4 đọc là yí (thanh 2).",
  "yi-other": "一 đứng trước thanh 1, 2, 3 đọc là yì (thanh 4).",
  "yi-between": "一 nằm giữa hai động từ giống nhau (看一看) đọc nhẹ, không dấu.",
};

export interface SandhiChar { ch: string; /** Pinyin có dấu của chữ này; null với dấu câu, số, chữ Latin. */ py: string | null }
export interface SandhiSyllable { ch: string; py: string | null; /** Cách đọc thực tế khi nói (bằng `py` nếu không đổi). */ spoken: string | null; rule?: SandhiRule }

const TONE_MARK: Record<string, 1 | 2 | 3 | 4> = { "̄": 1, "́": 2, "̌": 3, "̀": 4 };

/** Tách pinyin có dấu thành âm gốc (giữ ü) và thanh 1–4 (5 = thanh nhẹ, không dấu). */
export function parseSyllable(marked: string): { base: string; tone: 1 | 2 | 3 | 4 | 5 } {
  let tone: 1 | 2 | 3 | 4 | 5 = 5;
  const base = [...marked.normalize("NFD")].filter((c) => {
    const t = TONE_MARK[c];
    if (t) { tone = t; return false; }
    return true;
  }).join("").normalize("NFC");
  return { base, tone };
}

const withTone = (base: string, tone: number) => numericToToneMark(`${base}${tone}`);
const isOrdinalContext = (prev: SandhiChar | undefined) => !!prev && (prev.ch === "第" || /[0-9０-９]/.test(prev.ch));

/**
 * Áp quy tắc biến điệu thanh điệu của tiếng Trung phổ thông lên một dãy chữ có pinyin: (1) hai thanh 3 liền nhau, chữ trước đọc thanh 2;
 * (2) 不 trước thanh 4 đọc bú; (3) 一 trước thanh 4 đọc yí, trước thanh 1/2/3 đọc yì, giữa hai động từ giống nhau đọc nhẹ; 一 đứng cuối, đứng riêng
 * hoặc là số thứ tự (第一, 一月) thì giữ yī. Dấu câu và ký tự không phải chữ Hán ngắt mạch. Tính theo thanh gốc của chữ đứng sau (không phải thanh đã đổi).
 */
export function applySandhi(chars: readonly SandhiChar[]): SandhiSyllable[] {
  return chars.map((c, i) => {
    if (!c.py) return { ch: c.ch, py: null, spoken: null };
    const { base, tone } = parseSyllable(c.py);
    const next = chars[i + 1]?.py ? parseSyllable(chars[i + 1].py as string) : null;
    const prev = chars[i - 1];
    const out = (spoken: string, rule?: SandhiRule): SandhiSyllable => ({ ch: c.ch, py: c.py, spoken, rule });
    if (tone === 3 && next?.tone === 3) return out(withTone(base, 2), "third");
    if (c.ch === "不" && next?.tone === 4) return out(withTone(base, 2), "bu");
    if (c.ch === "一" && next && !isOrdinalContext(prev)) {
      if (prev?.py && chars[i - 1].ch === chars[i + 1].ch) return out(base, "yi-between");
      if (next.tone === 4) return out(withTone(base, 2), "yi-fourth");
      return out(withTone(base, 4), "yi-other");
    }
    return out(c.py);
  });
}

/** Dựng dãy chữ có pinyin từng chữ từ kết quả `han-to-pinyin` (mỗi dòng một dãy). Token không căn được pinyin theo chữ thì mọi chữ trong token đó coi như không có pinyin. */
export function charsFromConverted(lines: readonly ConvertedLine[]): SandhiChar[][] {
  return lines.map((line) => line.tokens.flatMap((t): SandhiChar[] => {
    const py = t.pinyin ? alignPinyin(t.text, t.pinyin) : null;
    return [...t.text].map((ch, i) => ({ ch, py: py?.[i] ? py[i] : null }));
  }));
}
