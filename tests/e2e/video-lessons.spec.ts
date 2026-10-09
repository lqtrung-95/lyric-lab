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

test.describe("báo bản dịch một dòng sai", () => {
  async function openAndReport(page: Page, respond: { status?: number; json: unknown }) {
    await mockVideoApis(page);
    const bodies: unknown[] = [];
    await page.route(`**/api/videos/${VIDEO_ID}/report-translation`, (route) => {
      bodies.push(route.request().postDataJSON());
      return route.fulfill({ status: respond.status ?? 200, json: respond.json });
    });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`/video/${VIDEO_ID}`);
    const row = page.locator('[data-line-index="1"]');
    await row.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await row.hover();
    await page.getByRole("button", { name: "Báo bản dịch câu 2 sai" }).click();
    await page.getByRole("dialog", { name: "Báo bản dịch này sai?" }).getByRole("button", { name: "Báo và dịch lại" }).click();
    return bodies;
  }

  test("AI dịch lại ngay: bản dịch mới thay trên màn hình, báo cáo gửi đúng dòng", async ({ page }) => {
    const bodies = await openAndReport(page, { json: { kind: "retranslated", translation: "Hôm nay trời đẹp thật." } });
    await expect(page.getByText("Đã dịch lại câu này")).toBeVisible();
    await expect(page.getByText("Hôm nay trời đẹp thật.")).toBeVisible();
    await expect(page.getByText("Hôm nay thời tiết đẹp.")).toHaveCount(0);
    expect(bodies).toEqual([{ lineIndex: 1 }]);
  });

  test("hỏi xác nhận trước khi báo: bấm Hủy thì không gửi gì", async ({ page }) => {
    await mockVideoApis(page);
    let calls = 0;
    await page.route(`**/api/videos/${VIDEO_ID}/report-translation`, (route) => { calls++; return route.fulfill({ json: { kind: "reported" } }); });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`/video/${VIDEO_ID}`);
    const row = page.locator('[data-line-index="1"]');
    await row.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await row.hover();
    await page.getByRole("button", { name: "Báo bản dịch câu 2 sai" }).click();
    const dialog = page.getByRole("dialog", { name: "Báo bản dịch này sai?" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Hủy" }).click();
    await expect(dialog).toBeHidden();
    await page.waitForTimeout(400);
    expect(calls).toBe(0);
    await expect(page.getByText("Hôm nay thời tiết đẹp.")).toBeVisible();
  });

  test("đã là bản AI hoặc hết trần: chỉ ghi nhận, bản dịch giữ nguyên", async ({ page }) => {
    await openAndReport(page, { json: { kind: "reported" } });
    await expect(page.getByText("Đã ghi nhận, quản trị viên sẽ xem lại")).toBeVisible();
    await expect(page.getByText("Hôm nay thời tiết đẹp.")).toBeVisible();
  });

  test("báo quá nhiều trong ngày thì báo rõ", async ({ page }) => {
    await openAndReport(page, { status: 429, json: { error: "user_limit" } });
    await expect(page.getByText("Hôm nay bạn đã báo nhiều rồi")).toBeVisible();
  });

  test("dòng chưa có bản dịch thì không có nút báo", async ({ page }) => {
    await page.route("https://www.youtube.com/iframe_api", (route) => route.fulfill({ contentType: "text/javascript", body: STUB }));
    await page.route(`**/api/videos/${VIDEO_ID}`, (route) => route.fulfill({ json: { ...lesson, lines: lesson.lines.map((l, i) => (i === 1 ? { ...l, translation: null } : l)) } }));
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`/video/${VIDEO_ID}`);
    await expect(page.locator('[data-line-index="1"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Báo bản dịch câu 2 sai" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Báo bản dịch câu 1 sai" })).toHaveCount(1);
  });
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

test("quản trị video: dòng bị báo hiện số lần, bản cũ và khôi phục được; dòng đã khôi phục không còn nút", async ({ page }) => {
  const patches: unknown[] = [];
  let restored = false;
  await page.route("**/api/admin/whoami", (route) => route.fulfill({ json: { isAdmin: true } }));
  await page.route(`**/api/admin/videos/${VIDEO_ID}`, async (route) => {
    if (route.request().method() === "PATCH") {
      patches.push(route.request().postDataJSON());
      restored = true;
      return route.fulfill({ json: { done: "restore_translation" } });
    }
    const reports = [
      { id: 7, lineIdx: 1, oldTranslation: "Hôm nay trời nắng đẹp.", outcome: "retranslated", createdAt: "2026-10-10T01:00:00Z" },
      { id: 6, lineIdx: 2, oldTranslation: "Chúng ta đi công viên nhé.", outcome: "reported", createdAt: "2026-10-09T01:00:00Z" },
    ];
    const lines = lesson.lines.map((l, i) => (i === 1 ? { ...l, translation: "Bản AI mới.", translationBy: "ai" } : { ...l }));
    return route.fulfill({ json: { ...adminSummary, lines, reports } });
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`/admin/videos/${VIDEO_ID}`);
  await expect(page.getByText(/2 dòng bị báo sai/)).toBeVisible();
  await expect(page.getByText("AI đã dịch lại", { exact: true })).toBeVisible();
  await expect(page.getByText("Hôm nay trời nắng đẹp.")).toBeVisible();
  await noViolations(page);
  await page.getByLabel("Chỉ hiện dòng bị báo sai").check();
  await expect(page.getByLabel(/Bản dịch dòng/)).toHaveCount(2);
  await page.getByRole("button", { name: "Khôi phục bản cũ" }).click();
  await expect.poll(() => patches).toEqual([{ action: "restore_translation", reportId: 7 }]);
  expect(restored).toBe(true);
  await expect(page.getByLabel("Bản dịch dòng 2")).toHaveValue("Hôm nay trời nắng đẹp.");
  await expect(page.getByText("Admin đã xác nhận", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Khôi phục bản cũ" })).toHaveCount(0);
});

test("quản trị video: khôi phục khi dòng đã được sửa trước đó (409) thì báo, không đổi nội dung", async ({ page }) => {
  await page.route("**/api/admin/whoami", (route) => route.fulfill({ json: { isAdmin: true } }));
  await page.route(`**/api/admin/videos/${VIDEO_ID}`, (route) => {
    if (route.request().method() === "PATCH") return route.fulfill({ status: 409, json: { error: "unchanged" } });
    const lines = lesson.lines.map((l, i) => (i === 1 ? { ...l, translation: "Bản AI mới.", translationBy: "ai" } : { ...l }));
    return route.fulfill({ json: { ...adminSummary, lines, reports: [{ id: 7, lineIdx: 1, oldTranslation: "Bản cũ.", outcome: "retranslated", createdAt: "2026-10-10T01:00:00Z" }] } });
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`/admin/videos/${VIDEO_ID}`);
  await page.getByRole("button", { name: "Khôi phục bản cũ" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "đã được sửa trước đó" })).toBeVisible();
  await expect(page.getByLabel("Bản dịch dòng 2")).toHaveValue("Bản AI mới.");
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

// ---- Nạp video từ kênh (API giả lập) ----
const planVideos = [
  { videoId: "aaaaaaaaaa1", title: "Video có phụ đề", durationSec: 600, embeddable: true, exists: false },
  { videoId: "aaaaaaaaaa2", title: "Video không có phụ đề", durationSec: 60, embeddable: true, exists: false },
  { videoId: "aaaaaaaaaa3", title: "Video đã có", durationSec: 300, embeddable: true, exists: true },
];

test("nạp video từ kênh: tìm, nạp lần lượt, bỏ qua video không phụ đề, báo tiến độ", async ({ page }) => {
  const ingested: unknown[] = [];
  await page.route("**/api/admin/whoami", (route) => route.fulfill({ json: { isAdmin: true } }));
  await page.route("**/api/admin/videos", (route) => route.fulfill({ json: { videos: [] } }));
  await page.route("**/api/admin/videos/ingest/plan", (route) => route.fulfill({ json: { channel: { id: "UCx", title: "Kênh thử" }, videos: planVideos } }));
  await page.route("**/api/admin/videos/ingest", (route) => {
    const body = route.request().postDataJSON() as { videoId: string; owned: boolean };
    ingested.push(body);
    return route.fulfill({ json: body.videoId === "aaaaaaaaaa1" ? { kind: "ingested", lineCount: 120, translatedLineCount: 118, levelAvg: 2 } : { kind: "skipped", reason: "no_human_zh_captions" } });
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/admin/videos");
  await page.getByLabel("Tên kênh YouTube").fill("https://www.youtube.com/@KenhThu");
  await page.getByLabel("Đây là kênh của tôi").check();
  await page.getByRole("button", { name: "Tìm video" }).click();
  await expect(page.getByText(/3 video gần đây, 1 đã có, 2 có thể nạp/)).toBeVisible();
  await noViolations(page);

  await page.getByRole("button", { name: "Nạp 2 video" }).click();
  await expect(page.getByText("120 dòng, dịch 118/120")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Bỏ qua: Không có phụ đề tiếng Trung do người làm")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("status").filter({ hasText: "Xong 1 · bỏ qua 1 · lỗi 0 · còn 0" })).toBeVisible();
  expect(ingested).toEqual([{ videoId: "aaaaaaaaaa1", owned: true }, { videoId: "aaaaaaaaaa2", owned: true }]);
});

test("nạp video từ kênh: YouTube chặn tạm thì báo lỗi, dừng sớm và cho thử lại video lỗi", async ({ page }) => {
  let allow = false;
  await page.route("**/api/admin/whoami", (route) => route.fulfill({ json: { isAdmin: true } }));
  await page.route("**/api/admin/videos", (route) => route.fulfill({ json: { videos: [] } }));
  await page.route("**/api/admin/videos/ingest/plan", (route) => route.fulfill({ json: { channel: { id: "UCx", title: "Kênh thử" }, videos: planVideos.slice(0, 2) } }));
  await page.route("**/api/admin/videos/ingest", (route) =>
    allow ? route.fulfill({ json: { kind: "ingested", lineCount: 10, translatedLineCount: 10, levelAvg: 1 } }) : route.fulfill({ status: 503, json: { error: "blocked" } }));
  await page.clock.install();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/admin/videos");
  await page.getByLabel("Tên kênh YouTube").fill("KenhThu");
  await page.getByRole("button", { name: "Tìm video" }).click();
  await page.getByRole("button", { name: "Nạp 2 video" }).click();
  // Nhanh tiến thời gian qua các lần nghỉ thử lại (20s, 60s) của hai video.
  for (let i = 0; i < 8; i++) { await page.clock.fastForward(60_000); await page.waitForTimeout(150); }
  await expect(page.getByText(/YouTube vẫn đang chặn tạm việc tải phụ đề nên đã dừng/)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("YouTube đang chặn tạm").first()).toBeVisible();
  allow = true;
  await page.getByRole("button", { name: "Thử lại video lỗi" }).click();
  for (let i = 0; i < 4; i++) { await page.clock.fastForward(5_000); await page.waitForTimeout(150); }
  await expect(page.getByRole("status").filter({ hasText: /Xong 2 · bỏ qua 0 · lỗi 0/ })).toBeVisible({ timeout: 15_000 });
});
