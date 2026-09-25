import { expect, test } from "@playwright/test";
import { stubYouTube } from "./helpers/youtube-stub";

// Dùng được hoàn toàn bằng bàn phím (WCAG 2.1.1, 2.4.1, 2.4.7).
test("liên kết 'Bỏ qua tới nội dung chính' là mục Tab đầu tiên và đưa focus vào nội dung", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Bỏ qua tới nội dung chính" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
  await expect(page.locator("#main")).toBeFocused();
});

test("dán link chỉ bằng bàn phím: Tab tới ô nhập, gõ, Enter", async ({ page }) => {
  await page.route("**/api/analyze/**", (r) => r.fulfill({ contentType: "text/event-stream", body: 'event: error\ndata: {"code":"no_lyrics"}\n\n' }));
  await page.route("https://i.ytimg.com/**", (r) => r.fulfill({ status: 204 }));
  await page.goto("/");
  await page.getByLabel("Dán link YouTube của bài hát").focus();
  await page.keyboard.type("https://youtu.be/dQw4w9WgXcQ");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/learn\/dQw4w9WgXcQ$/);
});

test("xem trước: mọi hành động trên thẻ tới được bằng Tab và kích hoạt bằng Enter/Space", async ({ page }) => {
  await page.goto("/dev/preview-fixture");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "离开", exact: true }) });
  const save = card.getByRole("button", { name: /^(Lưu|Đã lưu)$/ });
  await save.focus();
  await page.keyboard.press("Space");
  await expect(save).toHaveAttribute("aria-pressed", "true");
  const known = card.getByRole("button", { name: "Đã biết" });
  await known.focus();
  await page.keyboard.press("Enter");
  await expect(card).toHaveCount(0);
});

test("menu báo sai đóng bằng Escape khi đang mở", async ({ page }) => {
  await page.goto("/dev/preview-fixture");
  const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "离开", exact: true }) });
  const trigger = card.getByRole("button", { name: /Báo sai thẻ/ });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);
});

test("màn Nghe: từ trong lời là nút, Enter mở popover, Escape đóng và trả focus", async ({ page }) => {
  await stubYouTube(page);
  await page.route("**/api/lookup**", (r) => r.fulfill({ json: { entry: null } }));
  await page.route("**/api/explain", (r) => r.fulfill({ json: { meaningInContext: "dần dần", model: "t", fromCache: false } }));
  await page.goto("/dev/listen-fixture");
  const w = page.locator('[data-line-index="0"]').getByRole("button", { name: "慢慢", exact: true });
  await w.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(w).toBeFocused();
});
