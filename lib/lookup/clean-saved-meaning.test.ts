import { describe, expect, it } from "vitest";
import { cleanSavedMeaning } from "./clean-saved-meaning";

describe("cleanSavedMeaning", () => {
  it("bỏ cụm dẫn nhập, lấy nghĩa trong ngoặc kép", () => {
    expect(cleanSavedMeaning('Ở câu này mang nghĩa là "vụng về, ngốc nghếch". Trong ngữ cảnh, nó tự giễu bản thân.', "笨拙")).toBe("vụng về, ngốc nghếch");
  });
  it("bỏ cả phần 'Từ X' ở đầu", () => {
    expect(cleanSavedMeaning('Từ "失去" ở câu này mang nghĩa là "đã mất". Nó diễn tả nỗi mất mát.', "失去")).toBe("đã mất");
  });
  it("không có ngoặc kép thì lấy câu đầu sau cụm dẫn nhập", () => {
    expect(cleanSavedMeaning("Ở câu này, từ này mang nghĩa là toàn bộ vũ trụ. Nó diễn tả sự rộng lớn.", "宇宙")).toBe("toàn bộ vũ trụ");
  });
  it("giữ nguyên nghĩa ngắn kiểu từ điển", () => {
    expect(cleanSavedMeaning("đã mất, không còn", "失去")).toBe("đã mất, không còn");
  });
  it("chỉ có cụm dẫn nhập thì giữ bản gốc", () => {
    expect(cleanSavedMeaning("Ở câu này", "城市")).toBe("Ở câu này");
  });
});
