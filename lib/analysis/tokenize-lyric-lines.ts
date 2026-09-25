import { Jieba } from "@node-rs/jieba";
import { dict } from "@node-rs/jieba/dict.js";
import type { NormalizedLyricLine } from "@/lib/lyrics/lyrics-types";
import type { LyricToken, TokenizedLine } from "./analysis-types";

let jieba: Jieba | null = null;
const getJieba = () => (jieba ??= Jieba.withDict(dict));
const HAN = /\p{Script=Han}/u;

/**
 * Tách từ trên bản giản thể (jieba, tắt HMM: lời hát ít từ lạ, HMM hay ghép sai kiểu "没想" "过会").
 * Token giữ bản gốc bằng cách cắt theo độ dài; nếu chuyển giản thể làm đổi độ dài dòng thì dùng luôn bản giản thể.
 */
export function tokenizeLyricLines(lines: NormalizedLyricLine[]): TokenizedLine[] {
  return lines.map((line) => {
    const words = line.hasHan ? getJieba().cut(line.simplified, false) : [line.simplified];
    const aligned = line.simplified.length === line.text.length;
    let offset = 0;
    const tokens: LyricToken[] = words
      .map((w): LyricToken => {
        const text = aligned ? line.text.slice(offset, offset + w.length) : w;
        offset += w.length;
        return { text, simplified: w, isHan: HAN.test(w) };
      })
      .filter((t) => t.simplified.trim() !== "");
    return { ...line, tokens };
  });
}

/** Các từ chứa chữ Hán cần tra từ điển (không trùng). */
export function collectHanTerms(lines: TokenizedLine[]): string[] {
  return [...new Set(lines.flatMap((l) => l.tokens.filter((t) => t.isHan).map((t) => t.simplified)))];
}
