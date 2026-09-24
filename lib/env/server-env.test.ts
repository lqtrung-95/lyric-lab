import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("getServerEnv", () => {
  it("báo lỗi khi thiếu key bắt buộc", async () => {
    const { getServerEnv } = await import("./server-env");
    vi.stubEnv("YOUTUBE_DATA_API_KEY", "");
    expect(() => getServerEnv()).toThrow();
    vi.unstubAllEnvs();
  });
});
