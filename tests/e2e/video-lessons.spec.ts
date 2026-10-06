import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Video luyện nghe với dữ liệu hư cấu (API được giả lập, không cần DB). YouTube IFrame API được thay bằng bản giả có thể điều khiển thời gian.
const STUB = `window.__t = 0; window.__playing = true; window.__yt = [];
window.YT = { PlayerState: { PLAYING: 1 }, Player: function (el, opts) {
  el.replaceWith(document.createElement('div'));
  setTimeout(function () { opts.events.onReady({ target: {
    seekTo: function (s) { window.__yt.push('seek:' + s); window.__t = s; },
    playVideo: function () { window.__yt.push('play'); window.__playing = true; },
    pauseVideo: function () { window.__yt.push('pause'); window.__playing = false; },
    setPlaybackRate: function (r) { window.__yt.push('rate:' + r); },
    getCurrentTime: function () { return window.__t; },
    getPlayerState: function () { return window.__playing ? 1 : 2; } } }); }, 0);
  this.destroy = function () {}; } };
window.onYouTubeIframeAPIReady && window.onYouTubeIframeAPIReady();`;

const VIDEO_ID = "aBcDeFgHiJk";
const summary = { videoId: VIDEO_ID, title: "Cuộc trò chuyện mẫu", channelTitle: "Kênh thử", durationSec: 90, levelAvg: 1.5, lineCount: 3 };
const lesson = {
  ...summary, translationSource: "youtube",
  lines: [
    { idx: 0, start: 0, end: 4, text: "你好，朋友。", pinyin: "nǐ hǎo ， péng you 。", translation: "Xin chào, bạn bè.", tokens: [{ text: "你好" }, { text: "，" }, { text: "朋友" }, { text: "。" }] },
    { idx: 1, start: 4, end: 8, text: "今天天气很好。", pinyin: "jīn tiān tiān qì hěn hǎo 。", translation: "Hôm nay thời tiết đẹp.", tokens: [{ text: "今天" }, { text: "天气" }, { text: "很" }, { text: "好" }, { text: "。" }] },
    { idx: 2, start: 8, end: 12, text: "我们去公园吧。", pinyin: "wǒ men qù gōng yuán ba 。", translation: "Chúng ta đi công viên nhé.", tokens: [{ text: "我们" }, { text: "去" }, { text: "公园" }, { text: "吧" }, { text: "。" }] },
  ],
};

async function mockVideoApis(page: Page) {
  await page.route("https://www.youtube.com/iframe_api", (route) => route.fulfill({ contentType: "text/javascript", body: STUB }));
  await page.route("**/api/videos", (route) => route.fulfill({ json: { videos: [summary] } }));
  await page.route(`**/api/videos/${VIDEO_ID}`, (route) => route.fulfill({ json: lesson }));
  await page.route("**/api/lookup?*", (route) => route.fulfill({ json: { entry: { term: "朋友", pinyin: "péng you", sinoViet: "bằng hữu", hskLevel: 1, meanings: ["friend"] } } }));
  await page.route("**/api/explain", (route) => route.fulfill({ json: { meaningInContext: "Chỉ người bạn thân thiết.", fromCache: true, model: "test" } }));
}

const noViolations = async (page: Page) => {
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]);
};

test("danh sách video: hiện thẻ video đã duyệt, mục Video có trên thanh điều hướng, mở được trang xem", async ({ page }) => {
  await mockVideoApis(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/video");
  await expect(page.getByRole("heading", { name: "Video luyện nghe" })).toBeVisible();
  await expect(page.getByRole("navigation").getByRole("link", { name: "Video" }).first()).toBeVisible();
  const card = page.getByRole("link", { name: /Cuộc trò chuyện mẫu/ });
  await expect(card).toBeVisible();
  await expect(page.getByText(/HSK ~1\.5 · 3 câu · 2 phút/)).toBeVisible();
  await noViolations(page);
  await card.click();
  await expect(page).toHaveURL(new RegExp(`/video/${VIDEO_ID}$`));
});

test("xem video: bản chép chạy theo thời gian, bấm từ tra được và lưu thẻ, bấm câu nhảy tới đó", async ({ page }) => {
  await mockVideoApis(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`/video/${VIDEO_ID}`);
  const line = (n: number) => page.locator(`[data-line-index="${n}"]`);
  await expect(line(0)).toBeVisible();
  await expect(page.getByText("Xin chào, bạn bè.")).toBeVisible();
  await expect(page.locator("ruby").first()).toBeVisible(); // pinyin trên từng chữ
  // Không có nút gợi ý sửa bản dịch (chỉ dành cho bài hát) và không có nút luyện/giải thích riêng của màn Nghe.
  await expect(page.getByRole("button", { name: /gợi ý bản dịch|Gợi ý/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Luyện phát âm câu đang hát" })).toHaveCount(0);

  await line(0).getByRole("button", { name: "朋友" }).click();
  const dialog = page.getByRole("dialog", { name: "Tra từ 朋友" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Chỉ người bạn thân thiết.")).toBeVisible();
  await expect(dialog.getByText("friend")).toBeVisible();
  await noViolations(page);
  await dialog.getByRole("button", { name: "Lưu", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "Đã lưu" })).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("lyric-lab-learner-state") ?? "{}").saved ?? []);
  expect(saved).toMatchObject([{ key: "vocab:朋友", videoId: VIDEO_ID, lineIndex: 0, start: 0, type: "vocab" }]);
  await dialog.getByRole("button", { name: "Đóng" }).click();

  // Phát tới câu 2: câu đang phát chuyển theo thời gian video.
  await page.evaluate(() => { (window as unknown as { __t: number }).__t = 5; });
  await expect(line(1)).toHaveAttribute("aria-current", "true");

  await line(2).click();
  expect(await page.evaluate(() => (window as unknown as { __yt: string[] }).__yt)).toContain("seek:8");
});

test("video chưa duyệt hoặc không có: báo rõ và có đường về danh sách", async ({ page }) => {
  await page.route("https://www.youtube.com/iframe_api", (route) => route.fulfill({ contentType: "text/javascript", body: STUB }));
  await page.route(`**/api/videos/${VIDEO_ID}`, (route) => route.fulfill({ status: 404, json: { error: "not_found" } }));
  await page.goto(`/video/${VIDEO_ID}`);
  await expect(page.getByRole("heading", { name: "Không tìm thấy video này" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Về danh sách video" })).toBeVisible();
});

test("chép chính tả: nghe câu, gõ pinyin, kiểm tra từng âm tiết, lưu tiến độ, tổng kết và làm lại", async ({ page }) => {
  await mockVideoApis(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`/video/${VIDEO_ID}/dictation`);
  await expect(page.getByText("Câu 1 / 3")).toBeVisible();
  await expect(page.getByLabel(/Gõ lại câu bạn nghe được \(4 âm tiết\)/)).toBeVisible();

  await page.getByRole("button", { name: "Nghe câu này" }).click();
  expect(await page.evaluate(() => (window as unknown as { __yt: string[] }).__yt)).toContain("seek:0");

  // Câu 1: gõ không thanh vẫn đạt (nửa điểm cho thanh).
  await page.getByLabel(/Gõ lại câu bạn nghe được/).fill("ni hao peng you");
  await page.getByRole("button", { name: "Kiểm tra" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Đúng chữ, chú ý thanh điệu nhé" })).toBeVisible();
  await expect(page.getByText("Xin chào, bạn bè.")).toBeVisible();
  await noViolations(page);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("lyric-lab-dictation:aBcDeFgHiJk") ?? "{}"))).toMatchObject({ mode: "pinyin", scores: { 0: 0.625 } });

  // Câu 2: gõ sai.
  await page.getByRole("button", { name: "Câu tiếp" }).click();
  await expect(page.getByText("Câu 2 / 3")).toBeVisible();
  await page.getByLabel(/Gõ lại câu bạn nghe được/).fill("xyz");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status").filter({ hasText: "Chưa đúng" })).toBeVisible();

  // Câu 3: bỏ qua rồi xem tổng kết.
  await page.getByRole("button", { name: "Câu tiếp" }).click();
  await page.getByRole("button", { name: "Bỏ qua câu" }).click();
  await page.getByRole("button", { name: "Xem tổng kết" }).click();
  await expect(page.getByRole("heading", { name: "Hoàn thành bài chép" })).toBeVisible();
  await expect(page.getByText(/0\/3 câu chính xác hoàn toàn/)).toBeVisible();
  await noViolations(page);
  await expect(page.getByRole("link", { name: "Xem lại" }).first()).toHaveAttribute("href", new RegExp(`/video/${VIDEO_ID}\\?t=\\d+`));

  // Tải lại: đã làm hết nên mở thẳng tổng kết; làm lại thì xóa điểm và về câu 1.
  await page.reload();
  await expect(page.getByRole("heading", { name: "Hoàn thành bài chép" })).toBeVisible();
  await page.getByRole("button", { name: "Làm lại từ đầu" }).click();
  await expect(page.getByText("Câu 1 / 3")).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("lyric-lab-dictation:aBcDeFgHiJk") ?? "{}").scores)).toEqual({});
});

test("chép chính tả: chế độ chữ Hán chấm từng chữ và nhớ chế độ", async ({ page }) => {
  await mockVideoApis(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`/video/${VIDEO_ID}/dictation`);
  await page.getByRole("radio", { name: "Gõ chữ Hán" }).check({ force: true });
  await expect(page.getByLabel(/\(4 chữ Hán\)/)).toBeVisible();
  await page.getByLabel(/Gõ lại câu bạn nghe được/).fill("你好朋友");
  await page.getByRole("button", { name: "Kiểm tra" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Chính xác!" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("radio", { name: "Gõ chữ Hán" })).toBeChecked();
});

// ---- Quản trị video (API giả lập) ----
const adminSummary = { ...summary, status: "draft", translationSource: "youtube", translatedLineCount: 2, createdAt: "2026-10-06T10:00:00Z" };

async function mockAdminApis(page: Page, patches: unknown[]) {
  await page.route("**/api/admin/whoami", (route) => route.fulfill({ json: { isAdmin: true } }));
  await page.route("**/api/admin/videos", (route) => route.fulfill({ json: { videos: [adminSummary] } }));
  await page.route(`**/api/admin/videos/${VIDEO_ID}`, async (route) => {
    if (route.request().method() === "PATCH") {
      patches.push(route.request().postDataJSON());
      return route.fulfill({ json: { done: "ok" } });
    }
    return route.fulfill({ json: { ...adminSummary, lines: [{ ...lesson.lines[0] }, { ...lesson.lines[1], translation: null }, { ...lesson.lines[2] }] } });
  });
}

test("quản trị video: danh sách theo trạng thái, duyệt thành đang hiện, xóa cần xác nhận", async ({ page }) => {
  const patches: unknown[] = [];
  await mockAdminApis(page, patches);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/admin/videos");
  await expect(page.getByRole("heading", { name: "Quản lý video" })).toBeVisible();
  await expect(page.getByText("Nháp", { exact: true })).toBeVisible();
  await expect(page.getByText(/3 dòng · dịch 2\/3/)).toBeVisible();
  await noViolations(page);

  await page.getByRole("button", { name: "Duyệt, hiện công khai" }).click();
  await expect(page.getByText("Đang hiện", { exact: true })).toBeVisible();
  expect(patches).toEqual([{ action: "list" }]);
  await expect(page.getByRole("button", { name: "Ẩn" })).toBeVisible();

  await page.getByRole("button", { name: "Xóa", exact: true }).click();
  await expect(page.getByRole("alertdialog", { name: "Xác nhận xóa video" })).toBeVisible();
  await page.getByRole("button", { name: "Giữ lại" }).click();
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
  expect(patches).toHaveLength(1); // chưa xóa
  await page.getByRole("button", { name: "Xóa", exact: true }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Xóa", exact: true }).click();
  await expect(page.getByText("Chưa có video nào")).toBeVisible();
  expect(patches[1]).toEqual({ action: "delete" });
});

test("quản trị video: rà bản dịch từng dòng, lọc dòng thiếu dịch và lưu", async ({ page }) => {
  const patches: unknown[] = [];
  await mockAdminApis(page, patches);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`/admin/videos/${VIDEO_ID}`);
  await expect(page.getByText(/1 dòng thiếu bản dịch/)).toBeVisible();
  await noViolations(page);
  await page.getByLabel("Chỉ hiện dòng thiếu bản dịch").check();
  await expect(page.getByLabel(/Bản dịch dòng/)).toHaveCount(1);
  const box = page.getByLabel("Bản dịch dòng 2");
  await box.fill("Hôm nay trời đẹp.");
  await page.getByRole("button", { name: "Lưu bản dịch" }).click();
  await expect.poll(() => patches).toEqual([{ action: "edit_translation", idx: 1, translation: "Hôm nay trời đẹp." }]);
  await expect(page.getByText(/0 dòng thiếu bản dịch/)).toBeVisible();
});

// ---- Luyện nói theo (shadowing) ----
const FAKE_MIC = `navigator.mediaDevices.getUserMedia = async function () { return { getTracks: function () { return [{ stop: function () {} }]; } }; };
window.MediaRecorder = class { constructor() { this.mimeType = 'audio/webm'; }
  start() {} stop() { this.ondataavailable({ data: new Blob(['x'], { type: 'audio/webm' }) }); this.onstop(); } };`;

test("luyện nói: nghe, nhớ nghĩa, ghi âm rồi nghe lại; ẩn bớt chữ; sang câu khác đặt lại các bước", async ({ page }) => {
  await mockVideoApis(page);
  await page.addInitScript(FAKE_MIC);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`/video/${VIDEO_ID}/shadowing`);
  await expect(page.getByText("Câu 1 / 3")).toBeVisible();
  await expect(page.locator('section[aria-label="Câu đang luyện"] ruby').first()).toBeVisible();
  await noViolations(page);

  // Ẩn chữ Hán và pinyin: chỉ còn lời nhắc nghe.
  await page.getByRole("button", { name: "Chữ Hán" }).click();
  await page.getByRole("button", { name: "Pinyin", exact: true }).click();
  await expect(page.getByText("Đã ẩn chữ, hãy nghe thật kỹ rồi nói theo.")).toBeVisible();
  await page.getByRole("button", { name: "Chữ Hán" }).click();
  await page.getByRole("button", { name: "Pinyin", exact: true }).click();

  await page.getByRole("button", { name: "Nghe bản gốc" }).click();
  expect(await page.evaluate(() => (window as unknown as { __yt: string[] }).__yt)).toContain("seek:0");
  await page.getByRole("tab", { name: "Nghĩ" }).click();
  await expect(page.getByText("Xin chào, bạn bè.").last()).toBeVisible();
  await page.getByRole("button", { name: "Đã nhớ nghĩa, nói thôi" }).click();
  await page.getByRole("button", { name: "Bắt đầu ghi âm" }).click();
  await page.getByRole("button", { name: "Dừng ghi âm" }).click();
  await expect(page.locator("audio")).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { __yt: string[] }).__yt)).toContain("pause");

  await page.getByRole("button", { name: "Câu sau" }).click();
  await expect(page.getByText("Câu 2 / 3")).toBeVisible();
  await expect(page.getByRole("tab", { name: "Nghe", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("audio")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Câu trước" })).toBeEnabled();
});
