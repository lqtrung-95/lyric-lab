import { describe, expect, it } from "vitest";
import { emptyStory } from "../story/story-state";
import { parseCoopLink, COOP_CODE, COOP_PHRASES, coopStorageId, mergeShared, newCoopCode, otherRole, parseRole, sceneOwner, unseenShared, validPhrase } from "./coop-state";

describe("chơi chung vụ án", () => {
  it("mã phòng sinh ra hợp lệ và không chứa chữ dễ nhầm", () => {
    for (let i = 0; i < 50; i++) expect(newCoopCode()).toMatch(COOP_CODE);
    expect("O0I1AB2CD").not.toMatch(COOP_CODE);
  });

  it("vai: chỉ 'a' là A, còn lại là B; vai đối diện", () => {
    expect(parseRole("a")).toBe("a");
    expect(parseRole(undefined)).toBe("b");
    expect(otherRole("a")).toBe("b");
  });

  it("chia cảnh xen kẽ theo thứ tự vụ án, cảnh đầu của A", () => {
    const route = ["s0", "s1", "s2", "s3", "s4"];
    expect(route.map((s) => sceneOwner(route, s))).toEqual(["a", "b", "a", "b", "a"]);
  });

  it("tiến độ lưu riêng theo phòng và vai", () => {
    expect(coopStorageId("c1", "ABC234", "a")).not.toBe(coopStorageId("c1", "ABC234", "b"));
    expect(coopStorageId("c1", "ABC234", "a")).toContain("c1");
  });

  it("hợp tiến độ chỉ thêm cái còn thiếu và trả nguyên bản cũ khi không có gì mới", () => {
    const local = { ...emptyStory(), flags: ["met:x", "clue:a"], clues: ["a"] };
    const same = mergeShared(local, { flags: ["met:x"], clues: ["a"] });
    expect(same).toBe(local);
    const next = mergeShared(local, { flags: ["met:x", "clue:b"], clues: ["a", "b"] });
    expect(next.flags).toEqual(["met:x", "clue:a", "clue:b"]);
    expect(next.clues).toEqual(["a", "b"]);
    expect(unseenShared(local, { flags: ["clue:b"], clues: ["b"] })).toEqual({ flags: ["clue:b"], clues: ["b"] });
  });

  it("chỉ nhận câu nói nhanh có sẵn", () => {
    expect(validPhrase(COOP_PHRASES[0].zh)).toBe(COOP_PHRASES[0].zh);
    expect(validPhrase("tùy ý")).toBeNull();
    expect(validPhrase(42)).toBeNull();
  });

  it("đọc liên kết mời, bỏ qua thứ không đúng dạng", () => {
    expect(parseCoopLink("https://songhanzi.app/explore/coop/abc234/toy-thief/toyshop?r=b")).toEqual({ code: "ABC234", caseId: "toy-thief", sceneId: "toyshop" });
    expect(parseCoopLink("/explore/coop/ABC234/lost-parcel/postoffice")).not.toBeNull();
    expect(parseCoopLink("/explore/coop/O0I1AB/x/y")).toBeNull();
    expect(parseCoopLink("hello")).toBeNull();
  });
});
