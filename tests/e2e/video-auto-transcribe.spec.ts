import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Video không có phụ đề: gợi ý "Nhờ AI nghe và tạo phụ đề" hiện sau khi thêm thất bại vì thiếu phụ đề; bấm thì giao diện gọi từng đoạn /api/videos/transcribe
// rồi gửi cả bản chép sang /api/videos/add với nhãn "auto". Mọi API được giả lập (không gọi Gemini, không ghi dữ liệu thật).
const VIDEO_ID = "abcdefghijk";

async function setup(page: Page, transcribe: (chunk: number) => { status?: number; json: unknown }) {
  const addBodies: Record<string, unknown>[] = [];
  const chunks: number[] = [];
  await page.route("**/api/videos/*", (route) => route.fulfill({ status: 404, json: { error: "not_found" } }));
  await page.route("**/api/videos/add", (route) => {
    const body = route.request().postDataJSON() as Record<string, unknown>;
    addBodies.push(body);
    return body.lines
      ? route.fulfill({ json: { kind: "added", videoId: VIDEO_ID, lineCount: 4, translatedLineCount: 4 } })
      : route.fulfill({ status: 422, json: { error: "no_chinese_captions" } });
  });
  await page.route("**/api/videos/transcribe", (route) => {
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

test("không có phụ đề: hiện gợi ý AI, nghe từng đoạn rồi thêm video với nhãn nhận dạng tự động", async ({ page }) => {
  const { addBodies, chunks } = await setup(page, ok);
  await submitLink(page);
  const offer = page.getByRole("region", { name: "Nhận dạng giọng nói bằng AI" });
  await expect(offer).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await offer.getByRole("button", { name: "Nhờ AI nghe và tạo phụ đề" }).click();
  await expect(page).toHaveURL(new RegExp(`/video/${VIDEO_ID}$`));
  expect(chunks.sort()).toEqual([0, 1, 2]);
  const last = addBodies.at(-1)!;
  expect(last).toMatchObject({ video: VIDEO_ID, transcript: "auto" });
  expect((last.lines as { text: string }[]).map((l) => l.text)).toEqual(["第0句", "第1句", "第2句"]);
});

test("hết lượt nhận dạng trong ngày: báo rõ, không gửi gì sang bước thêm video", async ({ page }) => {
  const { addBodies } = await setup(page, () => ({ status: 429, json: { error: "user_limit" } }));
  await submitLink(page);
  await page.getByRole("button", { name: "Nhờ AI nghe và tạo phụ đề" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "dùng hết lượt nhờ AI nghe video" })).toBeVisible();
  expect(addBodies.filter((b) => b.lines)).toHaveLength(0);
});

test("AI quá tải ở một đoạn: tự thử lại rồi vẫn thành công", async ({ page }) => {
  let failedOnce = false;
  await setup(page, (chunk) => {
    if (chunk === 1 && !failedOnce) { failedOnce = true; return { status: 503, json: { error: "ai_unavailable" } }; }
    return ok(chunk);
  });
  await submitLink(page);
  await page.getByRole("button", { name: "Nhờ AI nghe và tạo phụ đề" }).click();
  await expect(page).toHaveURL(new RegExp(`/video/${VIDEO_ID}$`), { timeout: 15_000 });
  expect(failedOnce).toBe(true);
});
