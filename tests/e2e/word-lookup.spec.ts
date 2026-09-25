import { expect, test, type Page } from "@playwright/test";

// Tra từ bấm trong lời (LS-06) trên dữ liệu hư cấu "夜车". API tra từ và giải nghĩa được giả lập.
const STUB = `window.__yt = []; window.YT = { PlayerState: { PLAYING: 1 }, Player: function (el, opts) {
  el.replaceWith(document.createElement('div'));
  setTimeout(function () { opts.events.onReady({ target: {
    seekTo: function (s) { window.__yt.push('seek:' + s); }, playVideo: function () {}, pauseVideo: function () {},
    setPlaybackRate: function () {}, getCurrentTime: function () { return 0; }, getPlayerState: function () { return 1; } } }); }, 0);
  this.destroy = function () {}; } };
window.onYouTubeIframeAPIReady && window.onYouTubeIframeAPIReady();`;

const ENTRY = { entry: { term: "慢慢", traditional: "慢慢", pinyin: "màn màn", sinoViet: "mạn mạn", hskLevel: 4, meanings: ["slowly", "gradually"] } };
const MEANING = { meaningInContext: "dần dần, từ từ", note: "Trạng từ lặp lại", model: "test", fromCache: false };

interface Mocks { explainCalls: number; lookupCalls: number }

async function setup(page: Page, opts: { explainStatus?: number; explainDelayMs?: number } = {}): Promise<Mocks> {
  const mocks: Mocks = { explainCalls: 0, lookupCalls: 0 };
  await page.route("https://www.youtube.com/iframe_api", (r) => r.fulfill({ contentType: "text/javascript", body: STUB }));
  await page.route("**/api/lookup**", (r) => { mocks.lookupCalls++; return r.fulfill({ json: ENTRY }); });
  await page.route("**/api/explain", async (r) => {
    mocks.explainCalls++;
    if (opts.explainDelayMs) await new Promise((res) => setTimeout(res, opts.explainDelayMs));
    return r.fulfill(opts.explainStatus ? { status: opts.explainStatus, json: { error: "x" } } : { json: MEANING });
  });
  await page.goto("/dev/listen-fixture");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  return mocks;
}

const word = (page: Page, text: string) => page.locator('[data-line-index="0"]').getByRole("button", { name: text, exact: true });
const dialog = (page: Page) => page.getByRole("dialog");

test("từ nằm trong danh sách học: hiện ngay dữ liệu có sẵn, không gọi mạng", async ({ page }) => {
  const mocks = await setup(page);
  await page.locator('[data-line-index="0"]').getByRole("button", { name: /城市/ }).click();
  await expect(dialog(page)).toContainText("chéng shì");
  await expect(dialog(page)).toContainText("THÀNH THỊ".toLowerCase(), { ignoreCase: true });
  await expect(dialog(page)).toContainText("thành phố");
  expect(mocks.explainCalls + mocks.lookupCalls).toBe(0);
});

test("từ ngoài danh sách: từ điển hiện trước, nghĩa theo ngữ cảnh hiện sau khi có", async ({ page }) => {
  await setup(page, { explainDelayMs: 600 });
  await word(page, "慢慢").click();
  await expect(dialog(page)).toContainText("màn màn");
  await expect(dialog(page)).toContainText("slowly");
  await expect(dialog(page).getByRole("status", { name: "Đang giải nghĩa" })).toBeVisible();
  await expect(dialog(page)).toContainText("dần dần, từ từ");
  await expect(dialog(page).getByRole("status", { name: "Đang giải nghĩa" })).toHaveCount(0);
});

test("bấm từ không nhảy video; bấm câu thì nhảy; bấm lại từ đã tra không gọi lại mạng", async ({ page }) => {
  const mocks = await setup(page);
  await word(page, "慢慢").click();
  await expect(dialog(page)).toContainText("dần dần");
  expect(await page.evaluate(() => (window as unknown as { __yt: string[] }).__yt)).not.toContain("seek:0");
  await dialog(page).getByRole("button", { name: "Đóng" }).click();
  await word(page, "慢慢").click();
  await expect(dialog(page)).toContainText("dần dần");
  expect(mocks.explainCalls).toBe(1);
  // Dòng nằm dưới video dính/popover nên bấm bằng sự kiện trực tiếp thay vì bấm theo tọa độ.
  await page.locator('[data-line-index="3"]').dispatchEvent("click");
  expect(await page.evaluate(() => (window as unknown as { __yt: string[] }).__yt)).toContain("seek:15");
});

test("Esc đóng popover và trả focus về từ vừa bấm", async ({ page }) => {
  await setup(page);
  const w = word(page, "慢慢");
  await w.click();
  await expect(dialog(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toHaveCount(0);
  await expect(w).toBeFocused();
});

test("hết lượt giải nghĩa: báo rõ, vẫn còn phần từ điển", async ({ page }) => {
  await setup(page, { explainStatus: 429 });
  await word(page, "慢慢").click();
  await expect(dialog(page)).toContainText("mai thử lại");
  await expect(dialog(page)).toContainText("slowly");
});

test("lưu từ trong popover, được nhớ sau khi tải lại", async ({ page }) => {
  await setup(page);
  await word(page, "慢慢").click();
  await expect(dialog(page)).toContainText("dần dần");
  const save = dialog(page).getByRole("button", { name: /^(Lưu|Đã lưu)$/ });
  await save.click();
  await expect(save).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await word(page, "慢慢").click();
  await expect(dialog(page).getByRole("button", { name: "Đã lưu" })).toHaveAttribute("aria-pressed", "true");
});
