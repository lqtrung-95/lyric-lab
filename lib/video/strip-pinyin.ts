import type { CaptionLine } from "@/lib/captions/caption-provider-types";

// Một số video có phụ đề song ngữ kiểu "nǐ hǎo 你好": pinyin chen cùng dòng với chữ Hán. Bỏ phần pinyin để lời chỉ còn tiếng Trung
// (pinyin của app lấy từ từ điển, xem docs). Chỉ coi là pinyin một cụm từ liền nhau mà MỌI từ đều ghép được từ âm tiết pinyin
// và có ít nhất một từ mang dấu thanh — câu tiếng Anh/Việt không có dấu thanh pinyin nên không bị đụng tới.

const INITIAL = "(?:zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])?";
const FINAL = "(?:iang|iong|uang|ueng|ang|eng|ing|ong|ian|iao|uai|uan|üan|ai|ei|ao|ou|an|en|in|un|ün|er|ia|ie|iu|ua|uo|ue|üe|ui|a|o|e|i|u|ü|v)";
const SYLLABLES = new RegExp(`^(?:${INITIAL}${FINAL})+$`);
// Dấu thanh pinyin (huyền, sắc, ngang, hỏi-ngã kiểu pinyin); giữ nguyên dấu hai chấm trên ü.
const TONE_MARKS = /[̀́̄̌]/g;
// Dấu ngang và dấu móc ngược chỉ có ở pinyin, tiếng Việt không có: đủ để nhận pinyin ở dòng không có chữ Hán.
const PINYIN_ONLY_MARKS = /[̄̌]/;
const HAN = /\p{Script=Han}/u;
const EDGE_PUNCT = /^[\s"'“”‘’(),.!?;:…-]+|[\s"'“”‘’(),.!?;:…-]+$/g;

interface Word { raw: string; toned: boolean; pinyinOnly: boolean; syllabic: boolean }

function classify(raw: string): Word {
  const core = raw.replace(EDGE_PUNCT, "");
  const decomposed = core.normalize("NFD");
  const toned = TONE_MARKS.test(decomposed);
  TONE_MARKS.lastIndex = 0;
  const pinyinOnly = PINYIN_ONLY_MARKS.test(decomposed);
  const plain = decomposed.replace(TONE_MARKS, "").normalize("NFC").replace(/'/g, "").toLowerCase();
  return { raw, toned, pinyinOnly, syllabic: plain.length > 0 && SYLLABLES.test(plain) };
}

/** Bỏ các cụm pinyin chen trong một dòng phụ đề; dòng toàn pinyin trả về chuỗi rỗng. */
export function stripPinyin(text: string): string {
  // Dòng có chữ Hán: mọi dấu thanh đều tính. Dòng không có chữ Hán (có thể là tiếng Việt: "chào", "các"): chỉ tin dấu ngang/móc ngược.
  const hasHan = HAN.test(text);
  const words = text.split(/\s+/).filter(Boolean).map(classify);
  const kept: string[] = [];
  for (let i = 0; i < words.length; ) {
    if (!words[i].syllabic) { kept.push(words[i].raw); i++; continue; }
    let end = i;
    while (end < words.length && words[end].syllabic) end++;
    const run = words.slice(i, end);
    if (!run.some((w) => (hasHan ? w.toned : w.pinyinOnly))) { kept.push(...run.map((w) => w.raw)); i = end; continue; }
    // Tên/chữ cái lặp lại ngay trước cụm pinyin và ngay sau nó ("Q, nǐ hǎo Q，你好") thì chỉ giữ một bản.
    const prev = kept.at(-1);
    const next = words[end]?.raw;
    if (prev && next && /^[A-Za-z][,，.]?$/.test(prev) && next.toLowerCase().startsWith(prev[0].toLowerCase())) kept.pop();
    i = end;
  }
  return kept.join(" ");
}

/** Bỏ pinyin ở mọi dòng và loại các dòng chỉ còn lại rỗng. */
export const stripPinyinFromLines = (lines: CaptionLine[]): CaptionLine[] =>
  lines.map((l) => ({ ...l, text: stripPinyin(l.text) })).filter((l) => l.text.length > 0);
