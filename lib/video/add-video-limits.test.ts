import { describe, expect, it } from "vitest";
import { AI_TRANSLATION_MINUTES_PER_DAY, MAX_ADDED_VIDEO_SECONDS, MAX_USER_VIDEOS_PER_DAY_TOTAL, MAX_VIDEOS_PER_USER_PER_DAY, decideAddLimit, decideDuration, decideTranslationBudget } from "./add-video-limits";

describe("decideAddLimit", () => {
  it("cho thêm khi dưới cả hai trần", () => expect(decideAddLimit(MAX_VIDEOS_PER_USER_PER_DAY - 1, 5)).toBe("ok"));
  it("chặn người đã đủ số video trong ngày", () => expect(decideAddLimit(MAX_VIDEOS_PER_USER_PER_DAY, 5)).toBe("user_limit"));
  it("admin không bị giới hạn từng người lẫn trần chung", () => {
    expect(decideAddLimit(MAX_VIDEOS_PER_USER_PER_DAY, 5, true)).toBe("ok");
    expect(decideAddLimit(MAX_VIDEOS_PER_USER_PER_DAY, MAX_USER_VIDEOS_PER_DAY_TOTAL, true)).toBe("ok");
  });
  it("chặn mọi người khi trần chung đã đầy, ưu tiên hơn giới hạn từng người", () => expect(decideAddLimit(0, MAX_USER_VIDEOS_PER_DAY_TOTAL)).toBe("global_limit"));
});

describe("decideDuration", () => {
  it("nhận video độ dài vừa phải", () => expect(decideDuration(20 * 60)).toBe("ok"));
  it("từ chối video quá dài hoặc quá ngắn", () => {
    expect(decideDuration(MAX_ADDED_VIDEO_SECONDS + 1)).toBe("too_long");
    expect(decideDuration(10)).toBe("too_short");
  });
});

describe("decideTranslationBudget", () => {
  it("còn ngân sách thì cho dịch", () => expect(decideTranslationBudget(100, 20 * 60)).toBe("ok"));
  it("vừa đủ ngân sách vẫn ok, vượt dù chỉ một chút thì hết", () => {
    expect(decideTranslationBudget(AI_TRANSLATION_MINUTES_PER_DAY - 20, 20 * 60)).toBe("ok");
    expect(decideTranslationBudget(AI_TRANSLATION_MINUTES_PER_DAY - 20, 20 * 60 + 1)).toBe("exhausted");
  });
  it("video dài tốn ngân sách theo phút", () => {
    expect(decideTranslationBudget(AI_TRANSLATION_MINUTES_PER_DAY - 30, 60 * 60)).toBe("exhausted");
    expect(decideTranslationBudget(0, 60 * 60)).toBe("ok");
  });
});
