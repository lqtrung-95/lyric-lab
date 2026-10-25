import { numberedPinyinToToneMarks } from "@/lib/dictionary/pinyin-tone-marks";

export interface Classifier { text: string; pinyin: string }
export interface FormattedMeanings { senses: string[]; classifiers: Classifier[] }

// CC-CEDICT viết tham chiếu chéo dạng `愛|爱[ai4]` (phồn|giản[pinyin số]) và lượng từ dạng `CL:個|个[ge4],位[wei4]`.
const CROSS_REF = /([\p{Script=Han}]+)\|([\p{Script=Han}]+)\[([a-zA-Z0-9: ]+)\]/gu;
const PLAIN_REF = /([\p{Script=Han}]+)\[([a-zA-Z0-9: ]+)\]/gu;
const BARE_PINYIN = /\[([a-zA-Z]+[1-5](?: [a-zA-Z]+[1-5])*)\]/g;
const CL = /^CL:(.+)$/;

const tone = (p: string) => numberedPinyinToToneMarks(p.toLowerCase().replace(/u:/g, "ü"));

/** Đổi ký hiệu tham chiếu của CC-CEDICT sang chữ đọc được: `愛|爱[ai4]` → `爱 (ài)`. */
export function prettifyMeaning(m: string): string {
  return m.replace(CROSS_REF, (_, _t: string, s: string, p: string) => `${s} (${tone(p)})`).replace(PLAIN_REF, (_, h: string, p: string) => `${h} (${tone(p)})`).replace(BARE_PINYIN, (_, p: string) => `(${tone(p)})`);
}

/** Tách các ý nghĩa thường khỏi dòng lượng từ (`CL:…`), đổi pinyin số sang dấu thanh. Lượng từ lấy nguyên từ từ điển. */
export function formatMeanings(meanings: string[]): FormattedMeanings {
  const senses: string[] = [];
  const classifiers: Classifier[] = [];
  for (const m of meanings) {
    const cl = CL.exec(m.trim());
    if (!cl) { senses.push(prettifyMeaning(m)); continue; }
    for (const part of cl[1].split(",")) {
      const hit = /^(?:[\p{Script=Han}]+\|)?([\p{Script=Han}]+)\[([a-zA-Z0-9: ]+)\]$/u.exec(part.trim());
      if (hit) classifiers.push({ text: hit[1], pinyin: tone(hit[2]) });
    }
  }
  return { senses, classifiers };
}
