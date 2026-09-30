"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

// Bắt lỗi crash ở tầng gốc (ngoài mọi error.tsx con) — nơi cuối cùng React còn gọi được trước khi trắng trang.
// Phải tự vẽ lại <html>/<body> vì layout gốc không còn hoạt động khi file này được dùng.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="vi">
      <body className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#1c1611] px-6 text-center text-[#f2ece6]">
        <p className="font-serif text-2xl font-semibold">Có lỗi xảy ra</p>
        <p className="max-w-sm text-sm text-[#b8ada2]">Trang gặp sự cố ngoài ý muốn. Thử tải lại nhé, mình đã ghi nhận lỗi này.</p>
        <button type="button" onClick={reset} className="rounded-full bg-[#b03a2e] px-6 py-2 text-sm font-semibold text-white hover:opacity-90">
          Tải lại
        </button>
      </body>
    </html>
  );
}
