import { describe, expect, it } from "vitest";
import { themeOutfit, withTheme } from "./pet-theme";

describe("themeOutfit", () => {
  it("khớp chủ đề theo chữ trong tiêu đề", () => {
    expect(themeOutfit("Ăn ở nhà hàng", null)).toBe("chefhat");
    expect(themeOutfit("Nhận phòng khách sạn")).toBe("sunhat");
    expect(themeOutfit(null, "Sức khỏe và cơ thể")).toBe("stethoscope");
    expect(themeOutfit("Chuyện trò với đồng nghiệp")).toBe("necktie");
    expect(themeOutfit("Trước cổng trường mẫu giáo")).toBe("gradcap");
  });
  it("không khớp hoặc rỗng thì null", () => {
    expect(themeOutfit("Đại từ cơ bản")).toBeNull();
    expect(themeOutfit(undefined, null)).toBeNull();
  });
});

describe("withTheme", () => {
  const head = new Set(["hat", "crown", "cap"]), neck = new Set(["scarf", "bowtie"]);
  it("đồ đầu thay món đầu, đồ cổ thay món cổ, giữ món chỗ khác", () => {
    expect(withTheme(["scarf", "cap", "glasses"], "chefhat", head, neck)).toEqual(["scarf", "glasses", "chefhat"]);
    expect(withTheme(["scarf", "cap"], "necktie", head, neck)).toEqual(["cap", "necktie"]);
    expect(withTheme(["cap"], null, head, neck)).toEqual(["cap"]);
  });
});
