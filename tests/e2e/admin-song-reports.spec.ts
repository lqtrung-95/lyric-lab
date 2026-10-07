import { expect, test } from "@playwright/test";

// Quản trị viên thấy bài bị báo sai: dải cảnh báo ở màn Nghe và trang danh sách. whoami và API được giả lập (dữ liệu mẫu, không gọi DB).
const STUB = `window.YT = { PlayerState: { PLAYING: 1 }, Player: function (el, opts) {
  el.replaceWith(document.createElement('div'));
  setTimeout(function () { opts.events.onReady({ target: { seekTo: function () {}, playVideo: function () {}, pauseVideo: function () {},
    setPlaybackRate: function () {}, getCurrentTime: function () { return 0; }, getPlayerState: function () { return 2; } } }); }, 0);
  this.destroy = function () {}; } };
window.onYouTubeIframeAPIReady && window.onYouTubeIframeAPIReady();`;

const reported = { videoId: "aaaaaaaaaaa", title: "夜车", hidden: true, total: 3, byReason: { lyrics_mismatch: 2, not_a_song: 1 }, latestAt: "2026-10-07T10:00:00Z" };

test.beforeEach(async ({ page }) => {
  await page.route("https://www.youtube.com/iframe_api", (route) => route.fulfill({ contentType: "text/javascript", body: STUB }));
});

test("màn Nghe: admin thấy dải cảnh báo kèm lý do, người thường không thấy", async ({ page }) => {
  await page.route("**/api/admin/whoami", (route) => route.fulfill({ json: { isAdmin: true } }));
  await page.route("**/api/admin/song-reports*", (route) => route.fulfill({ json: { items: [reported] } }));
  await page.goto("/dev/listen-fixture");
  const banner = page.getByRole("status").filter({ hasText: "đang bị báo sai" });
  await expect(banner).toContainText("3 báo cáo");
  await expect(banner).toContainText("Lời không khớp với video ×2");
  await expect(banner.getByRole("link", { name: "Tất cả báo cáo" })).toHaveAttribute("href", "/admin/reports");

  await page.unroute("**/api/admin/whoami");
  await page.route("**/api/admin/whoami", (route) => route.fulfill({ json: { isAdmin: false } }));
  await page.reload();
  await expect(page.locator('[data-line-index="0"]')).toBeVisible();
  await expect(page.getByText("đang bị báo sai")).toHaveCount(0);
});

test("trang báo cáo: liệt kê bài, Đã xử lý gửi dismiss và danh sách tải lại", async ({ page }) => {
  await page.route("**/api/admin/whoami", (route) => route.fulfill({ json: { isAdmin: true } }));
  let dismissed = false;
  let dismissBody: unknown = null;
  await page.route("**/api/admin/song-reports/aaaaaaaaaaa", async (route) => {
    dismissBody = route.request().postDataJSON();
    dismissed = true;
    await route.fulfill({ json: { done: "dismissed", removed: 3 } });
  });
  await page.route("**/api/admin/song-reports", (route) => route.fulfill({ json: { items: dismissed ? [] : [reported] } }));
  await page.goto("/admin/reports");
  const card = page.getByRole("listitem").filter({ hasText: "夜车" });
  await expect(card).toContainText("3 báo cáo");
  await expect(card).toContainText("Đang ẩn");
  await expect(card.getByRole("link", { name: "Mở bài để sửa lời" })).toHaveAttribute("href", "/learn/aaaaaaaaaaa/listen");
  await card.getByRole("button", { name: "Đã xử lý" }).click();
  await expect(page.getByText("Không có bài nào đang bị báo.")).toBeVisible();
  expect(dismissBody).toEqual({ action: "dismiss" });
});
