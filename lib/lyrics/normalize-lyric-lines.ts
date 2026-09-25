import type { CaptionLine } from "@/lib/captions/caption-provider-types";
import { toSimplifiedChinese } from "@/lib/text/to-simplified-chinese";
import type { NormalizedLyricLine } from "./lyrics-types";

// Dòng thông tin người thực hiện (thường nằm đầu file LRC), không phải lời hát.
const CREDIT =
  /^\s*(作词|作詞|作曲|编曲|編曲|词|詞|曲|词曲|詞曲|制作人|製作人|监制|監製|演唱|歌手|原唱|混音|录音|錄音|和声|和聲|吉他|贝斯|貝斯|鼓|钢琴|鋼琴|弦乐|弦樂|出品|发行|發行|lyrics?|lyricist|composer|arranger|producer|music|vocal)\s*[:：]/i;
// Dòng chú âm phù hiệu (ㄅㄆㄇ) hoặc nốt nhạc solfege (Re So So Si Do…): phần dạo đàn ghi kèm lời.
const BOPOMOFO = /[㄀-ㄯㆠ-ㆿ]/g;
const SOLFEGE = /^\s*((do|re|mi|fa|sol?|la|si|ti)\b[\s\-–]*)+$/i;

function isNonLyric(text: string): boolean {
  if (CREDIT.test(text) || SOLFEGE.test(text)) return true;
  const bopomofo = text.match(BOPOMOFO)?.length ?? 0;
  return bopomofo > 0 && bopomofo >= text.replace(/\s/g, "").length / 2;
}

/**
 * Loại dòng không phải lời (credit, chú âm, solfege), đánh lại `index`, thêm bản giản thể.
 * Giữ dòng không có chữ Hán (vd. "yeah-eh-eh") với `hasHan = false` để phần tách từ bỏ qua.
 */
export function normalizeLyricLines(lines: CaptionLine[]): NormalizedLyricLine[] {
  return lines
    .filter((l) => !isNonLyric(l.text))
    .map((l, index) => ({
      index,
      text: l.text,
      simplified: toSimplifiedChinese(l.text),
      start: l.start,
      end: l.end,
      hasHan: /\p{Script=Han}/u.test(l.text),
    }));
}
