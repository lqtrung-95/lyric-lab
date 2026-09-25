import { expect, test } from "@playwright/test";
import { stubYouTube } from "./helpers/youtube-stub";
import { E2E_VIDEO_ID, hasSupabaseEnv, removeFixtureSong, seedFixtureSong } from "./helpers/seed-analysis";

// Luồng đầu-cuối thật: dán link → xem trước → nghe. Trang đọc bài từ cache Supabase thật (đã seed bằng bài hư cấu 夜车),
// chỉ YouTube được giả lập. Bỏ qua khi thiếu khóa Supabase trong .env.local.
test.describe.configure({ mode: "serial" });
test.skip(!hasSupabaseEnv, "Cần NEXT_PUBLIC_SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY trong .env.local");

test.beforeAll(seedFixtureSong);
test.afterAll(removeFixtureSong);

test("dán link → xem trước → nghe, và bài xuất hiện ở 'Bài hát gần đây'", async ({ page }) => {
  await stubYouTube(page);
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByLabel("Dán link YouTube của bài hát").fill(`https://youtu.be/${E2E_VIDEO_ID}`);
  await page.getByRole("button", { name: "Phân tích bài hát" }).click();

  // Bản xem trước (bài đã có trong cache nên không cần phân tích).
  await expect(page).toHaveURL(new RegExp(`/learn/${E2E_VIDEO_ID}$`));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("夜车");
  await expect(page.getByRole("heading", { name: "Từ vựng cốt lõi" })).toBeVisible();
  await expect(page.getByRole("article").filter({ has: page.getByRole("heading", { name: "离开", exact: true }) })).toBeVisible();

  // Sang màn Nghe.
  await page.getByRole("link", { name: /^Bắt đầu nghe nhạc/ }).click();
  await expect(page).toHaveURL(new RegExp(`/learn/${E2E_VIDEO_ID}/listen$`));
  await expect(page.locator("[data-line-index]")).toHaveCount(6);
  await page.evaluate(() => { (window as unknown as { __t: number }).__t = 6; });
  await expect(page.locator('[data-line-index="1"]')).toHaveAttribute("aria-current", "true");

  // Bấm từ có trong danh sách học: popover hiện ngay dữ liệu đã cache.
  await page.locator('[data-line-index="1"]').getByRole("button", { name: /离开/ }).click();
  await expect(page.getByRole("dialog")).toContainText("ly khai".toUpperCase(), { ignoreCase: true });
  await page.keyboard.press("Escape");

  // Về trang chủ: bài vừa mở nằm trong danh sách gần đây.
  await page.goto("/");
  await expect(page.getByRole("link", { name: /Bài mẫu E2E/ })).toBeVisible();
});

test("vào thẳng màn Nghe của bài chưa có phân tích thì chuyển về trang bài học", async ({ page }) => {
  await page.goto("/learn/zzzzzzzzzzz/listen");
  await expect(page).toHaveURL(/\/learn\/zzzzzzzzzzz$/);
});

test("mở trang bài học với videoId sai định dạng → 404", async ({ page }) => {
  const res = await page.goto("/learn/khong-hop-le");
  expect(res?.status()).toBe(404);
});
