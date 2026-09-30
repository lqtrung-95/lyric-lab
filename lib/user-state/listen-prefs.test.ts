import { describe, expect, it } from "vitest";
import { defaultListenPrefs, parseListenPrefs } from "./listen-prefs";

describe("parseListenPrefs", () => {
  it("mặc định khi rỗng hoặc hỏng", () => {
    expect(parseListenPrefs(null)).toEqual(defaultListenPrefs);
    expect(parseListenPrefs("{hỏng")).toEqual(defaultListenPrefs);
  });
  it("đọc giá trị hợp lệ, bỏ giá trị lạ", () => {
    expect(parseListenPrefs('{"showPinyin":false,"showTranslation":true,"rate":0.75,"autoScroll":false}')).toEqual({ showPinyin: false, showTranslation: true, rate: 0.75, autoScroll: false });
    expect(parseListenPrefs('{"showPinyin":"x","rate":3,"autoScroll":"x"}')).toEqual(defaultListenPrefs);
  });
});
