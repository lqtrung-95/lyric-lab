import { describe, expect, it } from "vitest";
import { shortMeaning } from "./match-round";

describe("shortMeaning", () => {
  it("bỏ cụm dẫn nhập 'Ở câu này, ' trước khi cắt, không để trơ lại đúng cụm đó", () => {
    const full = "Ở câu này, từ này mang nghĩa là toàn bộ vũ trụ, không chỉ là không gian. Trong ngữ cảnh, nó diễn tả sự rộng lớn.";
    const short = shortMeaning(full);
    expect(short).not.toBe("Ở câu này");
    expect(short.toLowerCase()).not.toMatch(/^ở câu này$/);
    expect(short).toContain("vũ trụ");
  });

  it("bỏ cụm dẫn nhập 'Trong câu này: '", () => {
    expect(shortMeaning("Trong câu này: chỉ sự chờ đợi, hy vọng")).toBe("chỉ sự chờ đợi");
  });

  it("nghĩa bình thường (không có cụm dẫn nhập) không bị đổi", () => {
    expect(shortMeaning("dần dần, từ từ")).toBe("dần dần");
  });

  it("vẫn cắt cho vừa ô nếu đoạn sau khi bỏ dẫn nhập vẫn dài", () => {
    const long = "Ở đây, " + "a".repeat(50);
    expect(shortMeaning(long).length).toBeLessThanOrEqual(38);
  });
});
