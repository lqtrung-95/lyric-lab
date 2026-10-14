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
const tags = (page: Page) => page.getByRole("group", { name: "Lọc theo chủ đề" });
const cards = (page: Page) => page.locator("ul a[href^='/video/']");

test("hàng nút chủ đề chỉ gồm thẻ có video, kèm số lượng; chọn thẻ chỉ còn video của thẻ, chọn lại để bỏ lọc", async ({ page }) => {
  await open(page, VIDEOS);
  const group = tags(page);
  await expect(group.getByRole("button", { name: "Mọi chủ đề" })).toHaveAttribute("aria-pressed", "true");
  await expect(group.getByRole("button", { name: /Hoạt hình/ })).toContainText("2");
  await expect(group.getByRole("button", { name: /Vlog/ })).toContainText("2");
  await expect(group.getByRole("button", { name: /Podcast/ })).toHaveCount(0); // thẻ không có video bị ẩn
  expect((await new AxeBuilder({ page }).analyze()).violations.filter((x) => ["serious", "critical"].includes(x.impact ?? ""))).toEqual([]);

  await group.getByRole("button", { name: /Vlog/ }).click();
  await expect(cards(page)).toHaveCount(2);
  await expect(page.getByRole("link", { name: /Bài aaaaaaaaaa1/ })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Bài cccccccccc1/ })).toHaveCount(0); // video chưa có thẻ chỉ ở "Mọi chủ đề"
  await group.getByRole("button", { name: /Vlog/ }).click();
  await expect(cards(page)).toHaveCount(5);
});

test("thẻ kết hợp với cấp HSK: số video theo cấp tính trên phần đã lọc thẻ", async ({ page }) => {
  await open(page, VIDEOS);
  await tags(page).getByRole("button", { name: /Hoạt hình/ }).click();
  const level = page.getByRole("group", { name: "Lọc theo cấp HSK" });
  await expect(level.getByRole("button", { name: /^Tất cả/ })).toContainText("2");
  await level.getByRole("button", { name: /HSK 3/ }).click();
  await expect(cards(page)).toHaveCount(1);
  await expect(page.getByRole("link", { name: /Bài aaaaaaaaaa2/ })).toBeVisible();
});

test("trang kênh cũng có bộ lọc chủ đề, chỉ tính video của kênh đó", async ({ page }) => {
  await open(page, VIDEOS, `/video/kenh/${encodeURIComponent("Kênh B")}`);
  const group = tags(page);
  await expect(group.getByRole("button", { name: /Vlog/ })).toContainText("2");
  await expect(group.getByRole("button", { name: /Hoạt hình/ })).toHaveCount(0); // thẻ của kênh khác không hiện
  await group.getByRole("button", { name: /Du lịch/ }).click();
  await expect(cards(page)).toHaveCount(1);
});

test("API chưa có thẻ (migration chưa chạy): không hiện hàng nút chủ đề, danh sách vẫn bình thường", async ({ page }) => {
  await open(page, VIDEOS.map((x) => Object.fromEntries(Object.entries(x).filter(([k]) => k !== "tags"))));
  await expect(page.getByRole("link", { name: /Bài aaaaaaaaaa1/ })).toBeVisible();
  await expect(tags(page)).toHaveCount(0);
});
