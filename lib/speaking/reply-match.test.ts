import { describe, expect, it } from "vitest";
import { hanChars, judgeReply, reflexPoints, wordsUsed } from "./reply-match";

describe("judgeReply", () => {
  it("silent khi gần như không nói gì", () => {
    expect(judgeReply("", "我叫小明").verdict).toBe("silent");
    expect(judgeReply("嗯", "我叫小明").verdict).toBe("silent");
    expect(judgeReply("hello", "我叫小明").verdict).toBe("silent");
  });
  it("matched khi trùng chữ nội dung, bỏ qua chữ hư", () => {
    expect(judgeReply("我叫李华", "我叫小明").verdict).toBe("matched"); // 叫 trùng (1/3)
  });
  it("chỉ so với mệnh đề đầu của câu mẫu", () => {
    expect(judgeReply("在右边", "在右边。注意看记分牌，别被红牌罚下场。").verdict).toBe("matched");
    expect(judgeReply("今天很好", "在右边。注意看记分牌，别被红牌罚下场。").verdict).toBe("answered");
  });
  it("answered khi nói nhưng khác ý", () => {
    const j = judgeReply("今天天气很好", "我叫小明");
    expect(j.verdict).toBe("answered");
    expect(j.overlap).toBe(0);
  });
  it("câu mẫu chỉ toàn chữ hư thì đã nói là khớp", () => {
    expect(judgeReply("对对对", "是的").verdict).toBe("matched");
  });
});

describe("reflexPoints / wordsUsed / hanChars", () => {
  it("điểm theo mức", () => {
    expect([reflexPoints("silent"), reflexPoints("answered"), reflexPoints("matched")]).toEqual([0, 60, 100]);
  });
  it("wordsUsed khớp nguyên cụm", () => {
    expect(wordsUsed("我想喝咖啡和茶", ["咖啡", "茶", "牛奶", ""])).toEqual(["咖啡", "茶"]);
  });
  it("hanChars bỏ dấu câu và chữ Latin", () => {
    expect(hanChars("你好, ok! 世界。")).toEqual(["你", "好", "世", "界"]);
  });
});
