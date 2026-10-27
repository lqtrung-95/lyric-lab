import type { PhraseGroup, QuizQuestion } from "./everyday-types";

/** Bảy ngày trong tuần: dạng 星期 (phổ biến nhất), kèm 周 (viết nhanh, khẩu ngữ) và 礼拜 (khẩu ngữ miền Nam). */
export const WEEKDAYS: { zh: string; pinyin: string; vi: string; short: string; shortPinyin: string; alt?: string; altPinyin?: string }[] = [
  { zh: "星期一", pinyin: "xīngqīyī", vi: "Thứ Hai", short: "周一", shortPinyin: "zhōuyī" },
  { zh: "星期二", pinyin: "xīngqī'èr", vi: "Thứ Ba", short: "周二", shortPinyin: "zhōu'èr" },
  { zh: "星期三", pinyin: "xīngqīsān", vi: "Thứ Tư", short: "周三", shortPinyin: "zhōusān" },
  { zh: "星期四", pinyin: "xīngqīsì", vi: "Thứ Năm", short: "周四", shortPinyin: "zhōusì" },
  { zh: "星期五", pinyin: "xīngqīwǔ", vi: "Thứ Sáu", short: "周五", shortPinyin: "zhōuwǔ" },
  { zh: "星期六", pinyin: "xīngqīliù", vi: "Thứ Bảy", short: "周六", shortPinyin: "zhōuliù" },
  { zh: "星期日", pinyin: "xīngqīrì", vi: "Chủ Nhật", short: "周日", shortPinyin: "zhōurì", alt: "星期天", altPinyin: "xīngqītiān" },
];

export const DAY_GROUPS: PhraseGroup[] = [
  {
    id: "time-words",
    title: "Nói về hôm nay, ngày mai",
    phrases: [
      { zh: "前天", pinyin: "qiántiān", vi: "hôm kia" },
      { zh: "昨天", pinyin: "zuótiān", vi: "hôm qua" },
      { zh: "今天", pinyin: "jīntiān", vi: "hôm nay" },
      { zh: "明天", pinyin: "míngtiān", vi: "ngày mai" },
      { zh: "后天", pinyin: "hòutiān", vi: "ngày kia" },
      { zh: "这个星期", pinyin: "zhège xīngqī", vi: "tuần này" },
      { zh: "上个星期", pinyin: "shàng ge xīngqī", vi: "tuần trước" },
      { zh: "下个星期", pinyin: "xià ge xīngqī", vi: "tuần sau" },
      { zh: "周末", pinyin: "zhōumò", vi: "cuối tuần" },
    ],
  },
  {
    id: "talk-week",
    title: "Hỏi và hẹn theo ngày",
    phrases: [
      { zh: "今天星期几?", pinyin: "Jīntiān xīngqī jǐ?", vi: "Hôm nay thứ mấy?", note: "几 (jǐ) hỏi số nhỏ. Hỏi thứ thì luôn dùng 星期几, không dùng 什么." },
      { zh: "今天星期三。", pinyin: "Jīntiān xīngqīsān.", vi: "Hôm nay thứ Tư.", note: "Câu trả lời không cần động từ 是." },
      { zh: "明天是星期四吗?", pinyin: "Míngtiān shì xīngqīsì ma?", vi: "Ngày mai là thứ Năm phải không?" },
      { zh: "昨天是星期二。", pinyin: "Zuótiān shì xīngqī'èr.", vi: "Hôm qua là thứ Ba." },
      { zh: "我星期五有空。", pinyin: "Wǒ xīngqīwǔ yǒu kòng.", vi: "Thứ Sáu tôi rảnh." },
      { zh: "周末你做什么?", pinyin: "Zhōumò nǐ zuò shénme?", vi: "Cuối tuần bạn làm gì?" },
      { zh: "我们星期六见!", pinyin: "Wǒmen xīngqīliù jiàn!", vi: "Thứ Bảy gặp nhau nhé!" },
      { zh: "我每个星期天都去爬山。", pinyin: "Wǒ měi ge xīngqītiān dōu qù páshān.", vi: "Chủ Nhật nào tôi cũng đi leo núi." },
    ],
  },
];

export const DAY_QUIZ: QuizQuestion[] = [
  { prompt: "星期三 là thứ mấy?", zh: "星期三", options: ["Thứ Hai", "Thứ Tư", "Thứ Sáu"], answer: 1, explain: "三 là số ba nhưng thứ tính từ 星期一 = Thứ Hai, nên 星期三 là Thứ Tư." },
  { prompt: "Chủ Nhật nói là gì?", options: ["星期七", "星期日 hoặc 星期天", "星期零"], answer: 1, explain: "Chủ Nhật là 星期日 (viết) hoặc 星期天 (nói). Không có 星期七." },
  { prompt: "Thứ Hai trong tiếng Trung là?", options: ["星期二", "星期一", "星期六"], answer: 1, explain: "Thứ Hai = 星期一 (nhất). Số Việt và số Trung lệch nhau một đơn vị." },
  { prompt: "Hỏi \"Hôm nay thứ mấy?\"", options: ["今天星期什么?", "今天星期几?", "今天几星期?"], answer: 1, explain: "Hỏi thứ dùng 星期几 (jǐ hỏi con số nhỏ)." },
  { prompt: "周末 nghĩa là gì?", zh: "周末", options: ["Đầu tuần", "Giữa tuần", "Cuối tuần"], answer: 2, explain: "周 là tuần, 末 là cuối. 周末 = cuối tuần." },
  { prompt: "昨天 là?", zh: "昨天", options: ["Hôm qua", "Ngày mai", "Hôm kia"], answer: 0, explain: "昨天 = hôm qua, 明天 = ngày mai, 前天 = hôm kia." },
  { prompt: "Thứ Sáu viết ngắn là?", options: ["周六", "周五", "周四"], answer: 1, explain: "周五 = 星期五 = Thứ Sáu." },
  { prompt: "Câu nào đúng khi nói \"Thứ Bảy gặp nhé\"?", options: ["我们星期六见!", "我们六星期见!", "我们星期见六!"], answer: 0, explain: "Thứ đứng trước, kèm 星期 + số: 星期六, rồi mới tới động từ 见." },
  { prompt: "下个星期 nghĩa là?", zh: "下个星期", options: ["Tuần trước", "Tuần này", "Tuần sau"], answer: 2, explain: "下 là sau, 上 là trước. 下个星期 = tuần sau." },
  { prompt: "后天 là ngày nào?", zh: "后天", options: ["Ngày mai", "Ngày kia", "Hôm qua"], answer: 1, explain: "后天 = ngày kia (hai ngày nữa)." },
];
