import { describe, expect, it } from "vitest";
import { ICON_NAMES } from "@/components/ui/icon-names";
import { googleFontsUrl, iconFontUrl } from "./google-fonts-url";

describe("googleFontsUrl", () => {
  it("ICON_NAMES đã theo thứ tự chữ cái và không trùng (Google Fonts yêu cầu)", () => {
    expect([...ICON_NAMES]).toEqual([...ICON_NAMES].sort());
    expect(new Set(ICON_NAMES).size).toBe(ICON_NAMES.length);
  });

  it("URL chữ Hán dùng display=swap, không lẫn font icon hay chữ Latin/Việt (tự host bằng next/font)", () => {
    const url = googleFontsUrl();
    expect(url).toContain("Noto+Serif+SC");
    expect(url).toContain("display=swap");
    expect(url).not.toContain("Material+Symbols");
    expect(url).not.toContain("Be+Vietnam+Pro");
  });
});

describe("iconFontUrl", () => {
  it("URL icon dùng display=block (tránh giật layout do hiện chữ ligature trước khi font tải xong) và đúng danh sách icon", () => {
    const url = iconFontUrl();
    expect(url).toContain("Material+Symbols+Outlined");
    expect(url).toContain("display=block");
    expect(url).toContain(`icon_names=${[...ICON_NAMES].join(",")}`);
    expect(url).not.toContain("Noto+Serif+SC");
  });
});
