import { describe, expect, it, vi } from "vitest";
import { synthesizeWithFailover, TtsUnavailableError } from "./azure-speech";

vi.mock("server-only", () => ({}));

const ok = () => new Response(new Uint8Array([1, 2, 3]));
const status = (n: number) => new Response("", { status: n });

describe("synthesizeWithFailover", () => {
  it("tài khoản chính hết hạn mức (429) thì dùng tài khoản dự phòng", async () => {
    const fetchFn = vi.fn().mockResolvedValueOnce(status(429)).mockResolvedValueOnce(ok());
    const audio = await synthesizeWithFailover("你好", [{ key: "a", region: "r1" }, { key: "b", region: "r2" }], fetchFn);
    expect(audio.length).toBe(3);
    expect(String(fetchFn.mock.calls[1][0])).toContain("r2.tts");
  });

  it("tài khoản chính chạy tốt thì không gọi dự phòng", async () => {
    const fetchFn = vi.fn().mockResolvedValue(ok());
    await synthesizeWithFailover("你好", [{ key: "a", region: "r1" }, { key: "b", region: "r2" }], fetchFn);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("tất cả đều hỏng thì ném lỗi cuối, kèm mã trạng thái; không có tài khoản nào cũng ném lỗi", async () => {
    const fetchFn = vi.fn().mockResolvedValue(status(429));
    const err = await synthesizeWithFailover("你好", [{ key: "a", region: "r1" }, { key: "b", region: "r2" }], fetchFn).catch((e) => e);
    expect(err).toBeInstanceOf(TtsUnavailableError);
    expect((err as TtsUnavailableError).status).toBe(429);
    await expect(synthesizeWithFailover("你好", [], fetchFn)).rejects.toBeInstanceOf(TtsUnavailableError);
  });
});
