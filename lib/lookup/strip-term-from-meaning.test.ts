import { describe, expect, it } from "vitest";
import { stripTermFromMeaning } from "./strip-term-from-meaning";

describe("stripTermFromMeaning", () => {
  it("bỏ phần mở đầu 'Từ “…” ' và viết hoa chữ đầu", () => {
    expect(stripTermFromMeaning('Từ "失去" ở câu này mang nghĩa là "đã mất". Trong ngữ cảnh, nó diễn tả nỗi mất mát.', "失去"))
      .toBe('Ở câu này mang nghĩa là "đã mất". Trong ngữ cảnh, nó diễn tả nỗi mất mát.');
    expect(stripTermFromMeaning("Từ 「失去」 nghĩa là mất.", "失去")).toBe("Nghĩa là mất.");
  });
  it("chữ Hán còn lại giữa câu được thay bằng 'từ này'", () => {
    expect(stripTermFromMeaning("Ở đây 失去 chỉ việc mất đi người yêu.", "失去")).toBe("Ở đây từ này chỉ việc mất đi người yêu.");
  });
  it("không có chữ Hán thì giữ nguyên; không biến thành chuỗi rỗng", () => {
    expect(stripTermFromMeaning("Đã mất, không còn có.", "失去")).toBe("Đã mất, không còn có.");
    expect(stripTermFromMeaning("失去", "失去")).toBe("từ này".replace(/^./, (c) => c.toUpperCase()));
  });
});
