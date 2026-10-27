import { numberedPinyinToToneMarks } from "@/lib/dictionary/pinyin-tone-marks";
import { hasPinyinTone, toneKey } from "@/lib/tra-tu/pinyin-plain";
import type { WordResult } from "@/lib/tra-tu/types";

export const MAX_PINYIN_QUERY = 40;
export const MAX_PINYIN_RESULTS = 24;

/** Chữ cái pinyin (kể cả nguyên âm có dấu thanh và ü), số thanh 1–5, khoảng trắng, dấu nháy và gạch nối. */
const PINYIN_CHARS = /^[a-züvāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ1-5\s'’-]+$/i;

/** Chuẩn hóa pinyin người dùng gõ; trả null nếu rỗng, có chữ Hán hoặc ký tự lạ (để API báo lỗi rõ ràng thay vì tra bừa). */
export function normalizePinyinQuery(input: string): string | null {
  const q = input.normalize("NFC").trim().replace(/\s+/g, " ").slice(0, MAX_PINYIN_QUERY);
  if (!q || !/[a-zü]/i.test(q) || !PINYIN_CHARS.test(q)) return null;
  return q;
}

export interface PinyinHanResult {
  han: string;
  traditional: string;
  pinyin: string;
  /** Nghĩa tiếng Anh ngắn (CC-CEDICT), tối đa hai nghĩa đầu. */
  meaning: string;
  sinoViet: string | null;
  /** Nghĩa tiếng Việt đã duyệt (nếu có). */
  gloss: string | null;
  hskLevel: number | null;
}

/** Giữ các từ khớp theo pinyin (bỏ khớp theo nghĩa hay Hán Việt), giữ thứ tự xếp hạng của bộ tìm từ điển, rồi rút gọn để hiện. */
export function toPinyinResults(words: readonly WordResult[], limit = MAX_PINYIN_RESULTS): PinyinHanResult[] {
  return words
    .filter((w) => w.match === "pinyin" && w.readings.length > 0)
    .slice(0, limit)
    .map((w) => {
      const reading = w.readings[0];
      return {
        han: w.simplified,
        traditional: w.traditional,
        pinyin: reading.pinyin,
        meaning: reading.meanings.slice(0, 2).join("; "),
        sinoViet: w.sinoViet,
        gloss: w.gloss,
        hskLevel: w.hskLevel,
      };
    });
}

/**
 * Khi người dùng gõ cả thanh ("shi4", "nǐ hǎo") thì chỉ giữ từ đúng thanh đó (so tiền tố, để "shi4" ra cả 事业).
 * Không từ nào đúng thanh thì giữ nguyên danh sách cùng âm và báo `relaxed` để giao diện nói rõ.
 */
export function filterByTone(query: string, results: readonly PinyinHanResult[]): { results: PinyinHanResult[]; relaxed: boolean } {
  if (!hasPinyinTone(query)) return { results: [...results], relaxed: false };
  const spaced = query.toLowerCase().replace(/([1-5])(?=[a-züv])/g, "$1 ").replace(/v/g, "ü");
  const key = toneKey(numberedPinyinToToneMarks(spaced));
  const kept = results.filter((r) => toneKey(r.pinyin).startsWith(key));
  return kept.length > 0 ? { results: kept, relaxed: false } : { results: [...results], relaxed: true };
}
