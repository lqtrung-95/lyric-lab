import { expect, test } from "@playwright/test";

test("trang chủ hiển thị tiêu đề và điều hướng chính", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("nhớ cả trăm chữ Hán");
  await expect(page.getByRole("link", { name: "Lyric Lab" })).toBeVisible();
});

test("giao diện tối bật được và được nhớ sau khi tải lại", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Chuyển sang giao diện tối" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("trang bài học đặt noindex", async ({ page }) => {
  await page.goto("/learn/dQw4w9WgXcQ");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("trang giới thiệu: có demo, thanh điều hướng riêng và nút vào app", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Mở app" }).first()).toHaveAttribute("href", "/app");
  await expect(page.getByRole("navigation", { name: "Các phần của trang" }).getByRole("link", { name: "Tính năng" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Bấm vào một từ được tô sáng" })).toBeVisible();
  // Bấm một từ trong demo đổi thẻ từ bên cạnh.
  await page.getByRole("button", { name: "Xem thẻ từ 从来" }).first().click();
  await expect(page.getByRole("article").getByRole("heading", { name: "从来" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Bài hát gần đây" })).toHaveCount(0);
});

test("trang giới thiệu chỉ mục được, trang app thì noindex", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /Lyric Lab/);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
  const image = new URL((await page.locator('meta[property="og:image"]').getAttribute("content"))!);
  const og = await request.get(image.pathname + image.search);
  expect(og.ok()).toBe(true);
  expect(og.headers()["content-type"]).toContain("image/png");
  await page.goto("/app");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /learn/");
  expect(robots).toContain("Sitemap:");
  expect((await request.get("/sitemap.xml")).ok()).toBe(true);
});

test("đã có phiên (cookie Supabase) vào '/' thì tự chuyển sang /app; ?landing để xem lại trang giới thiệu", async ({ page, context }) => {
  await context.addCookies([{ name: "sb-test-auth-token", value: "x", url: "http://localhost:3100" }]);
  await page.goto("/");
  await expect(page).toHaveURL(/\/app$/);
  await page.goto("/?landing");
  await expect(page).toHaveURL(/\/\?landing$/);
  await expect(page.getByRole("heading", { name: "Bấm vào một từ được tô sáng" })).toBeVisible();
});

test.describe("hiệu ứng hiện dần trên trang giới thiệu", () => {
  test("khối dưới màn hình bắt đầu ẩn và hiện ra khi cuộn tới", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const faq = page.locator("[data-reveal]").filter({ has: page.locator("#faq") });
    await expect(faq).toHaveAttribute("data-reveal", "hidden");
    await page.locator("#faq").scrollIntoViewIfNeeded();
    await expect(faq).toHaveAttribute("data-reveal", "shown");
    await expect(faq).toBeVisible();
  });

  test("giảm chuyển động: không ẩn khối nào và không có animation", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce", baseURL: "http://localhost:3100" });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator('[data-reveal="hidden"]')).toHaveCount(0);
    const animation = await page.locator(".anim-float").first().evaluate((el) => getComputedStyle(el).animationName);
    expect(animation).toBe("none");
    await context.close();
  });
});
