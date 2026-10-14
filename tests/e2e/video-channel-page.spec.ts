import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Trang Video chỉ hiện vài video đầu mỗi kênh kèm thẻ "Xem tất cả"; bấm sang trang riêng của kênh để xem hết. API giả lập.
const BIG = "DaihuaXiyou 呆話西遊";
const v = (id: string, channelTitle: string, levelAvg: number) => ({ videoId: id, title: `Bài ${id}`, channelTitle, durationSec: 120, levelAvg, lineCount: 10 });
const VIDEOS = [
  ...["a1", "a2", "a3", "a4", "a5", "a6"].map((n, i) => v(`aaaaaaaaa${n}`, BIG, i < 4 ? 1.5 : 4)),
  v("bbbbbbbbbb1", "Kênh nhỏ", 2), v("bbbbbbbbbb2", "Kênh nhỏ", 2),
];

async function open(page: Page, path = "/video") {
  await page.route("**/api/videos", (r) => r.fulfill({ json: { videos: VIDEOS } }));
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(path);
}

test("trang Video: kênh nhiều video chỉ hiện 4 video đầu và thẻ Xem tất cả; kênh ít video hiện đủ, không có thẻ", async ({ page }) => {
  await open(page);
  const big = page.getByRole("region", { name: `Kênh ${BIG}` });
  await expect(big.locator("a[href^='/video/aaaaaaaaa']")).toHaveCount(4);
  const seeAll = big.getByRole("link", { name: /Xem tất cả 6 video/ });
  await expect(seeAll).toContainText("6 bài học");
  const small = page.getByRole("region", { name: "Kênh Kênh nhỏ" });
  await expect(small.locator("a[href^='/video/bbbbbbbbbb']")).toHaveCount(2);
  await expect(small.getByRole("link", { name: /Xem tất cả/ })).toHaveCount(0);
  expect((await new AxeBuilder({ page }).analyze()).violations.filter((x) => ["serious", "critical"].includes(x.impact ?? ""))).toEqual([]);
});

test("bấm Xem tất cả: sang trang kênh liệt kê đủ video, có lọc theo cấp, và quay lại được", async ({ page }) => {
  await open(page);
  await page.getByRole("region", { name: `Kênh ${BIG}` }).getByRole("link", { name: /Xem tất cả 6 video/ }).click();
  await expect(page).toHaveURL(/\/video\/kenh\/Daihua/);
  await expect(page.getByRole("heading", { level: 1, name: BIG })).toBeVisible();
  await expect(page.getByText("6 bài học")).toBeVisible();
  await expect(page.locator("a[href^='/video/aaaaaaaaa']")).toHaveCount(6);
  await expect(page.locator("a[href^='/video/bbbbbbbbbb']")).toHaveCount(0); // không lẫn video kênh khác
  await expect(page.getByRole("button", { name: "Nhóm theo kênh" })).toHaveCount(0);
  await page.getByLabel("Cấp độ").selectOption({ label: "HSK 4 (2)" });
  await expect(page.locator("a[href^='/video/aaaaaaaaa']")).toHaveCount(2);
  await page.getByRole("link", { name: "← Tất cả video" }).click();
  await expect(page).toHaveURL(/\/video$/);
});

test("mở thẳng địa chỉ kênh (tên có chữ Hán và khoảng trắng); kênh không tồn tại báo rõ", async ({ page }) => {
  await open(page, `/video/kenh/${encodeURIComponent(BIG)}`);
  await expect(page.getByRole("heading", { level: 1, name: BIG })).toBeVisible();
  await expect(page.locator("a[href^='/video/aaaaaaaaa']")).toHaveCount(6);
  await page.goto(`/video/kenh/${encodeURIComponent("Kênh không có")}`);
  await expect(page.getByText("Không có video nào của kênh này")).toBeVisible();
});
