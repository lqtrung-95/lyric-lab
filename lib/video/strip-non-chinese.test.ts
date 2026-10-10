import { describe, expect, it } from "vitest";
import { stripNonChinese as stripPinyin, stripNonChineseFromLines as stripPinyinFromLines } from "./strip-non-chinese";

describe("stripNonChinese", () => {
  it("bỏ pinyin chen giữa các cụm chữ Hán", () => {
    expect(stripPinyin("Jīntiān fēnxiǎng ràng xiánliáo bù lěngchǎng de Zhōngwén biǎodá 今天分享 让闲聊不冷场的中文表达 Hái yǒu sì gè ràng duìhuà bùduàn de fāngfǎ 还有4个让对话不断的方法"))
      .toBe("今天分享 让闲聊不冷场的中文表达 还有4个让对话不断的方法");
  });

  it("bỏ cả cụm có từ không dấu (ya, de) và chữ cái lặp lại ngay trước pinyin", () => {
    expect(stripPinyin("Q, nǐ zhōumò zěnme guò de Q，你周末怎么过的 Jiù méi shénme shì zuò ya 就没什么事做呀")).toBe("Q，你周末怎么过的 就没什么事做呀");
  });

  it("dòng chỉ có pinyin thì rỗng", () => {
    expect(stripPinyin("Nǐ hǎo ma")).toBe("");
  });

  it("giữ nguyên câu thuần tiếng Anh/Việt (không có chữ Hán)", () => {
    expect(stripPinyin("Xin chào các bạn")).toBe("Xin chào các bạn");
    expect(stripPinyin("in an hour")).toBe("in an hour");
  });

  it("bỏ dòng rỗng sau khi lọc", () => {
    const lines = [{ text: "nǐ hǎo", start: 0, end: 1 }, { text: "你好 nǐ hǎo", start: 1, end: 2 }];
    expect(stripPinyinFromLines(lines)).toEqual([{ text: "你好", start: 1, end: 2 }]);
  });
});

describe("stripNonChinese: bản dịch tiếng Anh chen vào", () => {
  it("bỏ pinyin và bản dịch tiếng Anh, chỉ giữ chữ Hán (ví dụ thật từ video ba tầng)", () => {
    expect(stripPinyin("hì ， dà jiā hǎo 嗨，大家好 Hi, everyone")).toBe("嗨，大家好");
    expect(stripPinyin("wǒ shì lā lā 我是啦啦 I am Lala")).toBe("我是啦啦");
    expect(stripPinyin("jīn tiān wǒ men xué xí zài zhōng guó lǚ xíng 今天我们学习在中国旅行 Today we will learn survival Chinese for traveling in China")).toBe("今天我们学习在中国旅行");
  });
  it("pinyin không dấu thanh đi kèm chữ Hán cũng bị bỏ vì là cụm Latin từ hai từ trở lên", () => {
    expect(stripPinyin("你好 ni hao")).toBe("你好");
    expect(stripPinyin("In an hour we go 我们走吧")).toBe("我们走吧");
  });
  it("giữ từ Latin đơn lẻ nằm trong lời tiếng Trung", () => {
    expect(stripPinyin("我用 iPhone 看 YouTube")).toBe("我用 iPhone 看 YouTube");
    expect(stripPinyin("好的OK")).toBe("好的OK");
  });
  it("câu không có chữ Hán không bị bỏ bản dịch (để kiểm tra ngôn ngữ phía sau bắt)", () => {
    expect(stripPinyin("Hi, everyone and welcome")).toBe("Hi, everyone and welcome");
  });
});

describe("stripNonChineseFromLines: dòng không có chữ Hán", () => {
  const L = (text: string, i: number) => ({ text, start: i, end: i + 1 });
  it("bỏ dòng chỉ có tiếng Anh/ký hiệu khi bản chép chủ yếu là tiếng Trung", () => {
    const lines = [L("大家好", 0), L("Hi everyone", 1), L("[Music]", 2), L("今天我们学中文", 3)];
    expect(stripPinyinFromLines(lines).map((l) => l.text)).toEqual(["大家好", "今天我们学中文"]);
  });
  it("bản chép gần như toàn tiếng Anh giữ nguyên để bị báo không phải tiếng Trung", () => {
    const lines = [L("Hello and welcome", 0), L("Today we learn", 1), L("about travel", 2), L("再见", 3), L("thanks for watching", 4), L("see you", 5), L("bye", 6)];
    expect(stripPinyinFromLines(lines)).toHaveLength(7);
  });
});

describe("toàn bộ luồng bản chép ba tầng (pinyin + chữ Hán + tiếng Anh) từ bookmarklet", () => {
  it("sau khi làm sạch chỉ còn chữ Hán và vượt kiểm tra tiếng Trung", async () => {
    const { parsePastedTranscript } = await import("./parse-pasted-transcript");
    const { isMostlyChinese } = await import("./chinese-ratio");
    const panel = "0:00\nhì ， dà jiā hǎo 嗨，大家好 Hi, everyone\n0:01\nwǒ shì lā lā 我是啦啦 I am Lala\n0:02\njīn tiān wǒ men xué xí zài zhōng guó lǚ xíng 今天我们学习在中国旅行 Today we will learn survival Chinese for traveling in China\n";
    const parsed = parsePastedTranscript(panel, 60);
    expect(isMostlyChinese(parsed)).toBe(false); // trước khi lọc bị coi là không phải tiếng Trung (đúng lỗi người dùng gặp)
    const cleaned = stripPinyinFromLines(parsed);
    expect(cleaned.map((l) => l.text)).toEqual(["嗨，大家好", "我是啦啦", "今天我们学习在中国旅行"]);
    expect(isMostlyChinese(cleaned)).toBe(true);
  });
});
