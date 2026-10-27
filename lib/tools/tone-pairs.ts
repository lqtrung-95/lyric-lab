/** Thanh của một âm tiết: 1–4 và 5 là thanh nhẹ. */
export type PairTone = 1 | 2 | 3 | 4 | 5;

export interface TonePair {
  first: 1 | 2 | 3 | 4;
  second: PairTone;
  han: string;
  pinyin: string;
  vi: string;
  /** Ghi chú cách đọc riêng của cặp (đổi thanh, thanh nhẹ...). */
  note?: string;
}

/**
 * 20 cặp thanh của từ hai âm tiết (bốn thanh đầu × bốn thanh + thanh nhẹ ở âm sau), mỗi cặp một từ thông dụng làm mẫu.
 * Dữ liệu viết tay, có test kiểm tra thanh của pinyin khớp cặp khai báo.
 */
export const TONE_PAIRS: readonly TonePair[] = [
  { first: 1, second: 1, han: "今天", pinyin: "jīntiān", vi: "hôm nay" },
  { first: 1, second: 2, han: "中国", pinyin: "Zhōngguó", vi: "Trung Quốc" },
  { first: 1, second: 3, han: "开始", pinyin: "kāishǐ", vi: "bắt đầu" },
  { first: 1, second: 4, han: "工作", pinyin: "gōngzuò", vi: "công việc, làm việc" },
  { first: 1, second: 5, han: "妈妈", pinyin: "māma", vi: "mẹ", note: "Âm sau là thanh nhẹ: ngắn, nhẹ, hơi thấp hơn âm trước." },
  { first: 2, second: 1, han: "明天", pinyin: "míngtiān", vi: "ngày mai" },
  { first: 2, second: 2, han: "学习", pinyin: "xuéxí", vi: "học tập" },
  { first: 2, second: 3, han: "牛奶", pinyin: "niúnǎi", vi: "sữa bò" },
  { first: 2, second: 4, han: "学校", pinyin: "xuéxiào", vi: "trường học" },
  { first: 2, second: 5, han: "朋友", pinyin: "péngyou", vi: "bạn bè", note: "Âm sau là thanh nhẹ, đọc ngắn và nhẹ." },
  { first: 3, second: 1, han: "北京", pinyin: "Běijīng", vi: "Bắc Kinh", note: "Thanh 3 đứng trước thanh khác chỉ đọc nửa đầu (xuống thấp), không lên lại." },
  { first: 3, second: 2, han: "美国", pinyin: "Měiguó", vi: "nước Mỹ", note: "Thanh 3 đứng trước thanh khác chỉ đọc nửa đầu (xuống thấp)." },
  { first: 3, second: 3, han: "你好", pinyin: "nǐ hǎo", vi: "xin chào", note: "Hai thanh 3 liền nhau: âm đầu đọc thành thanh 2, nghe như ní hǎo." },
  { first: 3, second: 4, han: "好看", pinyin: "hǎokàn", vi: "đẹp, dễ nhìn", note: "Thanh 3 đứng trước thanh khác chỉ đọc nửa đầu (xuống thấp)." },
  { first: 3, second: 5, han: "我们", pinyin: "wǒmen", vi: "chúng tôi", note: "Thanh 3 trước thanh nhẹ giữ thấp, âm sau đi lên nhẹ." },
  { first: 4, second: 1, han: "大家", pinyin: "dàjiā", vi: "mọi người" },
  { first: 4, second: 2, han: "问题", pinyin: "wèntí", vi: "câu hỏi, vấn đề" },
  { first: 4, second: 3, han: "汉语", pinyin: "Hànyǔ", vi: "tiếng Hán" },
  { first: 4, second: 4, han: "再见", pinyin: "zàijiàn", vi: "tạm biệt", note: "Hai thanh 4 liền: âm đầu dốc xuống từ cao, âm sau xuống tiếp nhưng không mạnh bằng." },
  { first: 4, second: 5, han: "谢谢", pinyin: "xièxie", vi: "cảm ơn", note: "Âm sau là thanh nhẹ: ngắn và nhẹ." },
];

const MARK_TONES: [RegExp, 1 | 2 | 3 | 4][] = [[/[āēīōūǖ]/, 1], [/[áéíóúǘ]/, 2], [/[ǎěǐǒǔǚ]/, 3], [/[àèìòùǜ]/, 4]];

/** Thanh của từ hai âm tiết suy ra từ dấu thanh trong pinyin: có hai dấu thì [thanh đầu, thanh sau], chỉ một dấu thì âm sau là thanh nhẹ (5). */
export function tonesOfPinyin(pinyin: string): [number, PairTone] | null {
  const marks = [...pinyin.toLowerCase()].flatMap((ch) => MARK_TONES.filter(([re]) => re.test(ch)).map(([, t]) => t));
  if (marks.length === 2) return [marks[0], marks[1]];
  if (marks.length === 1) return [marks[0], 5];
  return null;
}

export const pairLabel = (p: Pick<TonePair, "first" | "second">): string => `${p.first}-${p.second}`;

export interface PairQuestion { pair: TonePair; options: string[] }

const shuffled = <T,>(items: readonly T[], random: () => number): T[] => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

/** Trò nghe đoán cặp: mỗi câu một từ mẫu (không lặp) và bốn đáp án là cặp thanh (một đúng, ba sai khác nhau), thứ tự ngẫu nhiên. */
export function buildPairQuiz(count = 8, random: () => number = Math.random): PairQuestion[] {
  return shuffled(TONE_PAIRS, random).slice(0, Math.min(count, TONE_PAIRS.length)).map((pair) => {
    const wrong = shuffled(TONE_PAIRS.filter((p) => pairLabel(p) !== pairLabel(pair)), random).slice(0, 3).map(pairLabel);
    return { pair, options: shuffled([pairLabel(pair), ...wrong], random) };
  });
}
