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
  await page.route("**/api/practice/video", (route) => route.fulfill({ json: { ok: true } }));
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

test("xem video: tiêu đề rất dài bị cắt (rê chuột đọc đủ), thanh trên gọn và không tràn ở mọi cỡ màn hình", async ({ page }) => {
  const LONG = "Slow Chinese Vlog | What's in a Chinese Shopping Mall? | Comprehensible Input for HSK 1–3 | Một tiêu đề cực kỳ dài để thử cắt chữ | Slow Chinese Vlog | What's in a Chinese Shopping Mall? | Comprehensible Input for HSK 1–3";
  await mockVideoApis(page);
  await page.route(`**/api/videos/${VIDEO_ID}`, (route) => route.fulfill({ json: { ...lesson, title: LONG } }));
  for (const [width, height] of [[1920, 800], [1280, 800], [900, 800], [390, 800]]) {
    await page.setViewportSize({ width, height });
    await page.goto(`/video/${VIDEO_ID}`);
    const title = page.locator("p[lang=zh][title]").first();
    await expect(title).toHaveAttribute("title", LONG);
    expect(await title.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true); // bị cắt bằng dấu …
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true); // không tràn ngang
    const nav = await page.getByRole("tablist", { name: "Cách học video này" }).boundingBox();
    expect(nav!.x + nav!.width).toBeLessThanOrEqual(width);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `test-results/video-header-${width}.png`, clip: { x: 0, y: 0, width, height: 260 } });
  }
});

test("học video: ba tab dùng chung một trình phát, đổi tab không tải lại trang và ghi tab lên địa chỉ; link cũ vẫn mở đúng tab", async ({ page }) => {
  await mockVideoApis(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`/video/${VIDEO_ID}`);
  const tabs = page.getByRole("tablist", { name: "Cách học video này" });
  await expect(tabs.getByRole("tab")).toHaveText(["Phụ đề", "Nghe – chép", "Luyện nói"]);
  await expect(tabs.getByRole("tab", { name: "Phụ đề" })).toHaveAttribute("aria-selected", "true");
  await page.evaluate(() => { (window as unknown as { __marker: number }).__marker = 1; });

  await tabs.getByRole("tab", { name: "Nghe – chép" }).click();
  await expect(page.getByRole("radiogroup", { name: "Mức gợi ý" })).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/video/${VIDEO_ID}\\?tab=dictation$`));
  await expect(page.locator("[data-line-index]")).toHaveCount(0); // danh sách phụ đề không còn
  await tabs.getByRole("tab", { name: "Luyện nói" }).click();
  await expect(page.getByRole("region", { name: "Câu đang luyện" })).toBeVisible();
  await tabs.getByRole("tab", { name: "Phụ đề" }).click();
  await expect(page.locator('[data-line-index="0"]')).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/video/${VIDEO_ID}$`));
  expect(await page.evaluate(() => (window as unknown as { __marker?: number }).__marker)).toBe(1); // không tải lại trang

  // Bố cục hai cột: video bên trái, tab bên phải, khối video dính khi cuộn.
  const player = await page.locator("[data-sticky-player]").boundingBox();
  const panel = await page.getByRole("tabpanel").boundingBox();
  expect(player!.x + player!.width).toBeLessThanOrEqual(panel!.x + 1);
  await page.screenshot({ path: "test-results/video-study-subtitles.png" });

  await page.goto(`/video/${VIDEO_ID}/dictation`); // link cũ
  await expect(page).toHaveURL(new RegExp(`/video/${VIDEO_ID}\\?tab=dictation$`));
  await expect(page.getByRole("tab", { name: "Nghe – chép" })).toHaveAttribute("aria-selected", "true");
  await page.screenshot({ path: "test-results/video-study-dictation.png" });
  await page.goto(`/video/${VIDEO_ID}/shadowing`);
  await expect(page.getByRole("tab", { name: "Luyện nói" })).toHaveAttribute("aria-selected", "true");
  await page.goto(`/video/${VIDEO_ID}?tab=bậy`); // tab sai: về Phụ đề
  await expect(page.getByRole("tab", { name: "Phụ đề" })).toHaveAttribute("aria-selected", "true");
});

test("học video trên điện thoại: video dính ở trên, tab xếp ngay dưới, không tràn ngang", async ({ page }) => {
  await mockVideoApis(page);
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto(`/video/${VIDEO_ID}?tab=dictation`);
  const player = await page.locator("[data-sticky-player]").boundingBox();
  const tabs = await page.getByRole("tablist", { name: "Cách học video này" }).boundingBox();
  expect(tabs!.y).toBeGreaterThanOrEqual(player!.y + player!.height - 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/video-study-mobile.png" });
});

test("xem video: 5 nút điều khiển, nút phát nằm chính giữa thanh", async ({ page }) => {
  await mockVideoApis(page);
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.goto(`/video/${VIDEO_ID}`);
  const bar = page.getByRole("group", { name: "Điều khiển nhanh" });
  await expect(bar.getByRole("button")).toHaveCount(5);
  await expect(bar.getByRole("button", { name: "Phát lại câu đang hát" })).toBeVisible();
  const [barBox, playBox] = [await bar.boundingBox(), await bar.getByRole("button").nth(2).boundingBox()];
  expect(Math.abs(playBox!.x + playBox!.width / 2 - (barBox!.x + barBox!.width / 2))).toBeLessThan(2);
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
  await line(2).click({ position: { x: 6, y: 6 } }); // mép dòng: ở giữa dòng có thể trúng nút từ (mở tra từ) thay vì tua
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

const answerBox = (page: Page) => page.getByLabel(/Gõ lại câu bạn nghe được/);

test("chép chính tả: nghe câu, gõ pinyin, kiểm tra từng âm tiết, lưu tiến độ, tổng kết và làm lại", async ({ page }) => {
  await mockVideoApis(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`/video/${VIDEO_ID}/dictation`);
  await expect(page.getByText("Câu 1", { exact: false }).first()).toBeVisible();
  await expect(page.getByRole("radio", { name: /Gõ chữ Hán|Gõ pinyin/ })).toHaveCount(0); // không còn nút chọn chế độ gõ

  await page.getByRole("button", { name: /^Nghe/ }).click();
  expect(await page.evaluate(() => (window as unknown as { __yt: string[] }).__yt)).toContain("seek:0");
  await expect(page.getByRole("button", { name: /^Nghe ×1/ })).toBeVisible(); // đếm số lần nghe

  // Câu 1: gõ pinyin không thanh vẫn đạt (nửa điểm cho thanh).
  await answerBox(page).fill("ni hao peng you");
  const studyPosts: string[] = [];
  page.on("request", (r) => { if (r.url().endsWith("/api/practice/video")) studyPosts.push(r.postData() ?? ""); });
  await page.getByRole("button", { name: "Kiểm tra" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Đúng chữ, chú ý thanh điệu nhé" })).toBeVisible();
  await expect.poll(() => studyPosts.length).toBe(1); // mỗi câu chép xong báo máy chủ một lần để tính chuỗi ngày và mục tiêu
  expect(JSON.parse(studyPosts[0])).toEqual({ mode: "dictation", lines: 1, correct: 1 }); // đúng chữ, chỉ thiếu thanh: vẫn là đạt
  await expect(page.getByText("Xin chào, bạn bè.")).toBeVisible();
  await noViolations(page);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("lyric-lab-dictation:aBcDeFgHiJk") ?? "{}"))).toEqual({ scores: { 0: 0.625 } });

  // Câu 2: gõ sai, Enter để kiểm tra.
  await page.getByRole("button", { name: "Câu tiếp" }).click();
  await expect(page.getByText("Câu 2", { exact: false }).first()).toBeVisible();
  await answerBox(page).fill("xyz");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status").filter({ hasText: "Chưa đúng" })).toBeVisible();

  // Câu 3: xem đáp án (bỏ qua) rồi xem tổng kết.
  await page.getByRole("button", { name: "Câu tiếp" }).click();
  await page.getByRole("button", { name: "Xem đáp án" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Chưa đúng" })).toBeVisible();
  await page.getByRole("button", { name: "Xem tổng kết" }).click();
  await expect(page.getByRole("heading", { name: "Hoàn thành bài chép" })).toBeVisible();
  await expect(page.getByText(/0\/3 câu chính xác hoàn toàn/)).toBeVisible();
  await noViolations(page);
  await expect(page.getByRole("link", { name: "Xem lại" }).first()).toHaveAttribute("href", new RegExp(`/video/${VIDEO_ID}\\?t=\\d+`));

  // Tải lại: đã làm hết nên mở thẳng tổng kết; làm lại thì xóa điểm và về câu 1.
  await page.reload();
  await expect(page.getByRole("heading", { name: "Hoàn thành bài chép" })).toBeVisible();
  await page.getByRole("button", { name: "Làm lại từ đầu" }).click();
  await expect(page.getByText("Câu 1", { exact: false }).first()).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("lyric-lab-dictation:aBcDeFgHiJk") ?? "{}").scores)).toEqual({});
});

test("chép chính tả: cùng một ô nhận chữ Hán (chấm từng chữ), gợi ý pinyin, lưới tiến độ nhảy tới câu bất kỳ", async ({ page }) => {
  await mockVideoApis(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`/video/${VIDEO_ID}/dictation`);

  await expect(page.getByText("Cần điền 4 chữ Hán")).toBeVisible(); // luôn hiện số chữ cần điền, không cần chọn gợi ý
  await page.getByRole("radio", { name: "Pinyin" }).check({ force: true });
  await expect(page.getByText(/Pinyin:.*nǐ hǎo/)).toBeVisible();

  await answerBox(page).fill("你好朋友");
  await page.getByRole("button", { name: "Kiểm tra" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Chính xác!" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Câu 1, 100 phần trăm" })).toBeVisible(); // lưới tiến độ cập nhật điểm
  await expect(page.getByText(/đã làm 1 câu, điểm TB 100/)).toBeVisible();

  await page.getByRole("button", { name: "Câu 3, chưa làm" }).click();
  await expect(page.getByText("Câu 3", { exact: false }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Câu 3, chưa làm" })).toHaveAttribute("aria-current", "step");
  await expect(answerBox(page)).toHaveValue("");

  // Esc nghe lại câu đang làm.
  await answerBox(page).focus();
  const before = await page.evaluate(() => (window as unknown as { __yt: string[] }).__yt.length);
  await page.keyboard.press("Escape");
  expect(await page.evaluate(() => (window as unknown as { __yt: string[] }).__yt.length)).toBeGreaterThan(before);
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

test("video chưa có bản dịch nào: người học thấy thông báo, vẫn xem được bản chép", async ({ page }) => {
  await page.route("https://www.youtube.com/iframe_api", (route) => route.fulfill({ contentType: "text/javascript", body: STUB }));
  await page.route(`**/api/videos/${VIDEO_ID}`, (route) => route.fulfill({ json: { ...lesson, translationSource: "none", lines: lesson.lines.map((l) => ({ ...l, translation: null })) } }));
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`/video/${VIDEO_ID}`);
  await expect(page.getByRole("note").filter({ hasText: "chưa có bản dịch tiếng Việt" })).toBeVisible();
  await expect(page.locator('[data-line-index="0"]')).toBeVisible();
});

test("video đã có bản dịch thì không hiện thông báo thiếu bản dịch", async ({ page }) => {
  await mockVideoApis(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`/video/${VIDEO_ID}`);
  await expect(page.getByText("Xin chào, bạn bè.")).toBeVisible();
  await expect(page.getByRole("note")).toHaveCount(0);
});

test("quản trị video: dịch bù các dòng còn thiếu bằng AI rồi tải lại bản dịch", async ({ page }) => {
  const patches: unknown[] = [];
  let translated = false;
  await page.route("**/api/admin/whoami", (route) => route.fulfill({ json: { isAdmin: true } }));
  await page.route(`**/api/admin/videos/${VIDEO_ID}`, async (route) => {
    if (route.request().method() === "PATCH") {
      patches.push(route.request().postDataJSON());
      await new Promise((r) => setTimeout(r, 400));
      translated = true;
      return route.fulfill({ json: { done: "translate_missing", translated: 1, remaining: 0 } });
    }
    // Dòng 2 thiếu bản dịch cho tới khi AI dịch bù.
    const lines = lesson.lines.map((l, i) => {
      if (i !== 1) return l;
      return translated ? { ...l, translation: "Bản AI vừa dịch.", translationBy: "ai" } : { ...l, translation: null };
    });
    return route.fulfill({ json: { ...adminSummary, translationSource: "none", lines, reports: [] } });
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`/admin/videos/${VIDEO_ID}`);
  const button = page.getByRole("button", { name: "Dịch 1 dòng còn thiếu bằng AI" });
  await expect(button).toBeVisible();
  await button.click();
  await expect(page.getByRole("button", { name: /AI đang dịch/ })).toBeDisabled();
  await expect(page.getByText("Đã dịch thêm 1 dòng")).toBeVisible();
  expect(patches).toEqual([{ action: "translate_missing" }]);
  await expect(page.getByLabel("Bản dịch dòng 2")).toHaveValue("Bản AI vừa dịch.");
  await expect(page.getByRole("button", { name: /Dịch .* dòng còn thiếu bằng AI/ })).toHaveCount(0);
});

test("quản trị video: video dùng bản dịch YouTube có nút dịch lại toàn bộ bằng AI, hỏi xác nhận rồi tải lại bản dịch", async ({ page }) => {
  const patches: unknown[] = [];
  let retranslated = false;
  await page.route("**/api/admin/whoami", (route) => route.fulfill({ json: { isAdmin: true } }));
  await page.route(`**/api/admin/videos/${VIDEO_ID}`, async (route) => {
    if (route.request().method() === "PATCH") {
      patches.push(route.request().postDataJSON());
      retranslated = true;
      return route.fulfill({ json: { done: "retranslate_all", replaced: 3, remaining: 0 } });
    }
    const lines = lesson.lines.map((l) => (retranslated ? { ...l, translation: `AI dịch ${l.idx}`, translationBy: "ai" } : l));
    return route.fulfill({ json: { ...adminSummary, translationSource: retranslated ? "ai" : "youtube", lines, reports: [] } });
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`/admin/videos/${VIDEO_ID}`);
  const button = page.getByRole("button", { name: "Dịch lại toàn bộ bằng AI" });
  await button.click();
  const dialog = page.getByRole("dialog", { name: "Dịch lại toàn bộ bằng AI?" });
  await dialog.getByRole("button", { name: "Hủy" }).click();
  expect(patches).toEqual([]); // hủy thì không làm gì
  await button.click();
  await dialog.getByRole("button", { name: "Dịch lại" }).click();
  await expect(page.getByText("Đã dịch lại 3 dòng bằng AI")).toBeVisible();
  expect(patches).toEqual([{ action: "retranslate_all", includeAi: false }]);
  await expect(page.getByLabel("Bản dịch dòng 1")).toHaveValue("AI dịch 0");
  // Đã là bản AI: vẫn có nút làm lại bằng model tốt hơn, gửi includeAi để làm lại cả dòng AI cũ.
  await expect(page.getByRole("button", { name: "Dịch lại toàn bộ bằng AI" })).toHaveCount(0);
  await page.getByRole("button", { name: "Dịch lại bản AI bằng model tốt hơn" }).click();
  await dialog.getByRole("button", { name: "Dịch lại" }).click();
  await expect.poll(() => patches.length).toBe(2);
  expect(patches[1]).toEqual({ action: "retranslate_all", includeAi: true });
});

test.describe("báo cả video sai", () => {
  async function openMenu(page: Page, respond: { status?: number; json: unknown }) {
    await mockVideoApis(page);
    const bodies: unknown[] = [];
    await page.route(`**/api/videos/${VIDEO_ID}/report`, (route) => {
      bodies.push(route.request().postDataJSON());
      return route.fulfill({ status: respond.status ?? 201, json: respond.json });
    });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`/video/${VIDEO_ID}`);
    await page.getByRole("button", { name: "Báo video sai" }).click();
    return bodies;
  }

  test("chọn lý do rồi gửi: cảm ơn, nút thay bằng lời cảm ơn", async ({ page }) => {
    const bodies = await openMenu(page, { json: { ok: true } });
    const group = page.getByRole("group", { name: "Lý do báo video sai" });
    for (const label of ["Phụ đề tiếng Trung sai hoặc lệch", "Bản dịch sai nhiều", "Không phải tiếng Trung", "Nội dung không phù hợp"]) await expect(group.getByRole("button", { name: label })).toBeVisible();
    await noViolations(page);
    await group.getByRole("button", { name: "Nội dung không phù hợp" }).click();
    await expect(page.getByText("Cảm ơn bạn đã báo")).toBeVisible();
    await expect(page.getByRole("button", { name: "Báo video sai" })).toHaveCount(0);
    expect(bodies).toEqual([{ reason: "inappropriate" }]);
  });

  test("báo quá nhiều trong ngày thì báo rõ và vẫn thử lại được", async ({ page }) => {
    await openMenu(page, { status: 429, json: { error: "user_limit" } });
    await page.getByRole("button", { name: "Bản dịch sai nhiều" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Hôm nay bạn đã báo nhiều rồi" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Báo video sai" })).toBeVisible();
  });

  test("Esc đóng danh sách lý do", async ({ page }) => {
    await openMenu(page, { json: { ok: true } });
    await expect(page.getByRole("group", { name: "Lý do báo video sai" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("group", { name: "Lý do báo video sai" })).toHaveCount(0);
  });
});

test("API báo video từ chối khi chưa có phiên hoặc dữ liệu sai", async ({ request }) => {
  const res = await request.post(`/api/videos/${VIDEO_ID}/report`, { data: { reason: "khong-hop-le" } });
  expect([400, 401]).toContain(res.status());
  expect((await res.json()).error).toBeTruthy();
});

test("quản trị video: video bị báo xếp lên đầu danh sách kèm số lần bị báo", async ({ page }) => {
  await page.route("**/api/admin/whoami", (route) => route.fulfill({ json: { isAdmin: true } }));
  const other = { ...adminSummary, videoId: "zZzZzZzZzZz", title: "Video khác", openReportCount: 0 };
  await page.route("**/api/admin/videos", (route) => route.fulfill({ json: { videos: [other, { ...adminSummary, status: "hidden", openReportCount: 3 }] } }));
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/admin/videos");
  await expect(page.getByText("Bị báo 3 lần")).toBeVisible();
  await expect(page.getByRole("listitem").filter({ has: page.getByRole("link") }).first()).toContainText("Cuộc trò chuyện mẫu");
  await expect(page.getByText(/Bị báo 0 lần/)).toHaveCount(0);
});

test("quản trị video: xem báo cáo của người học theo lý do và bỏ qua báo cáo", async ({ page }) => {
  const patches: unknown[] = [];
  await page.route("**/api/admin/whoami", (route) => route.fulfill({ json: { isAdmin: true } }));
  await page.route(`**/api/admin/videos/${VIDEO_ID}`, (route) => {
    if (route.request().method() === "PATCH") { patches.push(route.request().postDataJSON()); return route.fulfill({ json: { done: "dismiss_reports", dismissed: 3 } }); }
    const videoReports = [
      { id: 1, reason: "inappropriate", createdAt: "2026-10-10T01:00:00Z", resolved: false },
      { id: 2, reason: "inappropriate", createdAt: "2026-10-10T01:05:00Z", resolved: false },
      { id: 3, reason: "not_chinese", createdAt: "2026-10-10T01:10:00Z", resolved: false },
      { id: 4, reason: "wrong_translation", createdAt: "2026-10-09T01:10:00Z", resolved: true },
    ];
    return route.fulfill({ json: { ...adminSummary, status: "hidden", lines: lesson.lines.map((l) => ({ ...l })), reports: [], videoReports } });
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`/admin/videos/${VIDEO_ID}`);
  const section = page.getByRole("region", { name: "Báo cáo video của người học" });
  await expect(section.getByText("3 báo cáo chưa xử lý từ người học")).toBeVisible();
  await expect(section.getByText("Nội dung không phù hợp: 2")).toBeVisible();
  await expect(section.getByText("Không phải tiếng Trung: 1")).toBeVisible();
  await expect(section.getByText(/Bản dịch sai nhiều/)).toHaveCount(0); // báo cáo đã xử lý không tính
  await noViolations(page);
  await section.getByRole("button", { name: "Bỏ qua báo cáo" }).click();
  await expect(section).toHaveCount(0);
  expect(patches).toEqual([{ action: "dismiss_reports" }]);
});

test.describe("huy hiệu video bị báo ở trang quản trị", () => {
  const link = (page: Page) => page.getByRole("link", { name: /Quản lý video/ });

  test("hiện số video đang bị báo cạnh mục Quản lý video", async ({ page }) => {
    await page.route("**/api/admin/whoami", (route) => route.fulfill({ json: { isAdmin: true } }));
    await page.route("**/api/admin/song-reports*", (route) => route.fulfill({ json: { items: [] } }));
    await page.route("**/api/admin/video-reports", (route) => route.fulfill({ json: { videos: 2, reports: 5 } }));
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/admin");
    await expect(link(page).getByLabel("2 video đang bị báo")).toHaveText("2");
    await noViolations(page);
  });

  test("không có video bị báo hoặc không lấy được số liệu thì không hiện huy hiệu", async ({ page }) => {
    await page.route("**/api/admin/whoami", (route) => route.fulfill({ json: { isAdmin: true } }));
    await page.route("**/api/admin/song-reports*", (route) => route.fulfill({ json: { items: [] } }));
    await page.route("**/api/admin/video-reports", (route) => route.fulfill({ json: { videos: 0, reports: 0 } }));
    await page.goto("/admin");
    await expect(link(page)).toBeVisible();
    await expect(link(page).getByLabel(/video đang bị báo/)).toHaveCount(0);
    await page.unroute("**/api/admin/video-reports");
    await page.route("**/api/admin/video-reports", (route) => route.fulfill({ status: 403, json: { error: "forbidden" } }));
    await page.reload();
    await expect(link(page)).toBeVisible();
    await expect(link(page).getByLabel(/video đang bị báo/)).toHaveCount(0);
  });
});

// ---- Luyện nói theo (shadowing) ----
// Micro và nhận dạng giọng nói giả: bản ghi là một mẩu byte, nhận dạng "nghe" ra đúng câu mẫu thứ nhất.
const FAKE_MIC = `navigator.mediaDevices.getUserMedia = async function () { return { getTracks: function () { return [{ stop: function () {} }]; } }; };
window.MediaRecorder = class { constructor() { this.mimeType = 'audio/webm'; }
  start() {} stop() { this.ondataavailable({ data: new Blob(['x'], { type: 'audio/webm' }) }); this.onstop(); } };
window.MediaRecorder.isTypeSupported = function () { return true; };
window.SpeechRecognition = class { start() { var self = this; setTimeout(function () { self.onresult({ resultIndex: 0, results: [{ isFinal: true, 0: { transcript: '你好朋友' } }] }); }, 20); } stop() { if (this.onend) this.onend(); } };`;

test("luyện nói: bắt đầu lượt (nghe mẫu rồi tự ghi âm), chấm sơ bộ, nghe lại giọng mình; ẩn bớt chữ; sang câu khác thì bỏ kết quả", async ({ page }) => {
  await mockVideoApis(page);
  await page.addInitScript(FAKE_MIC);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`/video/${VIDEO_ID}?tab=shadowing`);
  await expect(page.getByText("/ 3", { exact: false }).first()).toBeVisible();
  await expect(page.locator('section[aria-label="Câu đang luyện"] ruby').first()).toBeVisible();
  await noViolations(page);

  // Ẩn chữ Hán và pinyin: chỉ còn lời nhắc nghe.
  await page.getByRole("button", { name: "Chữ Hán" }).click();
  await page.getByRole("button", { name: "Pinyin", exact: true }).click();
  await expect(page.getByText("Đã ẩn chữ, hãy nghe thật kỹ rồi nói theo.")).toBeVisible();
  await page.getByRole("button", { name: "Chữ Hán" }).click();
  await page.getByRole("button", { name: "Pinyin", exact: true }).click();

  await page.getByRole("button", { name: "Bắt đầu lượt" }).click();
  expect(await page.evaluate(() => (window as unknown as { __yt: string[] }).__yt)).toContain("seek:0");
  await page.evaluate(() => { (window as unknown as { __t: number }).__t = 4; }); // hết câu mẫu : tự chuyển sang ghi âm
  await expect(page.getByRole("button", { name: /^Đang ghi/ })).toBeVisible();
  await expect(page.getByText("你好朋友").first()).toBeVisible(); // chữ máy đang nghe
  await page.getByRole("button", { name: /^Dừng/ }).click();
  await expect(page.getByLabel("Điểm 100")).toBeVisible();
  await expect(page.getByText("Máy nghe được: 你好朋友")).toBeVisible();
  await expect(page.getByRole("button", { name: "Nghe giọng mình" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Mẫu → mình" })).toBeVisible();

  await page.getByRole("button", { name: "Sau →" }).click();
  await expect(page.getByText("Câu 2")).toBeVisible();
  await expect(page.getByRole("list", { name: "Các lần nói gần đây" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "← Trước" })).toBeEnabled();
});

test("luyện nói: trình duyệt không có nhận dạng giọng nói thì báo rõ và vẫn ghi âm được", async ({ page }) => {
  await mockVideoApis(page);
  await page.addInitScript(FAKE_MIC.replace(/window\.SpeechRecognition = [\s\S]*$/, "delete window.SpeechRecognition; delete window.webkitSpeechRecognition;"));
  await page.goto(`/video/${VIDEO_ID}?tab=shadowing`);
  await expect(page.getByText("không có nhận dạng giọng nói")).toBeVisible();
  await page.getByRole("button", { name: "Tự ghi âm" }).click();
  await page.getByRole("button", { name: /^Dừng/ }).click();
  await expect(page.getByRole("button", { name: "Nghe giọng mình" })).toBeVisible();
});

test("luyện nói: nhận dạng giọng nói của trình duyệt lỗi mạng thì giải thích lý do và gợi ý nhờ AI, không đổ lỗi cho người nói", async ({ page }) => {
  await mockVideoApis(page);
  await page.addInitScript(FAKE_MIC.replace(/window\.SpeechRecognition = [\s\S]*$/, "window.SpeechRecognition = class { start() { var self = this; setTimeout(function () { self.onerror({ error: 'network' }); }, 20); } stop() { if (this.onend) this.onend(); } };"));
  await page.goto(`/video/${VIDEO_ID}?tab=shadowing`);
  await page.getByRole("button", { name: "Tự ghi âm" }).click();
  await page.getByRole("button", { name: /^Dừng/ }).click();
  await expect(page.getByText("không kết nối được dịch vụ nhận dạng giọng nói")).toBeVisible();
  await expect(page.getByText("Thử nói to và rõ hơn")).toHaveCount(0);
});

// Giải mã/ghi lại âm thanh giả: bản ghi giả (một byte) không giải mã được thật, nên thay AudioContext để luồng "Nhờ AI nhận xét" chạy tới bước gọi API.
const FAKE_AUDIO_DECODE = `window.AudioContext = class { decodeAudioData() { return Promise.resolve({ duration: 1 }); } close() { return Promise.resolve(); } };
window.OfflineAudioContext = class { constructor() { this.destination = {}; }
  createBufferSource() { return { connect() {}, start() {} }; }
  startRendering() { return Promise.resolve({ getChannelData: function () { return new Float32Array(1600); } }); } };`;

test("luyện nói: nhờ AI nhận xét giọng gửi WAV base64 lên API và hiện điểm, lỗi cần sửa, chữ AI nghe được", async ({ page }) => {
  await mockVideoApis(page);
  await page.addInitScript(FAKE_MIC);
  await page.addInitScript(FAKE_AUDIO_DECODE);
  let body: { videoId: string; lineIndex: number; mimeType: string; audio: string } | null = null;
  await page.route("**/api/pronunciation-feedback", async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({ json: { heard: "你好朋友", score: 72, summary: "Bạn đọc khá rõ, chú ý thanh 3.", issues: [{ word: "好", problem: "thanh 3 đọc thành thanh 1", tip: "hạ giọng rồi lên" }], model: "gemini-flash-lite-latest" } });
  });
  await page.goto(`/video/${VIDEO_ID}?tab=shadowing`);
  await page.getByRole("button", { name: "Tự ghi âm" }).click();
  await page.getByRole("button", { name: /^Dừng/ }).click();
  await expect(page.getByText("gửi đúng lần ghi âm đó sang AI để nghe và nhận xét")).toBeVisible();
  await page.getByRole("button", { name: "Nhờ AI nhận xét" }).click();
  const feedback = page.getByLabel("Nhận xét của AI");
  await expect(feedback).toContainText("72/100");
  await expect(feedback).toContainText("Bạn đọc khá rõ, chú ý thanh 3.");
  await expect(feedback).toContainText("thanh 3 đọc thành thanh 1");
  await expect(feedback).toContainText("AI nghe được: 你好朋友");
  expect(body).toMatchObject({ videoId: VIDEO_ID, lineIndex: 0, mimeType: "audio/wav" });
  expect(body!.audio.length).toBeGreaterThan(100);
  await expect(page.getByRole("button", { name: "Nhờ AI nhận xét" })).toHaveCount(0);
});

test("luyện nói: nhận xét giọng hết hạn mức thì báo rõ và cho bấm lại", async ({ page }) => {
  await mockVideoApis(page);
  await page.addInitScript(FAKE_MIC);
  await page.addInitScript(FAKE_AUDIO_DECODE);
  await page.route("**/api/pronunciation-feedback", (route) => route.fulfill({ status: 429, json: { error: "rate_limited" } }));
  await page.goto(`/video/${VIDEO_ID}?tab=shadowing`);
  await page.getByRole("button", { name: "Tự ghi âm" }).click();
  await page.getByRole("button", { name: /^Dừng/ }).click();
  await page.getByRole("button", { name: "Nhờ AI nhận xét" }).click();
  await expect(page.getByText("mai thử lại nhé")).toBeVisible();
  await expect(page.getByRole("button", { name: "Nhờ AI nhận xét" })).toBeEnabled();
});

test("tab Phụ đề: hỏi AI về một câu, gửi kèm lượt hỏi trước và hiện câu trả lời; hết hạn mức thì báo", async ({ page }) => {
  await mockVideoApis(page);
  const bodies: { videoId: string; lineIndex: number; question: string; history?: { q: string; a: string }[] }[] = [];
  await page.route("**/api/ask-line", async (route) => {
    const b = route.request().postDataJSON();
    bodies.push(b);
    if (b.question.includes("quá nhiều")) return route.fulfill({ status: 429, json: { error: "rate_limited" } });
    await route.fulfill({ json: { answer: `Trả lời cho: ${b.question} **đậm**\n- **好** (hǎo): tốt\n- **了** (le): trợ từ`, model: "gemini-flash-lite-latest" } });
  });
  await page.goto(`/video/${VIDEO_ID}`);
  await page.getByRole("button", { name: "Hỏi AI về câu 1" }).click();
  const dialog = page.getByRole("dialog", { name: /Hỏi AI về câu/ });
  await dialog.getByPlaceholder(/Hỏi thêm/).fill("Vì sao dùng 好?");
  await dialog.getByRole("button", { name: "Hỏi", exact: true }).click();
  await expect(dialog.getByText("Trả lời cho: Vì sao dùng 好?")).toBeVisible();
  await dialog.getByPlaceholder(/Hỏi thêm/).fill("Còn câu sau thì sao?");
  await dialog.getByRole("button", { name: "Hỏi", exact: true }).click();
  await expect(dialog.getByText("Trả lời cho: Còn câu sau thì sao?")).toBeVisible();
  expect(bodies[0]).toMatchObject({ videoId: VIDEO_ID, lineIndex: 0, question: "Vì sao dùng 好?", history: [] });
  expect(bodies[1].history).toEqual([{ q: "Vì sao dùng 好?", a: "Trả lời cho: Vì sao dùng 好? **đậm**\n- **好** (hǎo): tốt\n- **了** (le): trợ từ" }]);
  await expect(dialog.locator("strong").first()).toHaveText("đậm"); // **đậm** được in đậm, không hiện ký hiệu
  await expect(dialog).not.toContainText("**");
  await expect(dialog.locator("ul.list-disc li").first()).toContainText("好 (hǎo): tốt"); // dòng gạch đầu dòng thành danh sách
  await dialog.getByPlaceholder(/Hỏi thêm/).fill("hỏi quá nhiều rồi");
  await dialog.getByRole("button", { name: "Hỏi", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("mai hỏi tiếp nhé");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("luyện nói: chỉnh đầu/cuối đoạn nghe theo từng câu, phát lại ngay đoạn vừa chỉnh, nhớ sau khi tải lại và đặt lại được", async ({ page }) => {
  await mockVideoApis(page);
  await page.addInitScript(FAKE_MIC);
  await page.goto(`/video/${VIDEO_ID}?tab=shadowing`);
  await page.getByText("Đoạn nghe bị lệch", { exact: false }).click();
  await page.getByRole("button", { name: "Nghe mẫu" }).click();
  const seeks = () => page.evaluate(() => (window as unknown as { __yt: string[] }).__yt.filter((e) => e.startsWith("seek:")));
  expect((await seeks()).at(-1)).toBe("seek:0");
  await page.getByRole("button", { name: "Bắt đầu muộn hơn 0,1 giây" }).click();
  await expect(page.getByRole("group", { name: "Đầu đoạn" })).toContainText("+0,1s");
  expect(Number((await seeks()).at(-1)!.split(":")[1])).toBeCloseTo(0.1, 2); // phát lại từ mốc đã chỉnh (câu bắt đầu ở 0, chỉnh +0,1)
  await page.getByRole("button", { name: "Kết thúc muộn hơn 0,1 giây" }).click();
  await expect(page.getByRole("group", { name: "Cuối đoạn" })).toContainText("+0,1s");
  await page.reload();
  await expect(page.getByText("đã chỉnh")).toBeVisible();
  await expect(page.getByRole("group", { name: "Đầu đoạn" })).toContainText("+0,1s");
  await page.getByRole("button", { name: "Đặt lại" }).click();
  await expect(page.getByText("đã chỉnh")).toHaveCount(0);
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
