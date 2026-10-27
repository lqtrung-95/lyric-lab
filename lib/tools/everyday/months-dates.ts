import type { Phrase, QuizQuestion } from "./everyday-types";
import { WEEKDAYS } from "./days-data";

const DIGIT_ZH = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"] as const;
const DIGIT_PY = ["líng", "yī", "èr", "sān", "sì", "wǔ", "liù", "qī", "bā", "jiǔ"] as const;

interface Reading { zh: string; pinyin: string }

/** Đọc số 1–99 (dùng cho tháng, ngày): 10 → 十, 12 → 十二, 20 → 二十, 28 → 二十八. */
export function numberReading(n: number): Reading {
  if (!Number.isInteger(n) || n < 1 || n > 99) throw new RangeError(`numberReading: ${n}`);
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  const zh = `${tens > 1 ? DIGIT_ZH[tens] : ""}${tens > 0 ? "十" : ""}${ones > 0 ? DIGIT_ZH[ones] : ""}`;
  const parts = [...(tens > 1 ? [DIGIT_PY[tens]] : []), ...(tens > 0 ? ["shí"] : []), ...(ones > 0 ? [DIGIT_PY[ones]] : [])];
  return { zh, pinyin: joinSyllables(parts) };
}

/** Nối các âm tiết, thêm dấu nháy trước âm tiết bắt đầu bằng nguyên âm (shí'èr) để không đọc nhầm ranh giới. */
function joinSyllables(parts: readonly string[]): string {
  return parts.map((p, i) => (i > 0 && /^[aāáǎàeēéěèoōóǒò]/.test(p) ? `'${p}` : p)).join("");
}

/** Năm đọc từng chữ số: 2026 → 二零二六 (èr líng èr liù). */
export function yearReading(year: number): Reading {
  if (!Number.isInteger(year) || year < 1000 || year > 9999) throw new RangeError(`yearReading: ${year}`);
  const digits = [...String(year)].map(Number);
  return { zh: digits.map((d) => DIGIT_ZH[d]).join(""), pinyin: digits.map((d) => DIGIT_PY[d]).join(" ") };
}

export interface ChineseDate {
  /** 2026年10月28日 星期三 — viết (日) và nói (号). */
  written: Reading;
  spoken: Reading;
  weekday: { zh: string; pinyin: string; vi: string };
}

/** Đọc một ngày dương lịch (năm, tháng 1–12, ngày) thành tiếng Trung: văn viết dùng 日, khẩu ngữ dùng 号, kèm thứ trong tuần. */
export function formatChineseDate(year: number, month: number, day: number): ChineseDate {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) throw new RangeError(`formatChineseDate: ${year}-${month}-${day}`);
  const y = yearReading(year);
  const m = numberReading(month);
  const d = numberReading(day);
  const wd = WEEKDAYS[(date.getUTCDay() + 6) % 7];
  const build = (suffix: Reading): Reading => ({
    zh: `${y.zh}年${m.zh}月${d.zh}${suffix.zh}`,
    pinyin: `${y.pinyin} nián ${m.pinyin}yuè ${d.pinyin} ${suffix.pinyin}`.replace(/\s+/g, " "),
  });
  return { written: build({ zh: "日", pinyin: "rì" }), spoken: build({ zh: "号", pinyin: "hào" }), weekday: { zh: wd.zh, pinyin: wd.pinyin, vi: wd.vi } };
}

/** Mười hai tháng: 一月 … 十二月. */
export const MONTHS: { zh: string; pinyin: string; vi: string }[] = Array.from({ length: 12 }, (_, i) => {
  const r = numberReading(i + 1);
  return { zh: `${r.zh}月`, pinyin: `${r.pinyin}yuè`, vi: `Tháng ${i + 1}` };
});

export const DATE_PHRASES: Phrase[] = [
  { zh: "今天几号?", pinyin: "Jīntiān jǐ hào?", vi: "Hôm nay ngày mấy?", note: "Hỏi ngày dùng 几号 (khẩu ngữ) hoặc 几月几号 (cả tháng và ngày)." },
  { zh: "今天十月二十八号。", pinyin: "Jīntiān shíyuè èrshíbā hào.", vi: "Hôm nay ngày 28 tháng 10." },
  { zh: "你的生日是几月几号?", pinyin: "Nǐ de shēngrì shì jǐ yuè jǐ hào?", vi: "Sinh nhật bạn là ngày mấy tháng mấy?" },
  { zh: "我的生日是三月五号。", pinyin: "Wǒ de shēngrì shì sānyuè wǔ hào.", vi: "Sinh nhật tôi là ngày 5 tháng 3." },
  { zh: "我们五月一号放假。", pinyin: "Wǒmen wǔyuè yī hào fàngjià.", vi: "Ngày 1 tháng 5 chúng tôi nghỉ lễ.", note: "Trật tự tiếng Trung là lớn đến nhỏ: năm, tháng, ngày, rồi đến thứ và giờ." },
  { zh: "下个月我去北京。", pinyin: "Xià ge yuè wǒ qù Běijīng.", vi: "Tháng sau tôi đi Bắc Kinh." },
  { zh: "二〇二六年十二月三十一日", pinyin: "èr líng èr liù nián shí'èr yuè sānshíyī rì", vi: "Ngày 31 tháng 12 năm 2026", note: "Năm đọc từng chữ số, không đọc như số đếm." },
];

export const DATE_QUIZ: QuizQuestion[] = [
  { prompt: "十月 là tháng mấy?", zh: "十月", options: ["Tháng 1", "Tháng 10", "Tháng 12"], answer: 1, explain: "十 = 10 nên 十月 là tháng 10. Tháng 1 là 一月 (không phải 十月)." },
  { prompt: "Tháng 12 nói là?", options: ["十二月", "二十月", "一二月"], answer: 0, explain: "Tháng 12 = 十二月 (mười hai tháng). Số hai chữ số đọc: mười + đơn vị." },
  { prompt: "Hỏi \"Hôm nay ngày mấy?\"", options: ["今天几号?", "今天什么号?", "今天多少星期?"], answer: 0, explain: "Hỏi ngày dùng 几号 (jǐ hào) hoặc 几月几号 (ngày mấy tháng mấy)." },
  { prompt: "二十八 là số mấy?", zh: "二十八", options: ["18", "28", "82"], answer: 1, explain: "二十 = 20, 八 = 8, nên 二十八 = 28." },
  { prompt: "Trật tự đúng khi nói ngày tháng?", options: ["Ngày, tháng, năm", "Năm, tháng, ngày", "Tháng, năm, ngày"], answer: 1, explain: "Tiếng Trung đi từ lớn đến nhỏ: năm → tháng → ngày." },
  { prompt: "2026 năm đọc là?", options: ["二千零二十六年", "二零二六年", "二六零二年"], answer: 1, explain: "Năm thường đọc từng chữ số: 二零二六年." },
  { prompt: "Tháng 3 ngày 5 nói là?", options: ["五月三号", "三月五号", "三号五月"], answer: 1, explain: "Tháng trước, ngày sau: 三月五号." },
  { prompt: "号 và 日 khác nhau thế nào?", options: ["号 dùng khi nói, 日 dùng khi viết", "号 là tháng, 日 là ngày", "Hai chữ giống hệt nhau"], answer: 0, explain: "Nói: 28号. Văn viết trang trọng: 28日. Nghĩa giống nhau." },
];
