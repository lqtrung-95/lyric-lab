import { describe, expect, it } from "vitest";
import { videoThumbnailUrl } from "./video-thumbnail";

describe("videoThumbnailUrl", () => {
  it("tạo URL ảnh bìa", () => {
    expect(videoThumbnailUrl("dQw4w9WgXcQ")).toBe("https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
  });
  it("từ chối videoId sai", () => {
    expect(() => videoThumbnailUrl("../x")).toThrow();
  });
});
