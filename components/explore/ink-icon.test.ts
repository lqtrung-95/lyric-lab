import { describe, expect, it } from "vitest";
import { TOWN_DISTRICTS } from "@/lib/explore/town-layout";
import { INK_ICON_NAMES } from "./ink-icon";

describe("InkIcon", () => {
  it("có biểu tượng cho mọi khu phố (để không phải quay về emoji)", () => {
    for (const d of TOWN_DISTRICTS) expect(INK_ICON_NAMES, d.id).toContain(d.id);
  });
  it("có ma, ghim vụ án, dấu đã giải, ghim vị trí", () => {
    for (const n of ["ghost", "case", "solved", "pin"]) expect(INK_ICON_NAMES).toContain(n);
  });
});
