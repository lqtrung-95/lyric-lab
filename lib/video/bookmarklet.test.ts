import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BOOKMARKLET_SOURCE, buildBookmarklet, decodeBookmarkletHash } from "./bookmarklet";

// Chạy mã bookmarklet thật trong môi trường giả của trang YouTube, rồi giải mã dữ liệu nó gửi đi bằng đúng hàm mà trang Thêm video dùng.
interface Opts {
  search?: string;
  hostname?: string;
  /** Chữ của khung bản chép lời (theo target-id) khi đã mở. */
  panelText?: string | null;
  /** Các dòng bản chép lời (khung "In this video" mới không có target-id chứa "transcript"). */
  segments?: string[];
  /** Nút "Hiện bản chép lời" có trong trang; bấm vào thì bảng mở ra với `panelText`. */
  hasTranscriptButton?: boolean;
  /** Hai thẻ cạnh nhau (thẻ đầu là mục lục, thẻ sau là bản chép lời): bấm thẻ sau thì các dòng `segments` mới hiện. */
  hasTranscriptTab?: boolean;
  /** Giao diện YouTube ở ngôn ngữ mà bookmarklet không có trong danh sách chữ: phải tìm theo cấu trúc trang, không theo chữ. */
  foreignUi?: boolean;
  /** window.open bị trình duyệt chặn (trả null). */
  popupBlocked?: boolean;
  /** Ngôn ngữ giao diện YouTube (thuộc tính lang của trang), mặc định "en". */
  uiLang?: string;
  /** Video có nhiều ngôn ngữ: bảng mở bằng ngôn ngữ khác, cần chọn tiếng Trung ở ô chọn ngôn ngữ ở cuối bảng. */
  langSwitch?: { triggerLabel: string; menuLabels: string[]; zhLabel: string; zhText: string; viLabel?: string; viText?: string };
  /** Các track phụ đề của video theo trình phát: mã ngôn ngữ, hoặc {code, kind} (kind "asr" là phụ đề tự động). */
  trackCodes?: (string | { code: string; kind?: string })[];
}

function run(opts: Opts) {
  const opened: string[] = [];
  const alerts: string[] = [];
  const clicks: string[] = [];
  const messages: string[] = [];
  let panelOpen = !opts.hasTranscriptButton && opts.panelText != null;
  let currentText = opts.panelText;
  let menuOpen = false;
  let segmentsShown = !opts.hasTranscriptTab && (opts.segments?.length ?? 0) > 0;
  const element = (name: string, onClick?: () => void) => ({ getAttribute: () => name, innerText: name, click: () => { clicks.push(name); onClick?.(); } });
  const button = element(opts.foreignUi ? "แสดงข้อความถอดเสียง" : "Show transcript", () => { panelOpen = opts.panelText != null; });
  const timelineTab = element(opts.foreignUi ? "ไทม์ไลน์" : "Timeline");
  const transcriptTab = element(opts.foreignUi ? "ข้อความถอดเสียง" : "Transcript", () => { segmentsShown = true; });
  const visible = { offsetWidth: 1, closest: () => null };
  const trigger = opts.langSwitch ? { ...visible, innerText: opts.langSwitch.triggerLabel, click: () => { clicks.push("trigger"); menuOpen = !menuOpen; } } : null;
  const sw = opts.langSwitch;
  const menuItems = (sw ? [...sw.menuLabels, sw.zhLabel, ...(sw.viLabel ? [sw.viLabel] : [])] : []).map((label) => ({
    ...visible, innerText: label,
    click: () => {
      clicks.push(label);
      if (label === sw!.zhLabel) currentText = sw!.zhText;
      if (label === sw!.viLabel) currentText = sw!.viText ?? "";
      menuOpen = false;
    },
  }));
  const toast = {
    style: { cssText: "" },
    appendChild: (child: { href?: string }) => { if (child.href) messages.push(`link:${child.href.slice(0, 40)}`); },
    remove: () => { messages.push("hidden"); },
    set textContent(v: string) { messages.push(v); },
  };
  const doc = {
    body: { appendChild: () => undefined },
    createElement: () => (toast.style = { cssText: "" }, { ...toast, style: toast.style, set textContent(v: string) { if (v !== "×") messages.push(v); }, setAttribute: () => undefined, href: "", target: "" }),
    querySelectorAll: (sel: string) => {
      if (sel.includes("target-id")) return [{ innerText: "Trong video này" }, ...(panelOpen ? [{ innerText: currentText }] : [])];
      if (sel.startsWith("ytd-transcript-segment")) return segmentsShown ? (opts.segments ?? []).map((innerText) => ({ innerText, ...visible })) : [];
      if (sel.startsWith("yt-dropdown-menu")) return trigger ? [trigger] : [];
      if (sel.startsWith("tp-yt-paper-item")) return menuOpen ? menuItems : [];
      if (sel.includes("yt-chip-cloud-chip-renderer")) return opts.hasTranscriptTab ? [timelineTab, transcriptTab] : [];
      if (sel.startsWith("ytd-engagement-panel")) return [];
      return opts.hasTranscriptButton && !opts.foreignUi ? [button] : []; // quét theo chữ chỉ tìm thấy nút khi giao diện là ngôn ngữ đã biết
    },
    documentElement: { lang: opts.uiLang ?? "en" },
    getElementById: () => (opts.trackCodes ? { getPlayerResponse: () => ({ captions: { playerCaptionsTracklistRenderer: { captionTracks: opts.trackCodes!.map((t) => (typeof t === "string" ? { languageCode: t } : { languageCode: t.code, kind: t.kind })) } } }) } : null),
    querySelector: (sel: string) => (sel.includes("transcript-section") ? (opts.hasTranscriptButton ? button : null) : { click: () => { clicks.push("expand"); } }),
  };
  const win = { open: (u: string) => { opened.push(u); return opts.popupBlocked ? null : {}; } };
  const fn = new Function("location", "document", "window", "alert", "btoa", "unescape", `return ${BOOKMARKLET_SOURCE}("https://songhanzi.test");`);
  fn({ search: opts.search ?? "?v=abcdefghijk", hostname: opts.hostname ?? "www.youtube.com" }, doc, win, (m: string) => alerts.push(m), (s: string) => Buffer.from(s, "binary").toString("base64"), unescape);
  return { opened, alerts, clicks, messages };
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

  it("khung 'In this video' mới (không có target-id chứa transcript): ghép từ các dòng bản chép lời", () => {
    const { opened, alerts } = run({ segments: ["0:00\n这么难得的好天气里", "0:24\n如果我找不到我就回来这里"] });
    expect(alerts).toEqual([]);
    expect(payloadOf(opened[0])).toEqual({ v: "abcdefghijk", t: "0:00\n这么难得的好天气里\n0:24\n如果我找不到我就回来这里" });
  });

  it("đang ở thẻ Timeline thì tự bấm thẻ Transcript rồi đọc", async () => {
    const { opened, alerts, clicks } = run({ segments: ["0:00\n这么难得的好天气里", "0:24\n如果我找不到我就回来这里"], hasTranscriptTab: true });
    await vi.advanceTimersByTimeAsync(4000);
    expect(alerts).toEqual([]);
    expect(clicks).toEqual(["expand", "Timeline", "Transcript"]); // thử lần lượt từng thẻ cho tới khi các dòng bản chép lời hiện ra
    expect(payloadOf(opened[0])?.t).toContain("这么难得的好天气里");
  });

  it("bảng chưa mở: tự mở rộng mô tả, bấm Hiện bản chép lời, chờ tải rồi gửi", async () => {
    const { opened, alerts, clicks } = run({ panelText: PANEL, hasTranscriptButton: true });
    await vi.advanceTimersByTimeAsync(2000);
    expect(alerts).toEqual([]);
    expect(clicks).toEqual(["expand", "Show transcript"]);
    expect(payloadOf(opened[0])).toEqual({ v: "abcdefghijk", t: PANEL });
  });

  it("giao diện YouTube ở ngôn ngữ lạ: vẫn mở được bản chép lời và chọn đúng thẻ (tìm theo cấu trúc, không theo chữ)", async () => {
    const viaButton = run({ panelText: PANEL, hasTranscriptButton: true, foreignUi: true });
    await vi.advanceTimersByTimeAsync(3000);
    expect(viaButton.clicks).toEqual(["expand", "แสดงข้อความถอดเสียง"]);
    expect(payloadOf(viaButton.opened[0])?.t).toBe(PANEL);
    const viaTab = run({ segments: ["0:00\n这么难得的好天气里", "0:24\n如果我找不到我就回来这里"], hasTranscriptTab: true, foreignUi: true });
    await vi.advanceTimersByTimeAsync(4000);
    expect(viaTab.clicks).toEqual(["expand", "ไทม์ไลน์", "ข้อความถอดเสียง"]);
    expect(payloadOf(viaTab.opened[0])?.t).toContain("这么难得的好天气里");
  });

  it("có thông báo tiến trình ngay trên trang trong lúc chờ, và gỡ đi khi xong", async () => {
    const { messages } = run({ panelText: PANEL, hasTranscriptButton: true });
    expect(messages[0]).toContain("đang đọc phụ đề");
    await vi.advanceTimersByTimeAsync(5000);
    expect(messages.some((m) => m.includes("đang mở SongHanzi"))).toBe(true);
    expect(messages).toContain("hidden");
  });

  it("trình duyệt chặn cửa sổ mới thì hiện liên kết để người dùng tự bấm mở", async () => {
    const { messages, opened } = run({ panelText: PANEL, popupBlocked: true });
    expect(opened).toHaveLength(1);
    expect(messages.some((m) => m.startsWith("link:https://songhanzi.test/video/add#d="))).toBe(true);
  });

  it("bản chép lời không phải tiếng Trung và không tự chuyển được thì báo chọn tay, không mở gì", async () => {
    const { opened, alerts } = run({ panelText: "0:00\nHello everyone\n0:05\nWelcome to the show", hasTranscriptButton: true });
    await vi.advanceTimersByTimeAsync(3000);
    expect(opened).toEqual([]);
    expect(alerts[0]).toContain("Chưa tự chuyển được");
  });

  it("bảng mở bằng ngôn ngữ khác: tự mở ô chọn ngôn ngữ, chọn tiếng Trung rồi gửi", async () => {
    const { opened, alerts, clicks } = run({
      panelText: "0:00\nHello everyone\n0:05\nWelcome to the show",
      langSwitch: { triggerLabel: "English", menuLabels: ["Arabic", "French", "English"], zhLabel: "Chinese (China)", zhText: PANEL },
    });
    await vi.advanceTimersByTimeAsync(3000);
    expect(alerts).toEqual([]);
    expect(clicks).toEqual(["trigger", "Chinese (China)"]);
    expect(payloadOf(opened[0])?.t).toBe(PANEL);
  });

  it("giao diện YouTube tiếng Việt: nhận ra mục tiếng Trung theo tên ngôn ngữ của trình duyệt, không theo chữ tiếng Anh", async () => {
    const zhLabel = `${new Intl.DisplayNames(["vi"], { type: "language" }).of("zh")} (Trung Quốc)`;
    const { opened, alerts, clicks } = run({
      uiLang: "vi",
      panelText: "0:00\nHello everyone\n0:05\nWelcome to the show",
      langSwitch: { triggerLabel: new Intl.DisplayNames(["vi"], { type: "language" }).of("en")!, menuLabels: ["Tiếng Pháp", "Tiếng Đức"], zhLabel, zhText: PANEL },
    });
    await vi.advanceTimersByTimeAsync(3000);
    expect(alerts).toEqual([]);
    expect(clicks).toEqual(["trigger", zhLabel]);
    expect(payloadOf(opened[0])?.t).toBe(PANEL);
  });

  const viSwitch = (extra: object = {}) => ({
    triggerLabel: "Chinese (China)", menuLabels: ["Arabic", "French"], zhLabel: "Chinese (China)", zhText: PANEL,
    viLabel: "Vietnamese", viText: "0:00\nXin chào mọi người\n0:05\nChào mừng bạn đến với chương trình", ...extra,
  });

  it("video có phụ đề tiếng Việt do người làm: chuyển sang tiếng Việt, đọc rồi gửi kèm cả hai bản", async () => {
    const { opened, alerts, clicks } = run({ panelText: PANEL, trackCodes: ["zh-CN", "vi"], langSwitch: viSwitch() });
    await vi.advanceTimersByTimeAsync(4000);
    expect(alerts).toEqual([]);
    expect(clicks).toEqual(["trigger", "Vietnamese"]);
    expect(payloadOf(opened[0])).toEqual({ v: "abcdefghijk", t: PANEL, vt: "0:00\nXin chào mọi người\n0:05\nChào mừng bạn đến với chương trình" });
  });

  it("track tiếng Việt chỉ là phụ đề tự động (asr) hoặc không có: không chuyển ngôn ngữ, gửi riêng tiếng Trung", async () => {
    for (const trackCodes of [["zh-CN", { code: "vi", kind: "asr" }], ["zh-CN", "en"]]) {
      const { opened, clicks } = run({ panelText: PANEL, trackCodes, langSwitch: viSwitch() });
      await vi.advanceTimersByTimeAsync(2000);
      expect(clicks).toEqual([]);
      expect(payloadOf(opened[0])).toEqual({ v: "abcdefghijk", t: PANEL });
    }
  });

  it("không chuyển được sang tiếng Việt (không có mục) thì vẫn gửi tiếng Trung, không lỗi", async () => {
    const { opened, alerts } = run({ panelText: PANEL, trackCodes: ["zh-CN", "vi"], langSwitch: viSwitch({ viLabel: undefined }) });
    await vi.advanceTimersByTimeAsync(4000);
    expect(alerts).toEqual([]);
    expect(payloadOf(opened[0])).toEqual({ v: "abcdefghijk", t: PANEL });
  });

  it("bản đọc được sau khi chọn tiếng Việt vẫn toàn chữ Hán (chọn nhầm) thì bỏ, gửi riêng tiếng Trung", async () => {
    const { opened } = run({ panelText: PANEL, trackCodes: ["zh-CN", "vi"], langSwitch: viSwitch({ viText: PANEL }) });
    await vi.advanceTimersByTimeAsync(12_000);
    expect(payloadOf(opened[0])).toEqual({ v: "abcdefghijk", t: PANEL });
  });

  it("video không có track tiếng Trung thì báo ngay, không mở bảng", () => {
    const { alerts, opened, clicks } = run({ trackCodes: ["en", "vi"], panelText: "0:00\nHello\n0:05\nWorld" });
    expect(alerts[0]).toContain("không có phụ đề tiếng Trung");
    expect(opened).toEqual([]);
    expect(clicks).toEqual([]);
  });

  it("video có track tiếng Trung (kể cả zh-TW) thì không bị chặn", () => {
    const { alerts, opened } = run({ trackCodes: ["en", "zh-TW"], panelText: PANEL });
    expect(alerts).toEqual([]);
    expect(opened).toHaveLength(1);
  });

  it("bảng không tải thì báo cách xử lý kèm mã lỗi để hỗ trợ", async () => {
    const neverLoads = run({ panelText: null, hasTranscriptButton: true });
    await vi.advanceTimersByTimeAsync(12_000);
    expect(neverLoads.alerts[0]).toContain("chưa tải được");
    expect(neverLoads.alerts[0]).toContain("mã lỗi");
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

  it("nhận bản tiếng Việt kèm theo, bỏ qua nếu sai kiểu", () => {
    const enc = (p: object) => `#d=${Buffer.from(JSON.stringify(p)).toString("base64url")}`;
    expect(decodeBookmarkletHash(enc({ v: "abcdefghijk", t: "x", vt: "y" }))).toEqual({ v: "abcdefghijk", t: "x", vt: "y" });
    expect(decodeBookmarkletHash(enc({ v: "abcdefghijk", t: "x", vt: 5 }))).toEqual({ v: "abcdefghijk", t: "x" });
  });
});

describe("mã javascript: thật (đã bỏ xuống dòng)", () => {
  it("vẫn biên dịch được và không có chú thích // nuốt mã phía sau", () => {
    const code = decodeURIComponent(buildBookmarklet("https://songhanzi.test").slice("javascript:".length));
    expect(code).not.toContain("\n");
    // Chú thích // trong một chuỗi mã không xuống dòng sẽ cắt cụt phần còn lại; mã phải kết thúc đúng bằng lời gọi hàm.
    expect(code.endsWith('("https://songhanzi.test");')).toBe(true);
    expect(() => new Function(code)).not.toThrow();
    expect(BOOKMARKLET_SOURCE.split("\n").some((l) => /^\s*\/\//.test(l))).toBe(false);
  });
});

describe("hộp thông báo trên trang YouTube", () => {
  it("có nút đóng (×) có nhãn Đóng, bấm vào gỡ hộp thông báo", () => {
    expect(BOOKMARKLET_SOURCE).toContain("setAttribute('aria-label','Đóng')");
    expect(BOOKMARKLET_SOURCE).toContain("x.onclick=hide");
  });
});
