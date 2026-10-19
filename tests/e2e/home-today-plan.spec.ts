import { expect, test, type Page } from "@playwright/test";

// "Lộ trình hôm nay" ở trang chủ: việc 1 (ôn thẻ) và việc 2 (một video/bài hát vừa sức, hoặc tiếp tục bài nghe dở). API giả lập.
const v = (id: string, title: string, levelAvg: number | null) => ({ videoId: id, title, channelTitle: "Kênh", durationSec: 600, levelAvg, lineCount: 10 });

async function mock(page: Page, opts: { videos?: unknown[]; songs?: unknown[]; library?: unknown[] }) {
  await page.route("**/api/videos", (r) => r.fulfill({ json: { videos: opts.videos ?? [] } }));
  await page.route("**/api/library/songs", (r) => r.fulfill({ json: { songs: opts.library ?? [] } }));
  await page.route("**/api/discover**", (r) => r.fulfill({ json: { songs: opts.songs ?? [], hasMore: false } }));
  await page.setViewportSize({ width: 1280, height: 900 });
}

test("gợi ý video cùng dải level của người dùng (mặc định HSK 1), không nhắc lại số thẻ cần ôn", async ({ page }) => {
  await mock(page, { videos: [v("aaaaaaaaaa1", "Video khó", 5.2), v("aaaaaaaaaa2", "Video dễ", 1.6)] });
  await page.goto("/app");
  const plan = page.getByRole("region", { name: "Gợi ý học hôm nay" });
  await expect(plan.getByText("Video dễ")).toBeVisible();
  await expect(plan.getByText("Video · HSK ~1.6")).toBeVisible();
  await expect(plan.getByRole("link", { name: "Bắt đầu" })).toHaveAttribute("href", "/video/aaaaaaaaaa2");
  await expect(plan.getByText(/thẻ đến hạn|thẻ cần ôn/)).toHaveCount(0);
});

test("có bài đang nghe dở thì chỉ bảng Hôm nay nhắc tiếp tục nghe, mục gợi ý không trùng", async ({ page }) => {
  const progress = { videoId: "bbbbbbbbbb1", title: "Bài nghe dở", durationSec: 200, lastPositionSec: 60, completed: false, updatedAt: new Date().toISOString() };
  await mock(page, { videos: [v("aaaaaaaaaa2", "Video dễ", 1.6)], library: [progress] });
  await page.goto("/app");
  await expect(page.getByRole("link", { name: "Tiếp tục nghe" })).toHaveCount(1);
  await expect(page.getByRole("region", { name: "Gợi ý học hôm nay" }).getByText("Bài nghe dở")).toHaveCount(0);
});

test("không có video và bài gợi ý nào thì không hiện mục gợi ý, không lỗi", async ({ page }) => {
  await mock(page, {});
  await page.goto("/app");
  await expect(page.getByRole("heading", { name: "Học từ bất kỳ bài hát nào" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Gợi ý học hôm nay" })).toHaveCount(0);
});
