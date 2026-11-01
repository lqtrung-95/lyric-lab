import { describe, expect, it } from "vitest";
import { SHOP_ITEMS } from "./pet-shop";
import { ACCESSORY_LINE_IDS, accessoryLine } from "./pet-accessory-lines";

describe("accessoryLine", () => {
  it("mọi món cửa hàng đều có lời", () => {
    for (const i of SHOP_ITEMS) expect(ACCESSORY_LINE_IDS, i.id).toContain(i.id);
  });
  it("quay vòng giữa các món và các câu, không có món có lời thì null", () => {
    expect(accessoryLine([], 0)).toBeNull();
    expect(accessoryLine(["unknown"], 3)).toBeNull();
    const a = accessoryLine(["glasses", "bell"], 0);
    const b = accessoryLine(["glasses", "bell"], 1);
    expect(a).not.toBe(b);
    expect(accessoryLine(["glasses"], 0)).not.toBe(accessoryLine(["glasses"], 1));
    expect(accessoryLine(["glasses"], Number.NaN)).toBe(accessoryLine(["glasses"], 0));
  });
});
