import * as Sentry from "@sentry/nextjs";

// Next.js gọi register() một lần lúc khởi động server; nạp đúng cấu hình Sentry theo runtime đang chạy.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") await import("./sentry.server.config");
  if (process.env.NEXT_RUNTIME === "edge") await import("./sentry.edge.config");
}

// Bắt lỗi ném ra trong Server Component/Route Handler mà Next.js tự xử lý (không lọt qua try/catch của mình).
export const onRequestError = Sentry.captureRequestError;
