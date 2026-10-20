import { expect, test } from "@playwright/test";

// Chỉ chạy khi có site key (dùng khóa thử "luôn qua" của Cloudflare: 1x00000000000000000000AA):
//   NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA npx playwright test tests/e2e/turnstile.spec.ts
// Từ khi `getTurnstileToken` bỏ qua captcha trên host phát triển (localhost), test này không còn kiểm được ở e2e cục bộ (token luôn vắng); chỉ chạy được trên domain đã khai báo ở Cloudflare.
test.skip(!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || /localhost|127\.0\.0\.1/.test(process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost"), "Turnstile bị bỏ qua trên localhost");

test("đăng nhập ẩn danh gửi kèm token Turnstile", async ({ page }) => {
  const bodies: string[] = [];
  page.on("request", (r) => { if (r.url().includes("/auth/v1/signup")) bodies.push(r.postData() ?? ""); });
  await page.goto("/review/leaderboard");
  await page.getByLabel(/Biệt danh hiển thị/).fill(`Cap${Date.now().toString(36)}`.slice(0, 20));
  await page.getByRole("button", { name: "Tham gia" }).click();
  await expect.poll(() => bodies.length, { timeout: 30_000 }).toBeGreaterThan(0);
  expect(JSON.parse(bodies[0]).gotrue_meta_security.captcha_token).toBeTruthy();
});
