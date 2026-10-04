import { describe, expect, it } from "vitest";
import { defaultListenPrefs, parseListenPrefs } from "./listen-prefs";

describe("parseListenPrefs", () => {
  it("mặc định khi rỗng hoặc hỏng", () => {
    expect(parseListenPrefs(null)).toEqual(defaultListenPrefs);
    expect(parseListenPrefs("{hỏng")).toEqual(defaultListenPrefs);
  });
  it("đọc giá trị hợp lệ, bỏ giá trị lạ", () => {
    expect(parseListenPrefs('{"showPinyin":false,"showTranslation":true,"rate":0.75,"autoScroll":false}')).toEqual({ showPinyin: false, showTranslation: true, rate: 0.75, autoScroll: false, playerSize: "large" });
    expect(parseListenPrefs('{"showPinyin":"x","rate":3,"autoScroll":"x","playerSize":"huge"}')).toEqual(defaultListenPrefs);
  });
  it("nhớ cỡ video hợp lệ", () => {
    expect(parseListenPrefs('{"playerSize":"small"}').playerSize).toBe("small");
    expect(parseListenPrefs('{"playerSize":"medium"}').playerSize).toBe("medium");
  });
});
