import { describe, expect, it, vi } from "vitest";
import { NeteaseProvider } from "./netease-provider";

// Lời hư cấu (không phải bài thật), chỉ để kiểm tra parse/ghép dữ liệu. Test không giải mã request (đã kiểm tra bằng
// tay với server thật ở netease-weapi-crypto.ts) mà chỉ giả lập phản hồi theo đường dẫn request.
const LRC = "[00:00.00]dòng một\n[00:05.00]dòng hai";

function fakeFetch(searchSongs: { id: number; name: string; artists: { name: string }[]; duration: number }[], lyricsById: Record<number, string | null>, searchCode = 200) {
  return vi.fn(async (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    if (url.includes("/weapi/search/get")) {
      return new Response(JSON.stringify({ code: searchCode, result: { songs: searchSongs } }), { status: 200 });
    }
    // Không giải mã được id thật từ body mã hoá trong test đơn vị: trả lời theo bài đầu tiên còn map, đủ để kiểm tra luồng ghép dữ liệu.
    const id = searchSongs[0]?.id;
    const lyric = id !== undefined ? lyricsById[id] : undefined;
    return new Response(JSON.stringify({ lrc: lyric ? { lyric } : {} }), { status: 200 });
  }) as unknown as typeof fetch;
}

describe("NeteaseProvider", () => {
  it("ghép kết quả tìm bài với lời tra riêng, đổi ms sang giây", async () => {
    const provider = new NeteaseProvider(fakeFetch(
      [{ id: 1, name: "Bài A", artists: [{ name: "Ca sĩ A" }], duration: 200_000 }],
      { 1: LRC },
    ));
    const items = await provider.search("bài a");
    expect(items).toEqual([{ id: 1, trackName: "Bài A", artistName: "Ca sĩ A", duration: 200, instrumental: false, syncedLyrics: LRC }]);
  });

  it("bài không có lời hoặc lời không có mốc thời gian thì bỏ qua, không ném lỗi", async () => {
    const provider = new NeteaseProvider(fakeFetch(
      [{ id: 1, name: "Không lời", artists: [{ name: "X" }], duration: 100_000 }],
      { 1: null },
    ));
    expect(await provider.search("x")).toEqual([]);
  });

  it("search trả code khác 200 (vd. thiếu tham số/bị chặn) thì ném lỗi để bên gọi ghi nhận", async () => {
    const provider = new NeteaseProvider(fakeFetch([], {}, 50000005));
    await expect(provider.search("x")).rejects.toThrow(/code 50000005/);
  });

  it("lỗi HTTP thì ném lỗi để bên gọi ghi nhận", async () => {
    const fetchFn = vi.fn(async () => new Response("fail", { status: 500 })) as unknown as typeof fetch;
    await expect(new NeteaseProvider(fetchFn).search("x")).rejects.toThrow(/HTTP 500/);
  });

  it("kết quả tìm không đúng định dạng (result.songs không phải mảng) thì trả rỗng", async () => {
    const fetchFn = vi.fn(async () => new Response(JSON.stringify({ code: 200, result: {} }), { status: 200 })) as unknown as typeof fetch;
    expect(await new NeteaseProvider(fetchFn).search("x")).toEqual([]);
  });
});
