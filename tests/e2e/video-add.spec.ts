import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Người dùng tự thêm video (podcast, vlog) vào kho dùng chung. API thêm video được giả lập (không ghi dữ liệu thật); phần được kiểm tra là trang
// Thêm video: điền sẵn từ dấu trang qua phần `#` của địa chỉ, gửi đúng nội dung, báo lỗi dễ hiểu, và điều hướng sang bài vừa thêm.
const VIDEO_ID = "abcdefghijk";
const hashOf = (payload: unknown) => `#d=${Buffer.from(JSON.stringify(payload)).toString("base64url")}`;

async function mockAdd(page: Page, respond: { status?: number; json: unknown }) {
  const bodies: Record<string, unknown>[] = [];
  // Playwright ưu tiên route đăng ký SAU: route chung (trang bài vừa mở gọi /api/videos/<id>) phải đăng ký trước route của /add.
  await page.route("**/api/videos/*", (route) => route.fulfill({ status: 404, json: { error: "not_found" } }));
  await page.route("**/api/videos/add", (route) => {
    bodies.push(route.request().postDataJSON());
    return route.fulfill({ status: respond.status ?? 200, json: respond.json });
  });
  return bodies;
}

test("trang luôn hiện sẵn ô dán phụ đề và hướng dẫn dấu trang, không có lỗi trợ năng", async ({ page }) => {
  await page.goto("/video/add");
  await expect(page.getByRole("heading", { name: "Thêm video của bạn" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Thêm video" })).toBeDisabled();
  await expect(page.getByLabel(/Phụ đề tiếng Trung/)).toBeVisible();
  await expect(page.getByText("video YouTube cần có phụ đề tiếng Trung (CC) nhé. Video không có phụ đề thì chưa thêm được nha.")).toBeVisible();
  await expect(page.getByRole("button", { name: /Tự dán phụ đề/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Sao chép mã/ })).toHaveCount(0);
  const bookmarklet = page.getByRole("link", { name: "Gửi sang SongHanzi" });
  await expect.poll(() => bookmarklet.getAttribute("href")).toMatch(/^javascript:/);
  await bookmarklet.click();
  await expect(page.getByText(/kéo.*nút này lên thanh dấu trang/i)).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("dán link và phụ đề, gửi đúng nội dung rồi mở bài vừa thêm", async ({ page }) => {
  const bodies = await mockAdd(page, { json: { kind: "added", videoId: VIDEO_ID, lineCount: 2, translatedLineCount: 2 } });
  await page.goto("/video/add");
  await page.getByLabel("Link video YouTube").fill(`https://www.youtube.com/watch?v=${VIDEO_ID}`);
  await page.getByLabel(/Phụ đề tiếng Trung/).fill("0:00\n大家好\n0:05\n欢迎收听");
  await page.getByRole("button", { name: "Thêm video" }).click();
  await expect(page).toHaveURL(new RegExp(`/video/${VIDEO_ID}$`));
  expect(bodies).toEqual([{ video: `https://www.youtube.com/watch?v=${VIDEO_ID}`, captions: "0:00\n大家好\n0:05\n欢迎收听" }]);
});

test("chỉ dán link, máy chủ tự lấy phụ đề: gửi không kèm phụ đề rồi mở bài", async ({ page }) => {
  const bodies = await mockAdd(page, { json: { kind: "added", videoId: VIDEO_ID, lineCount: 3, translatedLineCount: 3 } });
  await page.goto("/video/add");
  await page.getByLabel("Link video YouTube").fill(VIDEO_ID);
  await page.getByRole("button", { name: "Thêm video" }).click();
  await expect(page).toHaveURL(new RegExp(`/video/${VIDEO_ID}$`));
  expect(bodies).toEqual([{ video: VIDEO_ID }]);
});

test("không lấy tự động được thì báo cần phụ đề, giữ nguyên nội dung đã nhập", async ({ page }) => {
  await mockAdd(page, { status: 422, json: { error: "captions_required" } });
  await page.goto("/video/add");
  await page.getByLabel("Link video YouTube").fill(VIDEO_ID);
  await page.getByRole("button", { name: "Thêm video" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Cần có phụ đề tiếng Trung" })).toBeVisible();
  await expect(page.getByLabel("Link video YouTube")).toHaveValue(VIDEO_ID);
  await expect(page.getByRole("button", { name: "Thêm video" })).toBeEnabled();
  await expect(page.getByLabel(/Phụ đề tiếng Trung/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Gửi sang SongHanzi" })).toBeVisible();
});

test("phụ đề không phải tiếng Trung thì báo đổi ngôn ngữ", async ({ page }) => {
  await mockAdd(page, { status: 422, json: { error: "not_chinese" } });
  await page.goto("/video/add");
  await page.getByLabel("Link video YouTube").fill(VIDEO_ID);
  await page.getByRole("button", { name: "Thêm video" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "không phải tiếng Trung" })).toBeVisible();
  await expect(page.getByLabel(/Phụ đề tiếng Trung/)).toBeVisible();
});

test("báo rõ khi đã hết lượt trong ngày", async ({ page }) => {
  await mockAdd(page, { status: 429, json: { error: "user_limit" } });
  await page.goto("/video/add");
  await page.getByLabel("Link video YouTube").fill(VIDEO_ID);
  await page.getByRole("button", { name: "Thêm video" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "đã thêm đủ 3 video" })).toBeVisible();
});

test("dấu trang gửi bản chép lời qua #: điền sẵn, tự gửi luôn và hiện trạng thái đang xử lý trong lúc chờ", async ({ page }) => {
  const bodies: Record<string, unknown>[] = [];
  await page.route("**/api/videos/*", (route) => route.fulfill({ status: 404, json: { error: "not_found" } }));
  await page.route("**/api/videos/add", async (route) => {
    bodies.push(route.request().postDataJSON());
    await new Promise((r) => setTimeout(r, 800)); // đủ lâu để thấy trạng thái chờ
    await route.fulfill({ json: { kind: "added", videoId: VIDEO_ID, lineCount: 2, translatedLineCount: 2 } });
  });
  await page.goto(`/video/add${hashOf({ v: VIDEO_ID, t: "0:00\n大家好\n0:05\n欢迎收听" })}`);
  await expect(page.getByLabel("Link video YouTube")).toHaveValue(VIDEO_ID);
  await expect(page.getByRole("status").filter({ hasText: "Đang xử lý video" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Đang đọc phụ đề và dịch/ })).toBeDisabled();
  await expect(page).toHaveURL(new RegExp(`/video/${VIDEO_ID}$`));
  expect(bodies).toEqual([{ video: VIDEO_ID, captions: "0:00\n大家好\n0:05\n欢迎收听" }]); // gửi đúng một lần
});

test("dấu trang gửi kèm phụ đề tiếng Việt: báo đã nhận và gửi cả hai bản", async ({ page }) => {
  const bodies = await mockAdd(page, { json: { kind: "added", videoId: VIDEO_ID, lineCount: 2, translatedLineCount: 2 } });
  await page.goto(`/video/add${hashOf({ v: VIDEO_ID, t: "0:00\n大家好\n0:05\n欢迎收听", vt: "0:00\nXin chào\n0:05\nChào mừng" })}`);
  await expect(page.getByRole("status").filter({ hasText: "kèm phụ đề tiếng Việt" })).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/video/${VIDEO_ID}$`));
  expect(bodies).toEqual([{ video: VIDEO_ID, captions: "0:00\n大家好\n0:05\n欢迎收听", viCaptions: "0:00\nXin chào\n0:05\nChào mừng" }]);
});

test("dấu trang gửi bản chép lời nhưng server báo lỗi: hiện lỗi, giữ phụ đề đã nhận, không tự gửi lại", async ({ page }) => {
  const bodies = await mockAdd(page, { status: 422, json: { error: "not_chinese" } });
  await page.goto(`/video/add${hashOf({ v: VIDEO_ID, t: "0:00\nHello\n0:05\nWelcome to the show" })}`);
  await expect(page.getByRole("alert").filter({ hasText: "không phải tiếng Trung" })).toBeVisible();
  await expect(page.getByLabel(/Phụ đề tiếng Trung/)).toHaveValue("0:00\nHello\n0:05\nWelcome to the show");
  await page.waitForTimeout(500);
  expect(bodies).toHaveLength(1);
});

test("chưa có phiên đăng nhập (401) thì tạo phiên rồi tự thử lại một lần, không hiện lỗi", async ({ page }) => {
  const bodies: Record<string, unknown>[] = [];
  // Đăng nhập ẩn danh giả lập: dự án Supabase thật bật CAPTCHA (trình duyệt localhost không có token Turnstile nên bị từ chối), test không được phụ thuộc vào đó.
  await page.route("**/auth/v1/signup*", (route) => route.fulfill({
    json: {
      access_token: "e2e.access.token", token_type: "bearer", expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: "e2e-refresh",
      user: { id: "00000000-0000-4000-8000-000000000001", aud: "authenticated", role: "authenticated", is_anonymous: true, app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() },
    },
  }));
  await page.route("**/api/videos/*", (route) => route.fulfill({ status: 404, json: { error: "not_found" } }));
  await page.route("**/api/videos/add", (route) => {
    bodies.push(route.request().postDataJSON());
    return bodies.length === 1
      ? route.fulfill({ status: 401, json: { error: "unauthorized" } })
      : route.fulfill({ json: { kind: "added", videoId: VIDEO_ID, lineCount: 2, translatedLineCount: 2 } });
  });
  await page.goto("/video/add");
  await page.getByLabel("Link video YouTube").fill(VIDEO_ID);
  await page.getByRole("button", { name: "Thêm video" }).click();
  await expect(page).toHaveURL(new RegExp(`/video/${VIDEO_ID}$`));
  expect(bodies).toHaveLength(2);
});

test("từ trang Video có lối vào Thêm video của bạn", async ({ page }) => {
  await page.route("**/api/videos", (route) => route.fulfill({ json: { videos: [] } }));
  await page.goto("/video");
  await page.getByRole("link", { name: "Thêm video của bạn" }).click();
  await expect(page).toHaveURL(/\/video\/add$/);
});

test("API thêm video từ chối khi chưa có phiên hoặc dữ liệu sai", async ({ request }) => {
  const res = await request.post("/api/videos/add", { data: { video: "không phải link" } });
  expect([400, 401]).toContain(res.status());
  expect((await res.json()).error).toBeTruthy();
});
