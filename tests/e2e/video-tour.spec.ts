import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { stubYouTube } from "./helpers/youtube-stub";

// Hướng dẫn lần đầu ở trang xem video (dữ liệu mẫu hư cấu; API giả lập). Tự mở một lần ở tab Phụ đề; các test khác không bị che vì hướng dẫn tắt khi chạy bằng trình duyệt tự động hoá.
const VIDEO_ID = "aBcDeFgHiJk";
const lesson = {
  videoId: VIDEO_ID, title: "Cuộc trò chuyện mẫu", channelTitle: "Kênh thử", durationSec: 90, levelAvg: 1.5, lineCount: 3, translationSource: "ai", transcriptSource: "captions",
  lines: [
    { idx: 0, start: 0, end: 4, text: "你好，朋友。", pinyin: "nǐ hǎo ， péng you 。", translation: "Xin chào, bạn bè.", tokens: [{ text: "你好" }, { text: "，" }, { text: "朋友" }, { text: "。" }] },
    { idx: 1, start: 4, end: 8, text: "今天天气很好。", pinyin: "jīn tiān tiān qì hěn hǎo 。", translation: "Hôm nay thời tiết đẹp.", tokens: [{ text: "今天" }, { text: "天气" }, { text: "很" }, { text: "好" }, { text: "。" }] },
    { idx: 2, start: 8, end: 12, text: "我们去公园吧。", pinyin: "wǒ men qù gōng yuán ba 。", translation: "Chúng ta đi công viên nhé.", tokens: [{ text: "我们" }, { text: "去" }, { text: "公园" }, { text: "吧" }, { text: "。" }] },
  ],
};
const forceTour = (page: Page) => page.addInitScript(() => { (window as unknown as { __forceVideoTour: boolean }).__forceVideoTour = true; });
const tourDialog = (page: Page) => page.getByRole("dialog", { name: /Phụ đề từng câu|Ba cách học một video|Pinyin và bản dịch|Tốc độ, lặp câu, ghim|Lưu video yêu thích/ });

async function setup(page: Page) {
  await stubYouTube(page);
  await page.route("**/api/practice/video", (r) => r.fulfill({ json: { ok: true } }));
  await page.route("**/api/chat/me", (r) => r.fulfill({ json: { registered: true } }));
  await page.route(`**/api/videos/${VIDEO_ID}`, (r) => r.fulfill({ json: lesson }));
}

/** Đi hết các bước đang hiện bằng "Tiếp" tới "Xong"; mỗi thẻ phải nằm trọn trong màn hình. Trả danh sách tiêu đề các bước đã đi qua. */
async function walkThrough(page: Page): Promise<string[]> {
  const seen: string[] = [];
  for (let i = 0; i < 8; i++) {
    const dialog = tourDialog(page);
    await expect(dialog).toBeVisible();
    seen.push((await dialog.locator("h2").textContent()) ?? "");
    const box = (await dialog.boundingBox())!;
    const viewport = page.viewportSize()!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    const last = await dialog.getByRole("button", { name: "Xong" }).count();
    await dialog.getByRole("button", { name: last ? "Xong" : "Tiếp" }).click();
    if (last) break;
  }
  await expect(tourDialog(page)).toHaveCount(0);
  return seen;
}

test.describe("máy tính", () => {
  test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 1280, height: 900 }); });

  test("tự hiện ở lần xem đầu, đi qua đủ 5 bước (không axe lỗi), rồi không hiện lại sau khi tải lại", async ({ page }) => {
    await forceTour(page);
    await setup(page);
    await page.goto(`/video/${VIDEO_ID}`);
    await expect(page.getByRole("dialog", { name: "Phụ đề từng câu" })).toBeVisible({ timeout: 8000 });
    expect((await new AxeBuilder({ page }).include('[role="dialog"]').analyze()).violations).toEqual([]);
    const seen = await walkThrough(page);
    expect(seen).toEqual(["Phụ đề từng câu", "Ba cách học một video", "Pinyin và bản dịch", "Tốc độ, lặp câu, ghim", "Lưu video yêu thích"]);
    await page.reload();
    await page.waitForTimeout(2500);
    await expect(tourDialog(page)).toHaveCount(0);
  });

  test("Bỏ qua và Esc đều đóng và ghi nhớ; nút Hướng dẫn mở lại", async ({ page }) => {
    await forceTour(page);
    await setup(page);
    await page.goto(`/video/${VIDEO_ID}`);
    await expect(tourDialog(page)).toBeVisible({ timeout: 8000 });
    await page.getByRole("button", { name: "Bỏ qua" }).click();
    await expect(tourDialog(page)).toHaveCount(0);
    await page.reload();
    await page.waitForTimeout(2500);
    await expect(tourDialog(page)).toHaveCount(0);
    await page.getByRole("button", { name: "Xem hướng dẫn trang xem video" }).click();
    await expect(page.getByRole("dialog", { name: "Phụ đề từng câu" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(tourDialog(page)).toHaveCount(0);
  });

  test("không tự mở khi chạy bằng trình duyệt tự động hoá (không che các test khác)", async ({ page }) => {
    await setup(page);
    await page.goto(`/video/${VIDEO_ID}`);
    await page.waitForTimeout(2500);
    await expect(tourDialog(page)).toHaveCount(0);
  });

  test("ở tab Nghe – chép không tự mở; bấm nút Hướng dẫn thì mở và lược bước phụ đề (không có đích)", async ({ page }) => {
    await forceTour(page);
    await setup(page);
    await page.goto(`/video/${VIDEO_ID}/dictation`);
    await page.waitForTimeout(2500);
    await expect(tourDialog(page)).toHaveCount(0);
    await page.getByRole("button", { name: "Xem hướng dẫn trang xem video" }).click();
    await expect(page.getByRole("dialog", { name: "Ba cách học một video" })).toBeVisible();
    await expect(page.getByRole("dialog", { name: "Phụ đề từng câu" })).toHaveCount(0);
  });
});

test.describe("điện thoại", () => {
  test("tự hiện, mọi thẻ nằm trong màn hình và đi hết được", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 780 });
    await forceTour(page);
    await setup(page);
    await page.goto(`/video/${VIDEO_ID}`);
    await expect(page.getByRole("dialog", { name: "Phụ đề từng câu" })).toBeVisible({ timeout: 8000 });
    const seen = await walkThrough(page);
    expect(seen[0]).toBe("Phụ đề từng câu");
    expect(seen).toContain("Ba cách học một video");
  });
});
