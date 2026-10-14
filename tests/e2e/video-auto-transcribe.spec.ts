import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Video không có phụ đề: sau khi thêm báo thiếu phụ đề, giao diện TỰ gọi từng đoạn /api/videos/transcribe (không cần bấm nút)
// rồi gửi cả bản chép sang /api/videos/add với nhãn "auto". Mọi API được giả lập (không gọi Gemini, không ghi dữ liệu thật).
const VIDEO_ID = "abcdefghijk";

async function setup(page: Page, transcribe: (chunk: number) => { status?: number; json: unknown }, registered = true) {
  const addBodies: Record<string, unknown>[] = [];
  const chunks: number[] = [];
  await page.route("**/api/chat/me", (route) => route.fulfill({ json: { registered } }));
  await page.route("**/api/videos/*", (route) => route.fulfill({ status: 404, json: { error: "not_found" } }));
  await page.route("**/api/videos/add", (route) => {
    const body = route.request().postDataJSON() as Record<string, unknown>;
    addBodies.push(body);
    return body.lines
      ? route.fulfill({ json: { kind: "added", videoId: VIDEO_ID, lineCount: 4, translatedLineCount: 4 } })
      : route.fulfill({ status: 422, json: { error: "no_chinese_captions" } });
  });
  await page.route("**/api/videos/transcribe", async (route) => {
    // Trễ một chút như Gemini thật, để test kịp quan sát trạng thái "đang nghe".
    await new Promise((r) => setTimeout(r, 700));
    const { chunk } = route.request().postDataJSON() as { chunk: number };
    chunks.push(chunk);
    const r = transcribe(chunk);
    return route.fulfill({ status: r.status ?? 200, json: r.json });
  });
  return { addBodies, chunks };
}

const ok = (chunk: number) => ({ json: { chunkCount: 3, lines: [{ text: `第${chunk}句`, start: chunk * 120 + 1, end: chunk * 120 + 4 }] } });

async function submitLink(page: Page) {
  await page.goto("/video/add");
  await page.getByLabel("Link video YouTube").fill(VIDEO_ID);
  await page.getByRole("button", { name: "Thêm video" }).click();
}

test("không có phụ đề: tự nhờ AI nghe từng đoạn rồi thêm video với nhãn nhận dạng tự động, không cần bấm nút", async ({ page }) => {
  const { addBodies, chunks } = await setup(page, ok);
  await submitLink(page);
  const offer = page.getByRole("region", { name: "Nhận dạng giọng nói bằng AI" });
  await expect(offer).toBeVisible();
  await expect(offer).toContainText("mất thời gian hơn");
  await expect(offer).toContainText("có thể không chính xác");
  // Không hiện lỗi "không có phụ đề" như thể thất bại, cũng không có nút phải bấm.
  await expect(page.getByRole("alert").filter({ hasText: /không có phụ đề/ })).toHaveCount(0);
  await expect(offer.getByRole("button")).toHaveCount(0);
  await expect(offer.getByRole("status")).toContainText("AI đang nghe video");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await expect(page).toHaveURL(new RegExp(`/video/${VIDEO_ID}$`));
  expect(chunks.sort()).toEqual([0, 1, 2]);
  const last = addBodies.at(-1)!;
  expect(last).toMatchObject({ video: VIDEO_ID, transcript: "auto" });
  expect((last.lines as { text: string }[]).map((l) => l.text)).toEqual(["第0句", "第1句", "第2句"]);
});

test("hết lượt nhận dạng trong ngày: báo rõ, không gửi gì sang bước thêm video", async ({ page }) => {
  const { addBodies } = await setup(page, () => ({ status: 429, json: { error: "user_limit" } }));
  await submitLink(page);
  await expect(page.getByRole("alert").filter({ hasText: "dùng hết lượt nhờ AI nghe video" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Thử lại" })).toBeVisible();
  expect(addBodies.filter((b) => b.lines)).toHaveLength(0);
});

test("AI quá tải ở một đoạn: tự thử lại rồi vẫn thành công", async ({ page }) => {
  let failedOnce = false;
  await setup(page, (chunk) => {
    if (chunk === 1 && !failedOnce) { failedOnce = true; return { status: 503, json: { error: "ai_unavailable" } }; }
    return ok(chunk);
  });
  await submitLink(page);
  await expect(page).toHaveURL(new RegExp(`/video/${VIDEO_ID}$`), { timeout: 15_000 });
  expect(failedOnce).toBe(true);
});

test("tài khoản ẩn danh: không tự chạy, chỉ có lời mời đăng nhập Google", async ({ page }) => {
  const { chunks } = await setup(page, ok, false);
  await submitLink(page);
  const offer = page.getByRole("region", { name: "Nhận dạng giọng nói bằng AI" });
  await expect(offer.getByRole("button", { name: "Đăng nhập Google để dùng" })).toBeVisible();
  await expect(offer.getByRole("button", { name: "Nhờ AI nghe và tạo phụ đề" })).toHaveCount(0);
  expect(chunks).toEqual([]);
});

test("dịch vụ lấy phụ đề tạm lỗi (video có thể CÓ phụ đề): chỉ gợi ý, không tự chạy; người dùng bấm mới nghe", async ({ page }) => {
  const { addBodies, chunks } = await setup(page, ok);
  await page.route("**/api/videos/add", (route) => {
    const body = route.request().postDataJSON() as Record<string, unknown>;
    addBodies.push(body);
    return body.lines ? route.fulfill({ json: { kind: "added", videoId: VIDEO_ID, lineCount: 3, translatedLineCount: 3 } }) : route.fulfill({ status: 503, json: { error: "fetch_unavailable" } });
  });
  await submitLink(page);
  await expect(page.getByRole("alert").filter({ hasText: "Chưa lấy tự động được phụ đề" })).toBeVisible();
  expect(chunks).toEqual([]);
  await page.getByRole("button", { name: "Nhờ AI nghe và tạo phụ đề" }).click();
  await expect(page).toHaveURL(new RegExp(`/video/${VIDEO_ID}$`));
});

test("dấu trang báo video không có phụ đề (cờ ai): trang tự chạy AI nghe luôn, không gửi phụ đề rỗng sang bước thêm", async ({ page }) => {
  const { addBodies, chunks } = await setup(page, ok);
  const hash = `#d=${Buffer.from(JSON.stringify({ v: VIDEO_ID, t: "", ai: true })).toString("base64url")}`;
  await page.goto(`/video/add${hash}`);
  await expect(page.getByRole("region", { name: "Nhận dạng giọng nói bằng AI" })).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/video/${VIDEO_ID}$`));
  expect(chunks.sort()).toEqual([0, 1, 2]);
  // Chỉ có MỘT lần gọi thêm video, mang theo các dòng AI chép; không có lần gửi phụ đề rỗng nào trước đó.
  expect(addBodies).toHaveLength(1);
  expect(addBodies[0]).toMatchObject({ video: VIDEO_ID, transcript: "auto" });
  await expect(page.getByText("Đã nhận phụ đề từ YouTube")).toHaveCount(0);
});

test("dấu trang cờ ai nhưng chưa đăng nhập Google: không tự chạy, chỉ mời đăng nhập", async ({ page }) => {
  const { addBodies, chunks } = await setup(page, ok, false);
  await page.goto(`/video/add#d=${Buffer.from(JSON.stringify({ v: VIDEO_ID, t: "", ai: true })).toString("base64url")}`);
  await expect(page.getByRole("button", { name: "Đăng nhập Google để dùng" })).toBeVisible();
  expect(chunks).toEqual([]);
  expect(addBodies).toEqual([]);
});
