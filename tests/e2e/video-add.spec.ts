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

test("trang hiện form, hướng dẫn dấu trang và không có lỗi trợ năng", async ({ page }) => {
  await page.goto("/video/add");
  await expect(page.getByRole("heading", { name: "Thêm video của bạn" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Thêm video" })).toBeDisabled();
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

test("không dán phụ đề mà máy chủ không lấy tự động được thì báo cần phụ đề, giữ nguyên nội dung đã nhập", async ({ page }) => {
  await mockAdd(page, { status: 422, json: { error: "captions_required" } });
  await page.goto("/video/add");
  await page.getByLabel("Link video YouTube").fill(VIDEO_ID);
  await page.getByRole("button", { name: "Thêm video" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Cần có phụ đề tiếng Trung" })).toBeVisible();
  await expect(page.getByLabel("Link video YouTube")).toHaveValue(VIDEO_ID);
  await expect(page.getByRole("button", { name: "Thêm video" })).toBeEnabled();
});

test("báo rõ khi đã hết lượt trong ngày", async ({ page }) => {
  await mockAdd(page, { status: 429, json: { error: "user_limit" } });
  await page.goto("/video/add");
  await page.getByLabel("Link video YouTube").fill(VIDEO_ID);
  await page.getByRole("button", { name: "Thêm video" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "đã thêm đủ 3 video" })).toBeVisible();
});

test("dấu trang gửi bản chép lời qua #: điền sẵn link và phụ đề", async ({ page }) => {
  const bodies = await mockAdd(page, { json: { kind: "exists", videoId: VIDEO_ID } });
  await page.goto(`/video/add${hashOf({ v: VIDEO_ID, t: "0:00\n大家好\n0:05\n欢迎收听" })}`);
  await expect(page.getByLabel("Link video YouTube")).toHaveValue(VIDEO_ID);
  await expect(page.getByLabel(/Phụ đề tiếng Trung/)).toHaveValue("0:00\n大家好\n0:05\n欢迎收听");
  await page.getByRole("button", { name: "Thêm video" }).click();
  await expect(page).toHaveURL(new RegExp(`/video/${VIDEO_ID}$`));
  expect(bodies[0]).toMatchObject({ video: VIDEO_ID, captions: "0:00\n大家好\n0:05\n欢迎收听" });
});

test("dấu trang gửi phụ đề dạng cặp [giây, lời]: báo số dòng nhận được và gửi dưới dạng dòng có mốc", async ({ page }) => {
  const bodies = await mockAdd(page, { json: { kind: "added", videoId: VIDEO_ID, lineCount: 2, translatedLineCount: 0 } });
  await page.goto(`/video/add${hashOf({ v: VIDEO_ID, l: [[1.5, "你好"], [4, "谢谢"]] })}`);
  await expect(page.getByRole("status").filter({ hasText: "Đã nhận 2 dòng" })).toBeVisible();
  await page.getByRole("button", { name: "Thêm video" }).click();
  await expect(page).toHaveURL(new RegExp(`/video/${VIDEO_ID}$`));
  expect(bodies[0]).toEqual({ video: VIDEO_ID, lines: [{ text: "你好", start: 1.5, end: 4 }, { text: "谢谢", start: 4, end: 9 }] });
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
