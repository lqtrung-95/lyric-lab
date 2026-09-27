import { expect, test } from "@playwright/test";

// Chỉ chạy khi có site key (dùng khóa thử "luôn qua" của Cloudflare: 1x00000000000000000000AA):
//   NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA npx playwright test tests/e2e/turnstile.spec.ts
test.skip(!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY, "cần NEXT_PUBLIC_TURNSTILE_SITE_KEY");

test("đăng nhập ẩn danh gửi kèm token Turnstile", async ({ page }) => {
  const bodies: string[] = [];
  page.on("request", (r) => { if (r.url().includes("/auth/v1/signup")) bodies.push(r.postData() ?? ""); });
  await page.goto("/review/leaderboard");
  await page.getByLabel(/Biệt danh hiển thị/).fill(`Cap${Date.now().toString(36)}`.slice(0, 20));
  await page.getByRole("button", { name: "Tham gia" }).click();
  await expect.poll(() => bodies.length, { timeout: 30_000 }).toBeGreaterThan(0);
  expect(JSON.parse(bodies[0]).gotrue_meta_security.captcha_token).toBeTruthy();
});
