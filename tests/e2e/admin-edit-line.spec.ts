import { expect, test } from "@playwright/test";

// Quản trị viên sửa lời một dòng ở màn Nghe (dữ liệu mẫu hư cấu "夜车", không gọi DB). whoami và PATCH được giả lập.
const STUB = `window.YT = { PlayerState: { PLAYING: 1 }, Player: function (el, opts) {
  el.replaceWith(document.createElement('div'));
  setTimeout(function () { opts.events.onReady({ target: { seekTo: function () {}, playVideo: function () {}, pauseVideo: function () {},
    setPlaybackRate: function () {}, getCurrentTime: function () { return 0; }, getPlayerState: function () { return 2; } } }); }, 0);
  this.destroy = function () {}; } };
window.onYouTubeIframeAPIReady && window.onYouTubeIframeAPIReady();`;

test.beforeEach(async ({ page }) => {
  await page.route("https://www.youtube.com/iframe_api", (route) => route.fulfill({ contentType: "text/javascript", body: STUB }));
});

test("người không phải admin không thấy nút sửa lời", async ({ page }) => {
  await page.route("**/api/admin/whoami", (route) => route.fulfill({ json: { isAdmin: false } }));
  await page.goto("/dev/listen-fixture");
  await expect(page.locator('[data-line-index="0"]')).toBeVisible();
  await expect(page.getByRole("button", { name: /Sửa lời câu/ })).toHaveCount(0);
});

test("admin sửa chữ Hán: gửi PATCH edit_line, không gửi pinyin khi chưa đụng ô pinyin", async ({ page }) => {
  await page.route("**/api/admin/whoami", (route) => route.fulfill({ json: { isAdmin: true } }));
  let body: Record<string, unknown> | null = null;
  await page.route("**/api/admin/songs/*", async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({ json: { done: "line_edited" } });
  });
  await page.goto("/dev/listen-fixture");
  await page.locator('[data-line-index="1"]').hover();
  await page.getByRole("button", { name: "Sửa lời câu 2 (quản trị)" }).click();
  const dialog = page.getByRole("dialog", { name: "Sửa lời câu 2" });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Lời tiếng Trung").fill("我想你");
  await dialog.getByRole("button", { name: "Lưu" }).click();
  await expect(dialog).toBeHidden();
  expect(body).toMatchObject({ action: "edit_line", lineIndex: 1, text: "我想你" });
  expect(body).not.toHaveProperty("pinyin");
});

test("admin chỉ sửa pinyin: gửi kèm pinyin gõ tay; lỗi từ server hiện thông báo", async ({ page }) => {
  await page.route("**/api/admin/whoami", (route) => route.fulfill({ json: { isAdmin: true } }));
  let body: Record<string, unknown> | null = null;
  await page.route("**/api/admin/songs/*", async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({ status: 400, json: { error: "invalid_text" } });
  });
  await page.goto("/dev/listen-fixture");
  await page.locator('[data-line-index="0"]').hover();
  await page.getByRole("button", { name: "Sửa lời câu 1 (quản trị)" }).click();
  const dialog = page.getByRole("dialog", { name: "Sửa lời câu 1" });
  await dialog.getByLabel("Pinyin").fill("sửa tay");
  await dialog.getByRole("button", { name: "Lưu" }).click();
  await expect(dialog.getByRole("alert")).toContainText("không hợp lệ");
  expect(body).toMatchObject({ action: "edit_line", lineIndex: 0, pinyin: "sửa tay" });
});
