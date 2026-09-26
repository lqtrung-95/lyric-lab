import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { pickPrimaryEntry } from "@/lib/dictionary/lookup-words";

type Dictionary = ReadonlyMap<string, DictWordRow[]>;
const HAN = /\p{Script=Han}/u;
const MAX_PART = 4;

/** Các đoạn con (1–4 chữ) của một từ, dùng để tra khi cả từ không có trong từ điển. */
export function subwordsOf(word: string): string[] {
  const chars = [...word];
  const parts = new Set<string>();
  for (let i = 0; i < chars.length; i++) {
    for (let len = 1; len <= Math.min(MAX_PART, chars.length - i); len++) parts.add(chars.slice(i, i + len).join(""));
  }
  return [...parts];
}

/** Từ chứa chữ Hán mà từ điển không có nguyên từ: cần tra thêm các đoạn con để ghép pinyin. */
export const wordsMissingFrom = (words: Iterable<string>, dictionary: Dictionary) =>
  [...new Set(words)].filter((w) => HAN.test(w) && !dictionary.has(w));

/**
 * Pinyin của một token (giản thể). Có nguyên từ trong từ điển thì dùng luôn; nếu không (jieba hay ghép cụm như 好了吗)
 * thì ghép từ các đoạn con dài nhất tìm được. Chữ nào cũng không có thì giữ nguyên chữ đó.
 */
export function pinyinForToken(simplified: string, dictionary: Dictionary): string {
  const whole = pickPrimaryEntry(dictionary.get(simplified) ?? []);
  if (whole) return whole.pinyin;
  const chars = [...simplified];
  const out: string[] = [];
  for (let i = 0; i < chars.length; ) {
    let matched = false;
    for (let len = Math.min(MAX_PART, chars.length - i); len >= 1; len--) {
      const part = chars.slice(i, i + len).join("");
      const entry = HAN.test(part) ? pickPrimaryEntry(dictionary.get(part) ?? []) : null;
      if (entry) {
        out.push(entry.pinyin);
        i += len;
        matched = true;
        break;
      }
    }
    if (!matched) out.push(chars[i++]);
  }
  return out.join(" ");
}

/** Dòng pinyin: mỗi token một đoạn, token không phải chữ Hán (dấu câu, chữ Latin) giữ nguyên. */
export function buildLinePinyin(tokens: { text: string; simplified: string }[], dictionary: Dictionary): string {
  return tokens.map((t) => (HAN.test(t.simplified) ? pinyinForToken(t.simplified, dictionary) : t.text)).join(" ");
}

/** Bổ sung vào từ điển các đoạn con của từ thiếu (tra thêm một lượt), để ghép pinyin cho token như 好了吗. Trả bản mới, không sửa bản gốc. */
export async function withSubwordEntries(
  lookup: (terms: string[]) => Promise<Map<string, DictWordRow[]>>,
  dictionary: Dictionary,
  words: Iterable<string>,
): Promise<Map<string, DictWordRow[]>> {
  const merged = new Map(dictionary);
  const missing = wordsMissingFrom(words, dictionary);
  if (missing.length === 0) return merged;
  const parts = [...new Set(missing.flatMap(subwordsOf))].filter((p) => !merged.has(p));
  for (const [k, v] of await lookup(parts)) merged.set(k, v);
  return merged;
}
