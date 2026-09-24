import type { CaptionLine } from "./caption-provider-types";

export type ChineseScript = "simplified" | "traditional" | "mixed" | "unknown";

export interface LyricQuality {
  lineCount: number;
  /** Tỉ lệ dòng có phần lớn là chữ Hán (tiêu chí IN-03). */
  hanLineRatio: number;
  /** Tỉ lệ ký tự chữ Hán trên tổng ký tự chữ cái. */
  hanCharRatio: number;
  /** Tổng thời gian có lời (giây). */
  coverageSec: number;
  medianLineSec: number;
  /** Số dòng vừa có chữ Hán vừa có ≥ 3 chữ Latin (song ngữ / pinyin). */
  bilingualLineCount: number;
  script: ChineseScript;
  verdict: "ok" | "unsupported";
}

// Dưới ngưỡng này thì báo "Bài này chưa hỗ trợ" (IN-03).
export const MIN_HAN_LINE_RATIO = 0.6;

const HAN = /\p{Script=Han}/gu;
const LATIN = /[A-Za-z]/g;
// Mẫu ký tự chỉ có ở một hệ chữ, đủ cho heuristic. Chuyển đổi thật để M1.
const SIMPLIFIED_ONLY = new Set([..."爱说这们时会对为还带过开关让点长见觉听现问动实进边导汉学么后见吗给间写乐点从没华"]);
const TRADITIONAL_ONLY = new Set([..."愛說這們時會對為還帶過開關讓點長見覺聽現問動實進邊導漢學麼後嗎給間寫樂點從沒華"]);

const count = (s: string, re: RegExp) => s.match(re)?.length ?? 0;

function detectScript(text: string): ChineseScript {
  let simp = 0;
  let trad = 0;
  for (const ch of text) {
    if (SIMPLIFIED_ONLY.has(ch)) simp++;
    if (TRADITIONAL_ONLY.has(ch)) trad++;
  }
  if (simp === 0 && trad === 0) return "unknown";
  if (trad === 0 || simp / (simp + trad) > 0.9) return "simplified";
  if (simp === 0 || trad / (simp + trad) > 0.9) return "traditional";
  return "mixed";
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function assessLyricQuality(lines: CaptionLine[]): LyricQuality {
  let hanLines = 0;
  let bilingual = 0;
  let han = 0;
  let letters = 0;
  for (const { text } of lines) {
    const h = count(text, HAN);
    const l = count(text, LATIN);
    han += h;
    letters += h + l;
    if (h > 0 && h >= l) hanLines++;
    if (h > 0 && l >= 3) bilingual++;
  }
  const hanLineRatio = lines.length ? hanLines / lines.length : 0;
  const durations = lines.map((l) => Math.max(0, l.end - l.start));
  return {
    lineCount: lines.length,
    hanLineRatio,
    hanCharRatio: letters ? han / letters : 0,
    coverageSec: durations.reduce((a, b) => a + b, 0),
    medianLineSec: median(durations),
    bilingualLineCount: bilingual,
    script: detectScript(lines.map((l) => l.text).join("")),
    verdict: hanLineRatio >= MIN_HAN_LINE_RATIO ? "ok" : "unsupported",
  };
}
