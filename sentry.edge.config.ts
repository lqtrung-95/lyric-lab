import * as Sentry from "@sentry/nextjs";

// Cấu hình riêng cho runtime Edge (middleware, route chạy trên Edge). Cùng quy ước với sentry.server.config.ts.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  Sentry.init({ dsn, tracesSampleRate: 0.1 });
}
