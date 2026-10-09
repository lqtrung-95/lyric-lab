import { describe, expect, it } from "vitest";
import { MAX_ADDED_VIDEO_SECONDS, MAX_USER_VIDEOS_PER_DAY_TOTAL, MAX_VIDEOS_PER_USER_PER_DAY, decideAddLimit, decideDuration } from "./add-video-limits";

describe("decideAddLimit", () => {
  it("cho thêm khi dưới cả hai trần", () => expect(decideAddLimit(MAX_VIDEOS_PER_USER_PER_DAY - 1, 5)).toBe("ok"));
  it("chặn người đã đủ số video trong ngày", () => expect(decideAddLimit(MAX_VIDEOS_PER_USER_PER_DAY, 5)).toBe("user_limit"));
  it("chặn mọi người khi trần chung đã đầy, ưu tiên hơn giới hạn từng người", () => expect(decideAddLimit(0, MAX_USER_VIDEOS_PER_DAY_TOTAL)).toBe("global_limit"));
});

describe("decideDuration", () => {
  it("nhận video độ dài vừa phải", () => expect(decideDuration(20 * 60)).toBe("ok"));
  it("từ chối video quá dài hoặc quá ngắn", () => {
    expect(decideDuration(MAX_ADDED_VIDEO_SECONDS + 1)).toBe("too_long");
    expect(decideDuration(10)).toBe("too_short");
  });
});
