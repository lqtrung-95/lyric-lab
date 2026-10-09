import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BOOKMARKLET_SOURCE, buildBookmarklet, decodeBookmarkletHash } from "./bookmarklet";

// Chạy mã bookmarklet thật trong môi trường giả của trang YouTube, rồi giải mã dữ liệu nó gửi đi bằng đúng hàm mà trang Thêm video dùng.
interface Opts {
  search?: string;
  hostname?: string;
  /** Chữ của bảng bản chép lời khi đã mở. */
  panelText?: string | null;
  /** Nút "Hiện bản chép lời" có trong trang; bấm vào thì bảng mở ra với `panelText`. */
  hasTranscriptButton?: boolean;
}

function run(opts: Opts) {
  const opened: string[] = [];
  const alerts: string[] = [];
  const clicks: string[] = [];
  let panelOpen = !opts.hasTranscriptButton && opts.panelText != null;
  const button = { getAttribute: () => "Show transcript", innerText: "", click: () => { clicks.push("transcript"); panelOpen = opts.panelText != null; } };
  const doc = {
    // YouTube có hai bảng cùng target-id (một ẩn, một mở): bảng ẩn chữ ngắn, bookmarklet phải chọn bảng có mốc giờ.
    querySelectorAll: (sel: string) => (sel.includes("target-id") ? [{ innerText: "Trong video này" }, ...(panelOpen ? [{ innerText: opts.panelText }] : [])] : opts.hasTranscriptButton ? [button] : []),
    querySelector: () => ({ click: () => { clicks.push("expand"); } }),
  };
  const win = { open: (u: string) => { opened.push(u); } };
  const fn = new Function("location", "document", "window", "alert", "btoa", "unescape", `return ${BOOKMARKLET_SOURCE}("https://songhanzi.test");`);
  fn({ search: opts.search ?? "?v=abcdefghijk", hostname: opts.hostname ?? "www.youtube.com" }, doc, win, (m: string) => alerts.push(m), (s: string) => Buffer.from(s, "binary").toString("base64"), unescape);
  return { opened, alerts, clicks };
}
const payloadOf = (url: string) => decodeBookmarkletHash(url.split("/video/add")[1]);
const PANEL = "0:00\n大家好\n0:05\n欢迎收听我们的节目";

describe("bookmarklet", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it("bảng bản chép lời đang mở: đọc ngay và mở trang Thêm video kèm dữ liệu", () => {
    const { opened, alerts, clicks } = run({ panelText: PANEL });
    expect(alerts).toEqual([]);
    expect(clicks).toEqual([]);
    expect(opened[0].startsWith("https://songhanzi.test/video/add#d=")).toBe(true);
    expect(payloadOf(opened[0])).toEqual({ v: "abcdefghijk", t: PANEL });
  });

  it("bảng chưa mở: tự mở rộng mô tả, bấm Hiện bản chép lời, chờ tải rồi gửi", async () => {
    const { opened, alerts, clicks } = run({ panelText: PANEL, hasTranscriptButton: true });
    await vi.advanceTimersByTimeAsync(2000);
    expect(alerts).toEqual([]);
    expect(clicks).toEqual(["expand", "transcript"]);
    expect(payloadOf(opened[0])).toEqual({ v: "abcdefghijk", t: PANEL });
  });

  it("bản chép lời không phải tiếng Trung thì báo đổi ngôn ngữ, không mở gì", async () => {
    const { opened, alerts } = run({ panelText: "0:00\nHello everyone\n0:05\nWelcome to the show", hasTranscriptButton: true });
    await vi.advanceTimersByTimeAsync(2000);
    expect(opened).toEqual([]);
    expect(alerts[0]).toContain("không phải tiếng Trung");
  });

  it("không có nút bản chép lời hoặc bảng không tải thì báo cách xử lý", async () => {
    const noButton = run({ panelText: null });
    await vi.advanceTimersByTimeAsync(2000);
    expect(noButton.alerts[0]).toContain("không có bản chép lời");
    const neverLoads = run({ panelText: null, hasTranscriptButton: true });
    await vi.advanceTimersByTimeAsync(10_000);
    expect(neverLoads.alerts[0]).toContain("chưa tải được");
    expect(neverLoads.opened).toEqual([]);
  });

  it("không phải trang video YouTube thì nhắc mở video", () => {
    expect(run({ hostname: "example.com" }).alerts[0]).toContain("youtube.com");
    expect(run({ search: "?x=1" }).alerts[0]).toContain("youtube.com");
  });

  it("buildBookmarklet tạo địa chỉ javascript: đã mã hóa, chứa địa chỉ gốc của app", () => {
    const href = buildBookmarklet("https://songhanzi.com");
    expect(href.startsWith("javascript:")).toBe(true);
    expect(decodeURIComponent(href.slice("javascript:".length))).toContain('"https://songhanzi.com"');
    expect(href).not.toContain("\n");
  });
});

describe("decodeBookmarkletHash", () => {
  it("từ chối dữ liệu hỏng, thiếu nội dung hoặc mã video sai", () => {
    expect(decodeBookmarkletHash("#d=@@@")).toBeNull();
    expect(decodeBookmarkletHash("#other")).toBeNull();
    for (const bad of [{ v: "short", t: "x" }, { v: "abcdefghijk" }]) {
      expect(decodeBookmarkletHash(`#d=${Buffer.from(JSON.stringify(bad)).toString("base64url")}`)).toBeNull();
    }
  });
});
