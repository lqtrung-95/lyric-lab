import type { Page } from "@playwright/test";

function b64url(obj: object): string {
  return Buffer.from(JSON.stringify(obj)).toString("base64url");
}

/**
 * Giả lập đăng nhập ẩn danh thành công mà không gọi Supabase thật: site key Turnstile chỉ khai domain production
 * trên Cloudflare, nên `getTurnstileToken()` luôn bỏ qua captcha khi chạy trên localhost (lib/auth/turnstile-token.ts)
 * — nhưng Supabase (Attack Protection) lại luôn đòi token, nên gọi signInAnonymously thật trên localhost chắc chắn
 * lỗi 400 captcha_failed. Chỉ đủ để qua điều kiện `ensureAnonymousSession()`, không tạo user thật trong Supabase
 * nên KHÔNG dùng được cho test cần ghi dữ liệu thật (những test đó đã có sẵn cách khác: xem seedCards).
 */
export async function stubAnonymousSession(page: Page) {
  const now = Math.floor(Date.now() / 1000);
  const accessToken = `${b64url({ alg: "HS256", typ: "JWT" })}.${b64url({
    sub: "00000000-0000-0000-0000-000000000000", role: "authenticated", aud: "authenticated",
    exp: now + 3600, iat: now, is_anonymous: true,
  })}.fake-signature`;
  await page.route("**/auth/v1/signup", (route) =>
    route.fulfill({
      json: {
        access_token: accessToken, token_type: "bearer", expires_in: 3600, expires_at: now + 3600,
        refresh_token: "fake-refresh-token",
        user: {
          id: "00000000-0000-0000-0000-000000000000", aud: "authenticated", role: "authenticated",
          is_anonymous: true, app_metadata: { provider: "anonymous", providers: ["anonymous"] }, user_metadata: {},
          identities: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        },
      },
    }));
}
