import { expect, test } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { E2E_VIDEO_ID, hasSupabaseEnv, removeFixtureSong, seedFixtureSong } from "./helpers/seed-analysis";

// Thẻ xem trước khi dán link bài học vào Telegram/Facebook/Zalo (dữ liệu hư cấu "夜车"). Chỉ có tên bài và ảnh, không có lời bài hát.
test.describe("xem trước link bài học", () => {
  test.skip(!hasSupabaseEnv, "cần cấu hình Supabase");
  test.beforeAll(seedFixtureSong);
  test.afterAll(removeFixtureSong);

  test("trang có og/twitter với tên bài, vẫn noindex, và ảnh xem trước tải được", async ({ page, request }) => {
    await page.goto(`/learn/${E2E_VIDEO_ID}`);
    const meta = (selector: string) => page.locator(`meta[${selector}]`).first().getAttribute("content");
    expect(await meta('property="og:title"')).toContain("夜车");
    expect(await meta('property="og:description"')).toContain("SongHanzi");
    expect(await meta('name="twitter:card"')).toBe("summary_large_image");
    expect(await meta('name="robots"')).toContain("noindex");
    const image = await meta('property="og:image"');
    expect(image).toBeTruthy();
    // Không để lời bài hát lọt vào thẻ xem trước.
    expect(await meta('property="og:description"')).not.toContain("窗外");

    const res = await request.get(new URL(image!).pathname + new URL(image!).search);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
    const body = await res.body();
    expect(body.length).toBeGreaterThan(5_000);
    writeFileSync("test-results/learn-og-image.png", body);
  });

  test("link sai định dạng hoặc bài chưa có trong kho vẫn có ảnh xem trước chung", async ({ request }) => {
    const res = await request.get("/learn/notInStore01/opengraph-image");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  });
});
