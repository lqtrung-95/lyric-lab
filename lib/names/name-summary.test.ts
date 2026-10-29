import { describe, expect, it } from "vitest";
import { convertName } from "./chinese-name";
import { buildSummaryUser, fallbackSummary, parseSummary, summarizeName } from "./name-summary";

const parts = convertName("Lê Quốc Trung");

describe("name summary", () => {
  it("chỉ gửi các chữ có nghĩa, không có họ hay tên gõ vào", () => {
    expect(buildSummaryUser(parts)).toBe("国 (quốc): quốc gia\n忠 (trung): trung thành");
  });
  it("parse chấp nhận câu hợp lệ, bỏ ngoặc kép, loại chữ Hán và sai dạng", () => {
    expect(parseSummary('{"summary":"Một người trung thành, yêu quê hương đất nước."}')).toBe("Một người trung thành, yêu quê hương đất nước.");
    expect(parseSummary('{"summary":"Tên “trung” nghĩa là trung thành."}')).toBe("Tên trung nghĩa là trung thành.");
    expect(parseSummary('{"summary":"Tên 忠 là trung thành đó nha"}')).toBeNull();
    expect(parseSummary("không phải json")).toBeNull();
    expect(parseSummary('{"summary":"ngắn"}')).toBeNull();
  });
  it("dự phòng ghép nghĩa; không có chữ có nghĩa thì null", () => {
    expect(fallbackSummary(parts)).toBe("Quốc gia · trung thành");
    expect(fallbackSummary(convertName("Phạm Thị Minh Huyền"))).toBe("Sáng suốt · huyền diệu, sâu xa");
    expect(fallbackSummary(convertName("Lê Linh"))).toBe("Linh hoạt, thông tuệ");
    expect(fallbackSummary(convertName("Trần"))).toBeNull();
    expect(fallbackSummary(convertName("Trần Xyz"))).toBeNull();
  });
  it("không bao giờ mở bằng \"Một cái tên…\": câu AI kiểu đó bị bỏ, câu dự phòng không dùng lối đó", () => {
    expect(parseSummary('{"summary":"Một cái tên mang ý nghĩa quốc gia và trung thành."}')).toBeNull();
    expect(parseSummary('{"summary":"Tên của bạn có nghĩa là trung thành với quê hương."}')).toBeNull();
    expect(parseSummary('{"summary":"Mong bạn luôn trung thành với quê hương."}')).toBe("Mong bạn luôn trung thành với quê hương.");
    for (const n of ["Lê Quốc Trung", "Trần Thu Hà", "Phạm Gia Bảo", "Hoàng Thị Phương Linh"]) expect(fallbackSummary(convertName(n))).not.toMatch(/^Một cái tên|mang ý nghĩa/);
  });
  it("model lỗi thì thử model sau rồi rơi về câu dự phòng", async () => {
    let calls = 0;
    const chat = async () => { calls++; if (calls === 1) throw new Error("x"); return '{"summary":"Một người trung thành với quê hương."}'; };
    const errors: string[] = [];
    expect(await summarizeName(parts, chat, ["a", "b"], (m, msg) => errors.push(`${m}:${msg}`))).toEqual({ text: "Một người trung thành với quê hương.", ai: true, model: "b" });
    expect(errors).toEqual(["a:x"]);
    expect(await summarizeName(parts, async () => { throw new Error("x"); }, ["a"])).toEqual({ text: fallbackSummary(parts), ai: false });
  });
});
