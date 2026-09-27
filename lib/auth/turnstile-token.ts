// Cloudflare Turnstile cho đăng nhập ẩn danh: Supabase (Authentication → Attack Protection) kiểm tra token này phía server
// để chặn việc tạo hàng loạt tài khoản ẩn danh nhằm lách hạn mức. Chưa đặt site key thì không dùng captcha (chạy như cũ).
interface TurnstileApi {
  render(el: HTMLElement, opts: {
    sitekey: string; appearance: "interaction-only"; callback(token: string): void; "error-callback"(): void; "expired-callback"(): void;
  }): string;
  remove(id: string): void;
}
declare global {
  interface Window { turnstile?: TurnstileApi }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const TIMEOUT_MS = 20_000;

export const turnstileSiteKey = (): string | undefined => process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined;

let scriptPromise: Promise<void> | null = null;
function loadScript(): Promise<void> {
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => { scriptPromise = null; reject(new Error("turnstile script failed")); };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/**
 * Lấy token Turnstile cho một lần đăng nhập ẩn danh. Không có site key → undefined (bỏ qua captcha).
 * Widget chỉ hiện khi Cloudflare cần người dùng tương tác; lỗi hoặc quá 20 giây thì từ chối để nơi gọi báo lỗi.
 */
export async function getTurnstileToken(): Promise<string | undefined> {
  const sitekey = turnstileSiteKey();
  if (!sitekey) return undefined;
  await loadScript();

  const host = document.createElement("div");
  host.setAttribute("data-turnstile-host", "");
  host.style.cssText = "position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:100";
  document.body.appendChild(host);
  let widgetId = "";
  try {
    return await new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("turnstile timeout")), TIMEOUT_MS);
      const fail = () => { clearTimeout(timer); reject(new Error("turnstile failed")); };
      widgetId = window.turnstile!.render(host, {
        sitekey, appearance: "interaction-only",
        callback: (token) => { clearTimeout(timer); resolve(token); },
        "error-callback": fail, "expired-callback": fail,
      });
    });
  } finally {
    if (widgetId) window.turnstile?.remove(widgetId);
    host.remove();
  }
}
