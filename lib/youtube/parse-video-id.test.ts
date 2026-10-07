import { describe, expect, it } from "vitest";
import { findVideoIdInText, parseVideoId } from "./parse-video-id";

const ID = "dQw4w9WgXcQ";

describe("parseVideoId", () => {
  it.each([
    [`https://www.youtube.com/watch?v=${ID}`],
    [`https://youtube.com/watch?v=${ID}&t=42s`],
    [`https://www.youtube.com/watch?feature=share&v=${ID}`],
    [`https://m.youtube.com/watch?v=${ID}`],
    [`https://music.youtube.com/watch?v=${ID}&si=abc`],
    [`https://youtu.be/${ID}`],
    [`https://youtu.be/${ID}?si=abc`],
    [`https://www.youtube.com/shorts/${ID}`],
    [`https://www.youtube.com/embed/${ID}`],
    [`https://www.youtube.com/live/${ID}?feature=share`],
    [`youtube.com/watch?v=${ID}`],
    [`  ${ID}  `],
  ])("nhận %s", (input) => {
    expect(parseVideoId(input)).toBe(ID);
  });

  it.each([
    [""],
    ["hello world"],
    ["https://example.com/watch?v=" + ID],
    ["https://www.youtube.com/watch?v=short"],
    ["https://www.youtube.com/watch"],
    ["https://www.youtube.com/playlist?list=PL123"],
    ["https://youtu.be/"],
    ["javascript:alert(1)"],
    ["https://evil.com/youtu.be/" + ID],
    [`https://www.youtube.com/watch?v=${ID}extra`],
  ])("từ chối %s", (input) => {
    expect(parseVideoId(input)).toBeNull();
  });
});

describe("findVideoIdInText", () => {
  it("lấy link trong đoạn chia sẻ từ app YouTube", () => {
    expect(findVideoIdInText("Bài hay quá https://youtu.be/dQw4w9WgXcQ?si=abc")).toBe("dQw4w9WgXcQ");
    expect(findVideoIdInText("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("không có link YouTube thì null", () => {
    expect(findVideoIdInText("xin chào https://example.com/a")).toBeNull();
    expect(findVideoIdInText("")).toBeNull();
  });
});
