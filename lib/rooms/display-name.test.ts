import { describe, expect, it } from "vitest";
import { parseDisplayName } from "./display-name";

describe("parseDisplayName", () => {
  it("chuẩn hóa khoảng trắng và nhận tên hợp lệ (có dấu tiếng Việt)", () => {
    expect(parseDisplayName("  Linh   Bạn ")).toBe("Linh Bạn");
    expect(parseDisplayName("Minh_Hoàng")).toBe("Minh_Hoàng");
  });
  it("từ chối tên quá ngắn, quá dài, chỉ gồm số, có ký tự lạ và giá trị không phải chuỗi", () => {
    for (const bad of ["ab", "a".repeat(21), "123456", "ten<script>", "", null, 42, undefined]) expect(parseDisplayName(bad)).toBeNull();
  });
});
