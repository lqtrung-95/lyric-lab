import * as Sentry from "@sentry/nextjs";

// Next.js tự nạp file này ở phía trình duyệt (không cần khai báo thêm). Cùng quy ước với sentry.server.config.ts:
// để trống NEXT_PUBLIC_SENTRY_DSN thì không khởi tạo, không ảnh hưởng khi chưa có project Sentry.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  Sentry.init({ dsn, tracesSampleRate: 0.1 });
}
