import { describe, expect, it } from "vitest";
import { dropRepeatedPass } from "./drop-repeated-pass";

const line = (text: string, start: number) => ({ text, start, end: start + 1 });
const pass = [line("你好", 0), line("我是小明", 1), line("很高兴认识你", 2), line("再见", 3), line("明天见", 4)];

describe("dropRepeatedPass", () => {
  it("cắt bản lặp lại toàn bộ danh sách", () => expect(dropRepeatedPass([...pass, ...pass])).toEqual(pass));
  it("cắt cả khi lặp ba lần", () => expect(dropRepeatedPass([...pass, ...pass, ...pass])).toEqual(pass));
  it("giữ nguyên danh sách không lặp", () => expect(dropRepeatedPass(pass)).toEqual(pass));
  it("không cắt khi mốc giờ lùi nhưng nội dung khác", () => {
    const other = [line("完全不同", 0), line("另一段", 1), line("内容", 2)];
    expect(dropRepeatedPass([...pass, ...other])).toHaveLength(8);
  });
  it("không cắt khi nội dung lặp nhưng mốc giờ vẫn tăng (câu lặp trong lời)", () => {
    const rep = [line("啦啦啦", 0), line("啦啦啦", 1), line("啦啦啦", 2), line("啦啦啦", 3), line("啦啦啦", 4), line("啦啦啦", 5)];
    expect(dropRepeatedPass(rep)).toEqual(rep);
  });
  it("bản lặp bị cụt (chỉ vài dòng đầu) vẫn bị cắt", () => expect(dropRepeatedPass([...pass, ...pass.slice(0, 3)])).toEqual(pass));
  it("danh sách rỗng hoặc ngắn", () => { expect(dropRepeatedPass([])).toEqual([]); expect(dropRepeatedPass(pass.slice(0, 2))).toHaveLength(2); });
});
