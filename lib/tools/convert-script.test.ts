import { describe, expect, it } from "vitest";
import { convertScript } from "./convert-script";

describe("convertScript", () => {
  it("giản → phồn và đếm số chữ đổi", () => {
    const r = convertScript("我是学生。", "s2t");
    expect(r.output).toBe("我是學生。");
    expect(r.changed).toBe(1);
  });

  it("phồn → giản kể cả biến thể Đài Loan", () => {
    expect(convertScript("軟體很好用", "t2s").output).toBe("软体很好用");
    expect(convertScript("學習漢語", "t2s").output).toBe("学习汉语");
  });

  it("chế độ Đài Loan đổi cả từ vựng địa phương", () => {
    expect(convertScript("软件", "s2tw").output).toBe("軟體");
    expect(convertScript("软件", "s2t").output).toBe("軟件");
  });

  it("đánh dấu chữ có nhiều cách chuyển (không lặp) khi giản → phồn, không đánh dấu ở chiều ngược", () => {
    const r = convertScript("头发很多,头发很长。", "s2t");
    expect(r.check.map((c) => c.char)).toEqual(["发"]);
    expect(convertScript("頭髮很多", "t2s").check).toEqual([]);
  });

  it("văn bản không có chữ Hán thì giữ nguyên", () => {
    const r = convertScript("hello 123", "s2t");
    expect(r.output).toBe("hello 123");
    expect(r.changed).toBe(0);
  });
});
