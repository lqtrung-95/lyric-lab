import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Yêu thích video: tim trên thẻ và ở màn xem, lọc "Yêu thích", lời nhắc đăng nhập Google lần đầu cho tài khoản ẩn danh. Supabase (đăng nhập ẩn danh + bảng user_video_likes) và API video được giả lập.
const STUB = `window.__t = 0; window.__playing = false;
window.YT = { PlayerState: { PLAYING: 1 }, Player: function (el, opts) {
  el.replaceWith(document.createElement('div'));
  setTimeout(function () { opts.events.onReady({ target: { seekTo: function () {}, playVideo: function () {}, pauseVideo: function () {}, setPlaybackRate: function () {},
    getCurrentTime: function () { return 0; }, getPlayerState: function () { return 2; } } }); }, 0);
  this.destroy = function () {}; } };
window.onYouTubeIframeAPIReady && window.onYouTubeIframeAPIReady();`;
const v = (id: string, channelTitle = "Kênh A") => ({ videoId: id, title: `Bài ${id}`, channelTitle, durationSec: 120, levelAvg: 2, lineCount: 10, tags: [] });
const VIDEOS = [v("aaaaaaaaaa1"), v("aaaaaaaaaa2"), v("bbbbbbbbbb1", "Kênh B")];
const lesson = { ...v("aaaaaaaaaa1"), translationSource: "ai", transcriptSource: "captions", lines: [{ idx: 0, start: 0, end: 4, text: "你好。", pinyin: "nǐ hǎo 。", translation: "Xin chào.", tokens: [{ text: "你好" }, { text: "。" }] }] };

const session = () => {
  const now = Math.floor(Date.now() / 1000);
  return { access_token: "test.token.value", token_type: "bearer", expires_in: 3600, expires_at: now + 3600, refresh_token: "r", user: { id: "11111111-1111-1111-1111-111111111111", aud: "authenticated", role: "authenticated", is_anonymous: true, app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() } };
};

async function setup(page: Page, opts: { registered?: boolean; failWrites?: boolean } = {}) {
  const liked = new Set<string>();
  const writes: string[] = [];
  await page.route("**/api/videos", (r) => r.fulfill({ json: { videos: VIDEOS } }));
  await page.route("**/api/videos/aaaaaaaaaa1", (r) => r.fulfill({ json: lesson }));
  await page.route("**/api/chat/me", (r) => r.fulfill({ json: { registered: opts.registered ?? false } }));
  await page.route("https://www.youtube.com/iframe_api", (r) => r.fulfill({ contentType: "text/javascript", body: STUB }));
  await page.route("**/auth/v1/signup**", (r) => r.fulfill({ json: session() }));
  await page.route("**/rest/v1/user_video_likes**", async (route) => {
    const req = route.request();
    if (opts.failWrites && req.method() !== "GET") return route.fulfill({ status: 500, json: { message: "boom" } });
    if (req.method() === "GET") return route.fulfill({ json: [...liked].map((video_id) => ({ video_id })) });
    if (req.method() === "POST") { const body = req.postDataJSON() as { video_id: string }; liked.add(body.video_id); writes.push(`like ${body.video_id}`); return route.fulfill({ status: 201, body: "" }); }
    const id = new URL(req.url()).searchParams.get("video_id")?.replace("eq.", "") ?? "";
    liked.delete(id); writes.push(`unlike ${id}`);
    return route.fulfill({ status: 204, body: "" });
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  return { liked, writes };
}
const heart = (page: Page, id: string) => page.locator(`a[href="/video/${id}"]`).locator("xpath=..").getByRole("button", { name: /thích video này/i });

test("bấm tim trên thẻ: lưu đúng video, nút đổi trạng thái, bấm lại để bỏ thích", async ({ page }) => {
  const { writes } = await setup(page);
  await page.goto("/video");
  const btn = heart(page, "aaaaaaaaaa1");
  await expect(btn).toHaveAttribute("aria-pressed", "false");
  await btn.click();
  await expect(btn).toHaveAttribute("aria-pressed", "true");
  await expect(btn).toHaveAccessibleName("Bỏ thích video này");
  await btn.click();
  await expect(btn).toHaveAttribute("aria-pressed", "false");
  expect(writes).toEqual(["like aaaaaaaaaa1", "unlike aaaaaaaaaa1"]);
});

test("lọc Yêu thích chỉ còn video đã tim; nhớ sau khi tải lại; chưa tim thì báo rõ", async ({ page }) => {
  await setup(page);
  await page.goto("/video");
  const chip = page.getByRole("button", { name: /^Yêu thích/ });
  await expect(chip).toContainText("0");
  await chip.click();
  await expect(page.getByText("Bạn chưa thích video nào")).toBeVisible();
  await page.getByRole("button", { name: "Xem tất cả video" }).click();
  await heart(page, "bbbbbbbbbb1").click();
  await expect(chip).toContainText("1");
  await page.reload();
  await expect(page.getByRole("button", { name: /^Yêu thích/ })).toContainText("1"); // danh sách lấy lại từ máy chủ
  await page.getByRole("button", { name: /^Yêu thích/ }).click();
  await expect(page.locator("ul a[href^='/video/']")).toHaveCount(1);
  await expect(page.getByRole("link", { name: /Bài bbbbbbbbbb1/ })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations.filter((x) => ["serious", "critical"].includes(x.impact ?? ""))).toEqual([]);
});

test("người chưa đăng nhập Google: lần tim đầu có lời nhắc đăng nhập, đúng một lần; tài khoản Google thì không", async ({ page }) => {
  await setup(page, { registered: false });
  await page.goto("/video");
  await heart(page, "aaaaaaaaaa1").click();
  await expect(page.getByRole("status").filter({ hasText: "Đăng nhập Google" })).toBeVisible();
  await page.getByRole("status").filter({ hasText: "Đăng nhập Google" }).waitFor({ state: "hidden", timeout: 8000 });
  await heart(page, "aaaaaaaaaa2").click();
  await page.waitForTimeout(600);
  await expect(page.getByRole("status").filter({ hasText: "Đăng nhập Google" })).toHaveCount(0);

  const page2 = await page.context().newPage();
  await page2.evaluate(() => localStorage.clear()).catch(() => undefined);
  await setup(page2, { registered: true });
  await page2.goto("/video");
  await heart(page2, "aaaaaaaaaa1").click();
  await page2.waitForTimeout(600);
  await expect(page2.getByRole("status").filter({ hasText: "Đăng nhập Google" })).toHaveCount(0);
});

test("lưu lỗi thì tim hoàn tác, không giả vờ đã lưu", async ({ page }) => {
  await setup(page, { failWrites: true });
  await page.goto("/video");
  const btn = heart(page, "aaaaaaaaaa1");
  await btn.click();
  await expect(btn).toHaveAttribute("aria-pressed", "false");
});

test("màn xem video có nút Thích, tim ở đây cũng hiện ở danh sách", async ({ page }) => {
  const { liked } = await setup(page);
  await page.goto("/video/aaaaaaaaaa1");
  const btn = page.getByRole("button", { name: "Thích video này" });
  await btn.click();
  await expect.poll(() => liked.has("aaaaaaaaaa1")).toBe(true); // đợi bản ghi lên máy chủ trước khi chuyển trang
  await expect(page.getByRole("button", { name: "Bỏ thích video này" })).toHaveAttribute("aria-pressed", "true");
  await page.goto("/video");
  await expect(heart(page, "aaaaaaaaaa1")).toHaveAttribute("aria-pressed", "true");
});
