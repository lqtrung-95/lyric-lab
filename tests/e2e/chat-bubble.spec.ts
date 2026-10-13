import { expect, test, type Page } from "@playwright/test";

// Bong bóng chat nổi: hiện ở trang chủ/Ôn tập/Video (danh sách)/Thư viện, mở khung chat nhỏ, Esc đóng, "Mở rộng" sang /chat. API giả lập.
const msg = (id: number, nickname: string, body: string) => ({ id, nickname, avatarUrl: null, isAdmin: false, kind: "chat", body, createdAt: new Date().toISOString() });

async function mock(page: Page, opts: { unread?: boolean } = {}) {
  await page.route("**/api/admin/whoami", (r) => r.fulfill({ json: { isAdmin: false } }));
  await page.route("**/api/leaderboard/profile", (r) => r.fulfill({ json: { profile: { nickname: "Lan", optedIn: false, avatarUrl: null } } }));
  await page.route("**/api/chat/status", (r) => r.fulfill({ json: { latestId: opts.unread ? 7 : 0, announcement: null } }));
  await page.route(/\/api\/chat(\?.*)?$/, (r) => r.fulfill({ json: { messages: [msg(7, "Mai", "Chào cả nhà!")], hasMore: false, deletedIds: [] } }));
  await page.route("**/api/videos", (r) => r.fulfill({ json: { videos: [] } }));
  await page.route("**/api/library/songs", (r) => r.fulfill({ json: { songs: [] } }));
  await page.route("**/api/discover**", (r) => r.fulfill({ json: { songs: [], hasMore: false } }));
}
const bubble = (page: Page) => page.getByRole("button", { name: /Mở chat cộng đồng/ });

test("hiện ở trang chủ, Ôn tập, Video (danh sách), Thư viện; không hiện ở trang Cộng đồng và Cài đặt", async ({ page }) => {
  await mock(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  for (const path of ["/app", "/review", "/video", "/library"]) {
    await page.goto(path);
    await expect(bubble(page), path).toBeVisible();
  }
  for (const path of ["/chat", "/settings"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expect(bubble(page), path).toHaveCount(0);
  }
});

test("bấm mở khung chat với tin nhắn, Esc đóng và trả focus về bong bóng", async ({ page }) => {
  await mock(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/app");
  await bubble(page).click();
  const dialog = page.getByRole("dialog", { name: "Chat cộng đồng" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Chào cả nhà!")).toBeVisible();
  await expect(dialog.getByRole("textbox", { name: "Tin nhắn" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(bubble(page)).toBeFocused();
});

test("có chấm tin mới trên bong bóng; mở khung xong thì hết chấm", async ({ page }) => {
  await mock(page, { unread: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/app");
  await expect(page.getByTestId("chat-bubble-dot")).toBeVisible();
  await expect(page.getByRole("button", { name: "Mở chat cộng đồng, có tin mới" })).toBeVisible();
  await bubble(page).click();
  await expect(page.getByRole("dialog", { name: "Chat cộng đồng" }).getByText("Chào cả nhà!")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("chat-bubble-dot")).toHaveCount(0); // đã xem tới tin 7
});

test("nút Mở rộng sang trang Cộng đồng và thu khung lại", async ({ page }) => {
  await mock(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/review");
  await bubble(page).click();
  await page.getByRole("link", { name: "Mở rộng sang trang Cộng đồng" }).click();
  await expect(page).toHaveURL(/\/chat$/);
  await expect(page.getByRole("dialog", { name: "Chat cộng đồng" })).toHaveCount(0);
});

test("điện thoại: bong bóng nằm cao hơn thanh tab dưới, mở ra toàn màn hình và đóng được", async ({ page }) => {
  await mock(page);
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/app");
  await page.waitForLoadState("networkidle");
  const b = await bubble(page).boundingBox();
  const tab = await page.getByRole("navigation", { name: "Điều hướng chính" }).last().boundingBox();
  expect(b!.y + b!.height).toBeLessThanOrEqual(tab!.y);
  await bubble(page).click();
  const box = await page.getByRole("dialog", { name: "Chat cộng đồng" }).boundingBox();
  // Phủ kín màn hình (góc trên trái ở 0,0; chiều rộng lệch tối đa ~15px do thanh cuộn của Chromium), khác khung nhỏ của máy tính.
  expect(box!.x).toBe(0);
  expect(box!.y).toBe(0);
  expect(box!.width).toBeGreaterThanOrEqual(360);
  expect(box!.height).toBeGreaterThanOrEqual(799);
  await page.getByRole("button", { name: "Đóng chat" }).click();
  await expect(page.getByRole("dialog", { name: "Chat cộng đồng" })).toHaveCount(0);
  await expect(bubble(page)).toBeVisible();
});
