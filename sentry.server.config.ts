import * as Sentry from "@sentry/nextjs";

// DSN không phải bí mật (an toàn để lộ công khai) nhưng dùng chung biến NEXT_PUBLIC_SENTRY_DSN với phía client cho gọn.
// Để trống thì Sentry không khởi tạo, không ảnh hưởng build/dev khi chưa có project Sentry.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    // 10% request được lấy mẫu để theo dõi hiệu năng, đủ để phát hiện bất thường mà không tốn quota gói free.
    tracesSampleRate: 0.1,
  });
}
