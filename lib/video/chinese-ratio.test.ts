import { describe, expect, it } from "vitest";
import { chineseRatio, isMostlyChinese } from "./chinese-ratio";

const lines = (...texts: string[]) => texts.map((text, i) => ({ text, start: i, end: i + 1 }));

describe("chineseRatio", () => {
  it("phụ đề tiếng Trung (kể cả lẫn vài từ tiếng Anh) được nhận", () => {
    expect(isMostlyChinese(lines("大家好，欢迎收听", "今天聊聊 podcast 的话题"))).toBe(true);
  });
  it("bản chép lời tiếng Anh hoặc tiếng Việt bị từ chối", () => {
    expect(isMostlyChinese(lines("Hello everyone, welcome to the show"))).toBe(false);
    expect(isMostlyChinese(lines("Xin chào các bạn, chào mừng đến với chương trình"))).toBe(false);
  });
  it("không có chữ nào thì tỉ lệ 0", () => {
    expect(chineseRatio(lines("123 ...", "♪"))).toBe(0);
    expect(chineseRatio([])).toBe(0);
  });
  it("chữ phồn thể cũng tính là chữ Hán", () => {
    expect(isMostlyChinese(lines("我人生最黑暗的時刻"))).toBe(true);
  });
});
