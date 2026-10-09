import { describe, expect, it } from "vitest";
import { MOOD_GROUPS, moodGroupLabel, moodGroupsForSong, moodGroupsForTag, parseMoodGroup, primaryMoodGroupForTag } from "./mood-groups";

describe("moodGroupsForTag", () => {
  it.each([
    ["lãng mạn", ["lang-man"]],
    ["Hoài niệm", ["hoai-niem"]],
    ["cô đơn", ["co-don"]],
    ["buồn", ["buon"]],
    ["hy vọng", ["hy-vong"]],
    ["vui tươi", ["vui-tuoi"]],
    ["ấm áp", ["am-ap"]],
    ["bối rối", ["giang-xe"]],
  ])("%s thuộc nhóm %j", (tag, expected) => {
    expect(moodGroupsForTag(tag)).toEqual(expected);
  });

  it("tag ghép thuộc nhiều nhóm, theo thứ tự cố định", () => {
    expect(moodGroupsForTag("buồn bã, hoài niệm")).toEqual(["hoai-niem", "buon"]);
    expect(moodGroupsForTag("buồn bã nhưng hy vọng")).toEqual(["buon", "hy-vong"]);
  });

  it("tag không khớp nhóm nào thì rỗng, không lỗi", () => {
    expect(moodGroupsForTag("kỳ quặc")).toEqual([]);
    expect(moodGroupsForTag("")).toEqual([]);
  });
});

describe("moodGroupsForSong", () => {
  it("hợp các nhóm của mọi tag, không trùng", () => {
    expect(moodGroupsForSong(["lãng mạn", "ngọt ngào", "hy vọng"])).toEqual(["lang-man", "hy-vong"]);
  });
  it("không có tag thì rỗng", () => {
    expect(moodGroupsForSong([])).toEqual([]);
  });
});

describe("primaryMoodGroupForTag / parseMoodGroup / label", () => {
  it("lấy nhóm đầu tiên của tag", () => {
    expect(primaryMoodGroupForTag("nhớ nhung")).toBe("hoai-niem");
    expect(primaryMoodGroupForTag("kỳ quặc")).toBeNull();
  });
  it("chỉ nhận id nhóm hợp lệ", () => {
    expect(parseMoodGroup("buon")).toBe("buon");
    expect(parseMoodGroup("../etc")).toBeNull();
    expect(parseMoodGroup(null)).toBeNull();
    expect(parseMoodGroup("")).toBeNull();
  });
  it("mọi nhóm có nhãn và ít nhất một từ khóa", () => {
    for (const g of MOOD_GROUPS) {
      expect(moodGroupLabel(g.id)).toBe(g.label);
      expect(g.keywords.length).toBeGreaterThan(0);
    }
  });
});
