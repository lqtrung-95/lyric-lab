import { describe, expect, it } from "vitest";
import { INSTALL_BANNER_SNOOZE_DAYS, shouldShowInstallBanner } from "./install-banner-state";

const DAY = 24 * 3600 * 1000;
const base = { platform: "android" as const, standalone: false, onboarded: true, dismissedAt: null, now: 100 * DAY };

describe("shouldShowInstallBanner", () => {
  it("hiện cho điện thoại chưa cài, đã thiết lập, chưa từng bấm Để sau", () => {
    expect(shouldShowInstallBanner(base)).toBe(true);
    expect(shouldShowInstallBanner({ ...base, platform: "ios" })).toBe(true);
  });
  it("không hiện trên máy tính, khi đã cài, hoặc khi chưa thiết lập xong", () => {
    expect(shouldShowInstallBanner({ ...base, platform: "other" })).toBe(false);
    expect(shouldShowInstallBanner({ ...base, standalone: true })).toBe(false);
    expect(shouldShowInstallBanner({ ...base, onboarded: false })).toBe(false);
  });
  it(`ẩn ${INSTALL_BANNER_SNOOZE_DAYS} ngày sau khi bấm Để sau, rồi hiện lại`, () => {
    expect(shouldShowInstallBanner({ ...base, dismissedAt: base.now - 3 * DAY })).toBe(false);
    expect(shouldShowInstallBanner({ ...base, dismissedAt: base.now - (INSTALL_BANNER_SNOOZE_DAYS - 1) * DAY })).toBe(false);
    expect(shouldShowInstallBanner({ ...base, dismissedAt: base.now - (INSTALL_BANNER_SNOOZE_DAYS + 1) * DAY })).toBe(true);
  });
});
