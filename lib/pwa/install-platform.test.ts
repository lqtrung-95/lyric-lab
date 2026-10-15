import { describe, expect, it } from "vitest";
import { detectInstallPlatform, isInAppBrowser } from "./install-platform";

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const ANDROID = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36";
const MAC = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15";

describe("detectInstallPlatform", () => {
  it("nhận ra iPhone, Android và máy tính", () => {
    expect(detectInstallPlatform(IPHONE)).toBe("ios");
    expect(detectInstallPlatform(ANDROID)).toBe("android");
    expect(detectInstallPlatform(MAC, "MacIntel", 0)).toBe("other");
    expect(detectInstallPlatform("")).toBe("other");
  });
  it("iPadOS 13+ tự xưng là Mac nhưng có màn cảm ứng: vẫn là iOS", () => {
    expect(detectInstallPlatform(MAC, "MacIntel", 5)).toBe("ios");
  });
});

describe("isInAppBrowser", () => {
  it("nhận ra trình duyệt nhúng của Zalo, Facebook, Messenger, Instagram, TikTok", () => {
    expect(isInAppBrowser(`${IPHONE} Zalo/22.1`)).toBe(true);
    expect(isInAppBrowser(`${ANDROID} [FB_IAB/FB4A;FBAV/450.0]`)).toBe(true);
    expect(isInAppBrowser(`${IPHONE} [FBAN/FBIOS;FBAV/450]`)).toBe(true);
    expect(isInAppBrowser(`${IPHONE} Instagram 320.0`)).toBe(true);
    expect(isInAppBrowser(`${ANDROID} musical_ly_2023`)).toBe(true);
  });
  it("Safari và Chrome thường thì không", () => {
    expect(isInAppBrowser(IPHONE)).toBe(false);
    expect(isInAppBrowser(ANDROID)).toBe(false);
  });
});
