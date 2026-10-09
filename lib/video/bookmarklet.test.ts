import { describe, expect, it } from "vitest";
import { BOOKMARKLET_SOURCE, buildBookmarklet, decodeBookmarkletHash, pairsToLines } from "./bookmarklet";

// Chạy mã bookmarklet thật trong môi trường giả của trang YouTube, rồi giải mã dữ liệu nó gửi đi bằng đúng hàm mà trang Thêm video dùng.
function run(opts: { search?: string; hostname?: string; panelText?: string | null; tracks?: unknown[]; json3?: unknown }) {
  const opened: string[] = [];
  const alerts: string[] = [];
  const panel = opts.panelText == null ? null : { innerText: opts.panelText };
  const doc = {
    // YouTube có hai bảng cùng target-id (một ẩn, một mở): bảng ẩn rỗng chữ, bookmarklet phải chọn bảng có chữ.
    querySelectorAll: () => [{ innerText: "Trong video này" }, ...(panel ? [panel] : [])],
    getElementById: () => ({ getPlayerResponse: () => ({ captions: { playerCaptionsTracklistRenderer: { captionTracks: opts.tracks ?? [] } } }) }),
  };
  const win = { open: (u: string) => { opened.push(u); } };
  const fetchFn = async () => ({ json: async () => opts.json3 });
  const fn = new Function("location", "document", "window", "alert", "fetch", "btoa", "unescape", `return ${BOOKMARKLET_SOURCE}("https://songhanzi.test");`);
  fn({ search: opts.search ?? "?v=abcdefghijk", hostname: opts.hostname ?? "www.youtube.com" }, doc, win, (m: string) => alerts.push(m), fetchFn, (s: string) => Buffer.from(s, "binary").toString("base64"), unescape);
  return { opened, alerts };
}
const flush = () => new Promise((r) => setTimeout(r, 0));

describe("bookmarklet", () => {
  it("đọc bảng bản chép lời đang mở và mở trang Thêm video kèm dữ liệu", () => {
    const { opened, alerts } = run({ panelText: "0:00\n大家好\n0:05\n欢迎收听节目" });
    expect(alerts).toEqual([]);
    expect(opened[0].startsWith("https://songhanzi.test/video/add#d=")).toBe(true);
    expect(decodeBookmarkletHash(opened[0].split("/video/add")[1])).toEqual({ v: "abcdefghijk", t: "0:00\n大家好\n0:05\n欢迎收听节目" });
  });

  it("không mở bảng thì đọc track phụ đề tiếng Trung (ưu tiên bản do người làm)", async () => {
    const tracks = [
      { languageCode: "zh-Hans", kind: "asr", baseUrl: "https://x/asr" },
      { languageCode: "zh-CN", baseUrl: "https://x/manual" },
      { languageCode: "en", baseUrl: "https://x/en" },
    ];
    const json3 = { events: [{ tStartMs: 1500, segs: [{ utf8: "你好" }, { utf8: "吗" }] }, { tStartMs: 4000 }, { tStartMs: 5000, segs: [{ utf8: "再见" }] }] };
    const { opened } = run({ panelText: null, tracks, json3 });
    await flush();
    expect(decodeBookmarkletHash(opened[0].split("/video/add")[1])).toEqual({ v: "abcdefghijk", l: [[1.5, "你好吗"], [5, "再见"]] });
  });

  it("không phải trang video YouTube hoặc không có phụ đề thì báo cho người dùng, không mở gì", async () => {
    expect(run({ hostname: "example.com" }).alerts[0]).toContain("youtube.com");
    expect(run({ search: "?x=1" }).alerts[0]).toContain("youtube.com");
    const none = run({ panelText: null, tracks: [{ languageCode: "en", baseUrl: "https://x" }] });
    expect(none.alerts[0]).toContain("phụ đề tiếng Trung");
    expect(none.opened).toEqual([]);
  });

  it("buildBookmarklet tạo địa chỉ javascript: đã mã hóa, chứa địa chỉ gốc của app", () => {
    const href = buildBookmarklet("https://songhanzi.com");
    expect(href.startsWith("javascript:")).toBe(true);
    expect(decodeURIComponent(href.slice("javascript:".length))).toContain('"https://songhanzi.com"');
    expect(href).not.toContain("\n");
  });
});

describe("decodeBookmarkletHash và pairsToLines", () => {
  it("từ chối dữ liệu hỏng hoặc mã video sai", () => {
    expect(decodeBookmarkletHash("#d=@@@")).toBeNull();
    expect(decodeBookmarkletHash("#other")).toBeNull();
    const bad = Buffer.from(JSON.stringify({ v: "short" })).toString("base64url");
    expect(decodeBookmarkletHash(`#d=${bad}`)).toBeNull();
  });

  it("pairsToLines lấy mốc dòng sau làm mốc kết thúc, dòng cuối kéo dài 5 giây, bỏ dòng rỗng", () => {
    expect(pairsToLines([[0, "你好"], [3, " "], [4, "谢谢"]])).toEqual([{ text: "你好", start: 0, end: 4 }, { text: "谢谢", start: 4, end: 9 }]);
  });
});
