import type { CaptionLine } from "@/lib/captions/caption-provider-types";

// Một số video có phụ đề nhiều tầng kiểu "nǐ hǎo 你好 Hello there": pinyin và bản dịch tiếng Anh chen cùng dòng với chữ Hán. Bỏ chúng để lời chỉ còn tiếng Trung
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
function stripPinyinTokens(text: string): string[] {
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
  return kept;
}

const LATIN_WORD = /[A-Za-z]/;
const PUNCT_ONLY = /^[\s\p{P}\p{S}]+$/u;

/**
 * Với dòng có chữ Hán: bỏ cụm từ Latin dài từ hai từ trở lên (bản dịch tiếng Anh/Việt chen vào: "Hi, everyone", "I am Lala"). Từ Latin đơn lẻ được giữ
 * (OK, app, iPhone, WiFi là chữ thật trong lời tiếng Trung). Rồi bỏ dấu câu mồ côi còn thừa ở đầu và cuối dòng.
 */
function dropLatinTranslation(tokens: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < tokens.length; ) {
    const isLatin = (t: string) => LATIN_WORD.test(t) && !HAN.test(t);
    if (!isLatin(tokens[i])) { out.push(tokens[i]); i++; continue; }
    let end = i;
    while (end < tokens.length && isLatin(tokens[end])) end++;
    if (end - i < 2) out.push(tokens[i]); // một từ đơn lẻ: giữ
    i = end;
  }
  while (out.length > 0 && PUNCT_ONLY.test(out[0])) out.shift();
  while (out.length > 0 && PUNCT_ONLY.test(out[out.length - 1]) && out.length > 1) out.pop();
  return out;
}

/** Bỏ pinyin (mọi dòng) và bản dịch Latin chen vào (dòng có chữ Hán) trong một dòng phụ đề; dòng không còn gì trả về chuỗi rỗng. */
export function stripNonChinese(text: string): string {
  const tokens = stripPinyinTokens(text);
  return (HAN.test(text) ? dropLatinTranslation(tokens) : tokens).join(" ");
}

/** Dòng chỉ có pinyin/tiếng Anh/ký hiệu ([Music]) bị bỏ khi bản chép lời có đủ dòng chữ Hán (từ 30%); bản chép gần như không có chữ Hán giữ nguyên để bước kiểm tra "không phải tiếng Trung" bắt được. */
const MIN_HAN_LINE_SHARE = 0.3;

/** Làm sạch mọi dòng: bỏ pinyin, bản dịch Latin chen vào, và các dòng không có chữ Hán (khi bản chép chủ yếu là tiếng Trung); bỏ dòng rỗng. */
export function stripNonChineseFromLines(lines: CaptionLine[]): CaptionLine[] {
  const cleaned = lines.map((l) => ({ ...l, text: stripNonChinese(l.text) })).filter((l) => l.text.length > 0);
  const hanShare = lines.length === 0 ? 0 : lines.filter((l) => HAN.test(l.text)).length / lines.length;
  return hanShare >= MIN_HAN_LINE_SHARE ? cleaned.filter((l) => HAN.test(l.text)) : cleaned;
}
