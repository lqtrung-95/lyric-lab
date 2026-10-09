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

  test("link chia sẻ một câu (?line=) có thẻ xem trước là đúng câu đó, ảnh dựng riêng cho câu", async ({ page, request }) => {
    await page.goto(`/learn/${E2E_VIDEO_ID}?line=0`);
    const meta = (selector: string) => page.locator(`meta[${selector}]`).first().getAttribute("content");
    expect(await meta('property="og:title"')).toBe("窗外的城市慢慢睡了");
    expect(await meta('property="og:description"')).toContain("Thành phố ngoài cửa sổ");
    expect(await meta('name="robots"')).toContain("noindex");
    const image = await meta('property="og:image"');
    expect(image).toContain(`/api/share/line/${E2E_VIDEO_ID}/0/og`);
    const res = await request.get(new URL(image!).pathname);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
    expect(res.headers()["x-robots-tag"]).toBe("noindex");
    writeFileSync("test-results/line-og-image.png", await res.body());
  });

  test("số câu không hợp lệ thì ảnh chung, không lỗi", async ({ request }) => {
    for (const path of [`/api/share/line/${E2E_VIDEO_ID}/999/og`, `/api/share/line/${E2E_VIDEO_ID}/abc/og`, "/api/share/line/bad!id/0/og"]) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
      expect(res.headers()["content-type"]).toContain("image/png");
    }
  });

  test("link sai định dạng hoặc bài chưa có trong kho vẫn có ảnh xem trước chung", async ({ request }) => {
    const res = await request.get("/learn/notInStore01/opengraph-image");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  });
});
