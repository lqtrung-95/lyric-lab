// Câu mẫu thông dụng cho bài đọc to (tự soạn, không phải lời bài hát). Mỗi cụm có pinyin và nghĩa để người học hiểu mình đang đọc gì.
export interface ReadAloudSentence { han: string; pinyin: string; meaning: string }

export const READ_ALOUD_SENTENCES: ReadAloudSentence[] = [
  { han: "你好，很高兴认识你。", pinyin: "Nǐ hǎo, hěn gāoxìng rènshi nǐ.", meaning: "Xin chào, rất vui được làm quen." },
  { han: "我喜欢听中文歌。", pinyin: "Wǒ xǐhuan tīng Zhōngwén gē.", meaning: "Tôi thích nghe nhạc Trung." },
  { han: "今天天气很好。", pinyin: "Jīntiān tiānqì hěn hǎo.", meaning: "Hôm nay thời tiết rất đẹp." },
  { han: "谢谢你的帮助。", pinyin: "Xièxie nǐ de bāngzhù.", meaning: "Cảm ơn sự giúp đỡ của bạn." },
  { han: "请问洗手间在哪里？", pinyin: "Qǐngwèn xǐshǒujiān zài nǎlǐ?", meaning: "Xin hỏi nhà vệ sinh ở đâu?" },
  { han: "我想喝一杯茶。", pinyin: "Wǒ xiǎng hē yì bēi chá.", meaning: "Tôi muốn uống một tách trà." },
  { han: "四是四，十是十。", pinyin: "Sì shì sì, shí shì shí.", meaning: "Bốn là bốn, mười là mười (luyện s–sh)." },
  { han: "他知道这是什么。", pinyin: "Tā zhīdào zhè shì shénme.", meaning: "Anh ấy biết đây là cái gì (luyện zh–sh)." },
  { han: "葡萄皮儿不吐。", pinyin: "Pútao pír bù tǔ.", meaning: "Không nhả vỏ nho (luyện p, t bật hơi)." },
  { han: "我们明天去北京。", pinyin: "Wǒmen míngtiān qù Běijīng.", meaning: "Ngày mai chúng tôi đi Bắc Kinh." },
];
