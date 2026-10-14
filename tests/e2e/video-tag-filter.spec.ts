import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Lọc video theo thẻ chủ đề (hoạt hình, vlog...) ở trang Video và trang kênh. API giả lập; thẻ chỉ hiện khi API có trả `tags`.
const v = (id: string, channelTitle: string, levelAvg: number, tags?: string[]) => ({ videoId: id, title: `Bài ${id}`, channelTitle, durationSec: 120, levelAvg, lineCount: 10, ...(tags ? { tags } : {}) });
const VIDEOS = [
  v("aaaaaaaaaa1", "Kênh A", 1.5, ["hoat-hinh", "hai"]), v("aaaaaaaaaa2", "Kênh A", 3, ["hoat-hinh"]),
  v("bbbbbbbbbb1", "Kênh B", 3, ["vlog", "du-lich"]), v("bbbbbbbbbb2", "Kênh B", 4, ["vlog"]), v("cccccccccc1", "Kênh C", 2),
];

async function open(page: Page, videos: unknown[], path = "/video") {
  await page.route("**/api/videos", (r) => r.fulfill({ json: { videos } }));
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(path);
}
const tagSelect = (page: Page) => page.getByLabel("Chủ đề");
const tagOptions = (page: Page) => tagSelect(page).locator("option").allTextContents();
const cards = (page: Page) => page.locator("ul a[href^='/video/']");

test("ô Chủ đề chỉ gồm thẻ có video, kèm số lượng; chọn thẻ chỉ còn video của thẻ, chọn lại Mọi chủ đề để bỏ lọc", async ({ page }) => {
  await open(page, VIDEOS);
  await expect(tagSelect(page)).toHaveValue("");
  await expect(page.getByRole("link", { name: /Bài aaaaaaaaaa1/ })).toBeVisible();
  const options = await tagOptions(page);
  expect(options).toEqual(expect.arrayContaining(["Mọi chủ đề", "Hoạt hình (2)", "Vlog (2)"]));
  expect(options.some((o) => o.startsWith("Podcast"))).toBe(false); // thẻ không có video bị ẩn
  expect((await new AxeBuilder({ page }).analyze()).violations.filter((x) => ["serious", "critical"].includes(x.impact ?? ""))).toEqual([]);

  await tagSelect(page).selectOption({ label: "Vlog (2)" });
  await expect(cards(page)).toHaveCount(2);
  await expect(page.getByRole("link", { name: /Bài aaaaaaaaaa1/ })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Bài cccccccccc1/ })).toHaveCount(0); // video chưa có thẻ chỉ ở "Mọi chủ đề"
  await tagSelect(page).selectOption("");
  await expect(cards(page)).toHaveCount(5);
});

test("thẻ kết hợp với cấp HSK: số video theo cấp tính trên phần đã lọc thẻ", async ({ page }) => {
  await open(page, VIDEOS);
  await expect(tagSelect(page)).toBeVisible();
  await tagSelect(page).selectOption({ label: "Hoạt hình (2)" });
  const level = page.getByLabel("Cấp độ");
  expect((await level.locator("option").allTextContents())[0]).toBe("Tất cả cấp (2)");
  await level.selectOption({ label: "HSK 3 (1)" });
  await expect(cards(page)).toHaveCount(1);
  await expect(page.getByRole("link", { name: /Bài aaaaaaaaaa2/ })).toBeVisible();
});

test("trang kênh cũng có ô chủ đề, chỉ tính video của kênh đó", async ({ page }) => {
  await open(page, VIDEOS, `/video/kenh/${encodeURIComponent("Kênh B")}`);
  await expect(tagSelect(page)).toBeVisible(); // đợi danh sách video tải xong rồi mới đọc các lựa chọn
  const options = await tagOptions(page);
  expect(options).toEqual(expect.arrayContaining(["Vlog (2)", "Du lịch (1)"]));
  expect(options.some((o) => o.startsWith("Hoạt hình"))).toBe(false); // thẻ của kênh khác không hiện
  await tagSelect(page).selectOption({ label: "Du lịch (1)" });
  await expect(cards(page)).toHaveCount(1);
});

test("API chưa có thẻ (migration chưa chạy): không có ô Chủ đề, danh sách vẫn bình thường", async ({ page }) => {
  await open(page, VIDEOS.map((x) => Object.fromEntries(Object.entries(x).filter(([k]) => k !== "tags"))));
  await expect(page.getByRole("link", { name: /Bài aaaaaaaaaa1/ })).toBeVisible();
  await expect(tagSelect(page)).toHaveCount(0);
});
