import type { PhraseGroup, QuizQuestion } from "./everyday-types";

export const THANKS_GROUPS: PhraseGroup[] = [
  {
    id: "say-thanks",
    title: "Cách nói cảm ơn",
    intro: "Mức độ tăng dần từ thân mật, thông thường đến trang trọng.",
    phrases: [
      { zh: "谢谢", pinyin: "xièxie", vi: "Cảm ơn", note: "Dùng được mọi lúc. Âm tiết thứ hai đọc nhẹ." },
      { zh: "谢谢你", pinyin: "xièxie nǐ", vi: "Cảm ơn bạn" },
      { zh: "谢谢大家", pinyin: "xièxie dàjiā", vi: "Cảm ơn mọi người" },
      { zh: "多谢", pinyin: "duōxiè", vi: "Đa tạ", note: "Hơi cổ, hay dùng trong khẩu ngữ khu vực hoặc phim cổ trang." },
      { zh: "太感谢你了", pinyin: "tài gǎnxiè nǐ le", vi: "Cảm ơn bạn nhiều lắm" },
      { zh: "非常感谢", pinyin: "fēicháng gǎnxiè", vi: "Vô cùng cảm ơn", note: "Lịch sự, dùng cả trong email và với người lớn tuổi." },
      { zh: "感谢您的帮助", pinyin: "gǎnxiè nín de bāngzhù", vi: "Cảm ơn sự giúp đỡ của ngài", note: "您 (nín) là cách xưng lịch sự với người lớn tuổi hoặc cấp trên." },
      { zh: "感激不尽", pinyin: "gǎnjī bú jìn", vi: "Biết ơn khôn xiết", note: "Rất trang trọng, dùng khi thật sự mang ơn." },
      { zh: "麻烦你了", pinyin: "máfan nǐ le", vi: "Làm phiền bạn rồi", note: "Cảm ơn khi nhờ vả ai việc nhỏ." },
      { zh: "辛苦了", pinyin: "xīnkǔ le", vi: "Bạn vất vả rồi", note: "Cảm ơn người vừa làm việc cho mình, rất hay dùng ở công sở." },
      { zh: "劳驾", pinyin: "láojià", vi: "Làm ơn, phiền bạn", note: "Dùng khi nhờ người nhường đường hoặc đưa giúp một thứ." },
    ],
  },
  {
    id: "reply-thanks",
    title: "Đáp lại lời cảm ơn",
    phrases: [
      { zh: "不客气", pinyin: "bú kèqi", vi: "Đừng khách sáo", note: "Câu đáp thông dụng nhất." },
      { zh: "不用谢", pinyin: "bú yòng xiè", vi: "Không cần cảm ơn" },
      { zh: "别客气", pinyin: "bié kèqi", vi: "Đừng khách sáo mà", note: "Thân mật hơn 不客气." },
      { zh: "没事", pinyin: "méishì", vi: "Không có gì" },
      { zh: "应该的", pinyin: "yīnggāi de", vi: "Đó là việc nên làm" },
      { zh: "小事一桩", pinyin: "xiǎoshì yì zhuāng", vi: "Chuyện nhỏ thôi", note: "Thân mật, giữa bạn bè." },
    ],
  },
];

export const THANKS_QUIZ: QuizQuestion[] = [
  { prompt: "Cảm ơn thông dụng nhất?", options: ["谢谢", "对不起", "再见"], answer: 0, explain: "谢谢 (xièxie) dùng được mọi lúc." },
  { prompt: "Ai đó cảm ơn bạn. Đáp lại thế nào?", options: ["不客气", "没关系", "我不知道"], answer: 0, explain: "不客气 = đừng khách sáo. 没关系 dùng để đáp lời xin lỗi, không phải lời cảm ơn." },
  { prompt: "Cảm ơn sếp (người lớn hơn) một cách lịch sự?", options: ["谢啦", "感谢您的帮助", "多谢多谢"], answer: 1, explain: "感谢您 dùng 您 (nín) lịch sự và 感谢 trang trọng hơn 谢谢." },
  { prompt: "辛苦了 thường dùng khi nào?", zh: "辛苦了", options: ["Khi ai đó vừa làm việc giúp bạn", "Khi chào buổi sáng", "Khi xin lỗi"], answer: 0, explain: "辛苦了 = bạn vất vả rồi, vừa là lời cảm ơn vừa là sự ghi nhận." },
  { prompt: "Nhờ người nhường đường: câu nào hợp?", options: ["劳驾", "感激不尽", "不用谢"], answer: 0, explain: "劳驾 (láojià) = làm ơn, phiền bạn, dùng khi nhờ việc nhỏ." },
  { prompt: "感激不尽 mang sắc thái nào?", zh: "感激不尽", options: ["Rất trang trọng, biết ơn sâu sắc", "Đùa vui thân mật", "Từ chối khéo"], answer: 0, explain: "感激不尽 = biết ơn khôn xiết, dành cho khi thật sự mang ơn." },
  { prompt: "Bạn thân cảm ơn bạn. Câu đáp thân mật nào hợp?", options: ["小事一桩", "不胜感激", "实在抱歉"], answer: 0, explain: "小事一桩 = chuyện nhỏ thôi, thân mật giữa bạn bè." },
];
