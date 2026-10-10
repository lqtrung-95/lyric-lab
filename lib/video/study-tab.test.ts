import { describe, expect, it } from "vitest";
import { parseStudyTab, studyTabHref } from "./study-tab";

describe("parseStudyTab", () => {
  it("nhận ba tab hợp lệ", () => {
    expect(parseStudyTab("dictation")).toBe("dictation");
    expect(parseStudyTab("shadowing")).toBe("shadowing");
    expect(parseStudyTab("subtitles")).toBe("subtitles");
  });
  it("giá trị sai hoặc thiếu thì về Phụ đề", () => {
    for (const v of [null, undefined, "", "x", "DICTATION"]) expect(parseStudyTab(v)).toBe("subtitles");
  });
});

describe("studyTabHref", () => {
  it("tab Phụ đề dùng địa chỉ gốc, tab khác kèm ?tab=", () => {
    expect(studyTabHref("abc", "subtitles")).toBe("/video/abc");
    expect(studyTabHref("abc", "dictation")).toBe("/video/abc?tab=dictation");
  });
});
