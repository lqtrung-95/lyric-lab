import { toSimplifiedChinese } from "@/lib/text/to-simplified-chinese";

// Từ thừa trong tiêu đề video (không phải tên bài).
const NOISE =
  /official\s*(music\s*)?(video|mv|audio|lyric\s*video)|\bm\/?v\b|lyrics?(\s*video)?|pinyin|hd|4k|完整版|高清|高畫質|高画质|官方|歌词版?|歌詞版?|动态歌词|動態歌詞|拼音|纯享版|純享版|字幕|[　-〿]/gi;
// Câu trích lời trong 『』「」 (có chữ Hán) là lời bài hát, không dùng để tìm.
const QUOTED_LYRIC = /[『「][^』」]*\p{Script=Han}[^』」]*[』」]/gu;
const BRACKETED = /[【\[《](.+?)[】\]》]/g;
const HAN_RUN = /\p{Script=Han}{2,}/gu;
const MAX_QUERIES = 5;

const tidy = (s: string) => s.replace(/[(（]\s*[)）]/g, " ").replace(/[-–—|｜·•『』「」]+/g, " ").replace(/\s+/g, " ").trim();
const clean = (s: string) => tidy(s.replace(NOISE, " "));

/**
 * Sinh tối đa 5 truy vấn LRCLIB từ tiêu đề video, theo thứ tự ưu tiên:
 * 1) toàn bộ cụm chữ Hán (thường là "nghệ sĩ + tên bài") ở giản thể; 2) từng cụm chữ Hán;
 * 3) nội dung trong 《》【】; 4) cả tiêu đề đã làm sạch. LRCLIB tìm khớp chặt nên tiêu đề có chữ Latin thừa
 * (vd. "Sunny Day") thường không ra kết quả nếu dùng nguyên.
 */
export function buildLrclibQueries(title: string): string[] {
  const noQuotedLyrics = title.replace(QUOTED_LYRIC, " ");
  const withoutNoise = noQuotedLyrics.replace(NOISE, " ");
  const hanRuns = [...withoutNoise.matchAll(HAN_RUN)].map((m) => toSimplifiedChinese(m[0]));
  const bracketed = [...noQuotedLyrics.matchAll(BRACKETED)]
    .map((m) => clean(m[1]))
    .filter((s) => /\p{Script=Han}/u.test(s));
  const full = clean(noQuotedLyrics.replace(BRACKETED, " $1 "));

  const candidates = [hanRuns.length > 1 ? hanRuns.join(" ") : "", ...hanRuns, ...bracketed, full];
  const seen = new Set<string>();
  return candidates
    .filter((q) => q.length >= 2)
    .filter((q) => {
      const key = toSimplifiedChinese(q).toLowerCase();
      return seen.has(key) ? false : (seen.add(key), true);
    })
    .slice(0, MAX_QUERIES);
}
