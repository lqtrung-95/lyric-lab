import { describe, expect, it } from "vitest";
import { splitForTts } from "./split-for-tts";

describe("splitForTts", () => {
  it("câu ngắn giữ nguyên, chuỗi rỗng không ra đoạn nào", () => {
    expect(splitForTts("你好!")).toEqual(["你好!"]);
    expect(splitForTts("  ")).toEqual([]);
  });

  it("câu dài chia theo câu, mỗi đoạn không quá 40 ký tự và ghép lại đủ nội dung", () => {
    const long = "对!请你帮帮我。我怀疑五位朋友:卖水果的猫、医生、火车站的兔子、学校的老师和公园里的老爷爷。";
    const parts = splitForTts(long);
    expect(parts.length).toBeGreaterThan(1);
    for (const p of parts) expect(p.length).toBeLessThanOrEqual(40);
    expect(parts.join("")).toBe(long);
  });

  it("một câu dài không có dấu chấm thì chia theo dấu phẩy rồi cắt cứng", () => {
    const noStop = "我们去超市买苹果、香蕉、西瓜、牛奶、面包、鸡蛋、鱼、肉、蔬菜、饮料、大米和很多别的东西";
    for (const p of splitForTts(noStop)) expect(p.length).toBeLessThanOrEqual(40);
    expect(splitForTts("一".repeat(100)).every((p) => p.length <= 40)).toBe(true);
  });
});
