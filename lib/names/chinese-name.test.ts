import { describe, expect, it } from "vitest";
import { convertName, joinHan, splitName } from "./chinese-name";
import { GIVEN, SURNAMES } from "./name-data";

describe("splitName", () => {
  it("chuẩn hóa chữ hoa/khoảng trắng, bỏ ký tự lạ, giới hạn độ dài", () => {
    expect(splitName("  Nguyễn   Văn  An!! ")).toEqual(["nguyễn", "văn", "an"]);
    expect(splitName("")).toEqual([]);
    expect(splitName("a".repeat(60))).toEqual([]);
    expect(splitName("a b c d e f g")).toHaveLength(5);
  });
});

describe("convertName", () => {
  it("họ + đệm + tên, bỏ Thị", () => {
    const p = convertName("Nguyễn Thị Thu Hà");
    expect(p.map((x) => x.han)).toEqual(["阮", "秋", "河"]);
    expect(joinHan(p)).toBe("阮秋河");
    expect(p[0].role).toBe("surname");
    expect(p[2].role).toBe("given");
  });
  it("tên có chữ Huyền (phản hồi người dùng) ghép được đủ", () => {
    expect(joinHan(convertName("Phạm Thị Minh Huyền"))).toBe("范明玄");
  });
  it("tên chỉ một âm là tên gọi, không có họ", () => {
    expect(convertName("Linh")).toEqual([{ syllable: "linh", role: "given", han: "灵", meaning: "linh hoạt, thông tuệ" }]);
  });
  it("âm chưa có thì han = null và không ghép được", () => {
    const p = convertName("Trần Xyz");
    expect(p[1].han).toBeNull();
    expect(joinHan(p)).toBeNull();
    expect(joinHan([])).toBeNull();
  });
  it("bảng dữ liệu hợp lệ: mỗi giá trị là chữ Hán, không có mục rỗng", () => {
    const han = /^\p{Script=Han}$/u;
    for (const v of Object.values(SURNAMES)) expect(v).toMatch(han);
    for (const [k, v] of Object.entries(GIVEN)) { expect(v.han, k).toMatch(han); expect(v.meaning.length, k).toBeGreaterThan(2); }
  });
});
