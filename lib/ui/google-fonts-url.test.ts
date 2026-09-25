import { describe, expect, it } from "vitest";
import { ICON_NAMES } from "@/components/ui/icon-names";
import { googleFontsUrl } from "./google-fonts-url";

describe("googleFontsUrl", () => {
  it("ICON_NAMES đã theo thứ tự chữ cái và không trùng (Google Fonts yêu cầu)", () => {
    expect([...ICON_NAMES]).toEqual([...ICON_NAMES].sort());
    expect(new Set(ICON_NAMES).size).toBe(ICON_NAMES.length);
  });

  it("URL chứa đủ họ font và danh sách icon", () => {
    const url = googleFontsUrl();
    expect(url).toContain("Be+Vietnam+Pro");
    expect(url).toContain("Noto+Serif+SC");
    expect(url).toContain(`icon_names=${[...ICON_NAMES].join(",")}`);
  });
});
