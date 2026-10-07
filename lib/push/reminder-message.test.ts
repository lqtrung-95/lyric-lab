import { describe, expect, it } from "vitest";
import { buildReminder } from "./reminder-message";

describe("buildReminder", () => {
  it("không nhắc khi hôm nay đã học", () => {
    expect(buildReminder({ dueCards: 9, currentStreak: 5, studiedToday: true })).toBeNull();
  });
  it("ưu tiên thẻ đến hạn", () => {
    expect(buildReminder({ dueCards: 12, currentStreak: 5, studiedToday: false })).toMatchObject({ title: "Có 12 thẻ cần ôn", url: "/review" });
  });
  it("không có thẻ thì nhắc giữ chuỗi", () => {
    expect(buildReminder({ dueCards: 0, currentStreak: 7, studiedToday: false })).toMatchObject({ title: "Giữ chuỗi 7 ngày nhé", url: "/app" });
  });
  it("chưa có gì thì mời chung", () => {
    expect(buildReminder({ dueCards: 0, currentStreak: 0, studiedToday: false })).toMatchObject({ url: "/app" });
  });
});
