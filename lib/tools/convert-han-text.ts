import { Jieba } from "@node-rs/jieba";
import { dict } from "@node-rs/jieba/dict.js";
import { pinyinForToken, withSubwordEntries } from "@/lib/analysis/build-line-pinyin";
import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { pickPrimaryEntry } from "@/lib/dictionary/lookup-words";
import { sinoVietForWord } from "@/lib/dictionary/sino-viet";
import { toSimplifiedChinese } from "@/lib/text/to-simplified-chinese";
import { MAX_CONVERT_CHARS, type ConvertedLine, type ConvertedToken } from "./han-converter-shared";

export { joinField, MAX_CONVERT_CHARS, type ConvertedLine, type ConvertedToken } from "./han-converter-shared";

/** Hai hàm tra dữ liệu (từ điển và bảng âm Hán Việt) để tách khỏi Supabase khi kiểm thử. */
export interface ConvertDeps {
  lookupWords(terms: string[]): Promise<Map<string, DictWordRow[]>>;
  sinoVietReadings(chars: string[]): Promise<Map<string, string[]>>;
}

const MAX_LINES = 40;
const HAN = /\p{Script=Han}/u;

let jieba: Jieba | null = null;
const getJieba = () => (jieba ??= Jieba.withDict(dict));

/** Bản phồn thể của một token để tra âm Hán Việt: từ nguyên vẹn trong từ điển, không thì ghép từng chữ (chữ lạ giữ nguyên, người dùng gõ phồn thể thì vẫn đúng). */
function traditionalOf(simplified: string, original: string, dictionary: ReadonlyMap<string, DictWordRow[]>): string {
  const whole = pickPrimaryEntry(dictionary.get(simplified) ?? []);
  if (whole) return whole.traditional;
  const original_ = [...original];
  return [...simplified].map((ch, i) => pickPrimaryEntry(dictionary.get(ch) ?? [])?.traditional ?? original_[i] ?? ch).join("");
}

/**
 * Chuyển văn bản chữ Hán (giản hoặc phồn thể) thành pinyin và âm Hán Việt theo từng từ. Tách từ bằng jieba trên bản giản thể (không HMM, như pipeline phân tích),
 * pinyin lấy từ từ điển (từ nhiều âm chọn âm thông dụng), Hán Việt ghép từ bảng Unihan; thiếu chữ nào trong bảng thì để trống chứ không đoán. Cắt ở
 * `MAX_CONVERT_CHARS` chữ và `MAX_LINES` dòng; dòng trống bị bỏ.
 */
export async function convertHanText(input: string, deps: ConvertDeps): Promise<ConvertedLine[]> {
  const lines = input.slice(0, MAX_CONVERT_CHARS).split(/\r?\n/).map((l) => l.trim()).filter(Boolean).slice(0, MAX_LINES);
  const cut = lines.map((original) => {
    const simplified = toSimplifiedChinese(original);
    // Cắt token theo độ dài trên bản giản thể; nếu chuyển thể làm đổi độ dài dòng thì dùng luôn bản giản thể làm bản hiển thị.
    const aligned = simplified.length === original.length;
    let offset = 0;
    return getJieba().cut(simplified, false).filter((w) => w.trim() !== "").map((w) => {
      const text = aligned ? original.slice(offset, offset + w.length) : w;
      offset += w.length;
      return { text, simplified: w };
    });
  });

  const terms = [...new Set(cut.flat().filter((t) => HAN.test(t.simplified)).map((t) => t.simplified))];
  if (terms.length === 0) return cut.map((tokens) => ({ tokens: tokens.map((t) => ({ text: t.text, pinyin: null, sinoViet: null })) }));
  const dictionary = await withSubwordEntries(deps.lookupWords, await deps.lookupWords(terms), terms);

  const traditional = new Map<string, string>();
  for (const t of cut.flat()) if (HAN.test(t.simplified)) traditional.set(t.simplified + "\u0000" + t.text, traditionalOf(t.simplified, t.text, dictionary));
  const chars = [...new Set([...traditional.values()].flatMap((s) => [...s]).filter((c) => HAN.test(c)))];
  const readings = await deps.sinoVietReadings(chars);

  return cut.map((tokens) => ({
    tokens: tokens.map((t): ConvertedToken => {
      if (!HAN.test(t.simplified)) return { text: t.text, pinyin: null, sinoViet: null };
      return {
        text: t.text,
        pinyin: pinyinForToken(t.simplified, dictionary),
        sinoViet: sinoVietForWord(traditional.get(t.simplified + "\u0000" + t.text) ?? t.text, readings),
      };
    }),
  }));
}
