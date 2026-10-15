"use client";

import "./install-prompt-store"; // đăng ký bộ nghe sự kiện ngay khi mã được tải

/** Không vẽ gì: giữ sự kiện `beforeinstallprompt` của trình duyệt ngay từ lúc vào app để trang "Cài app" dùng được nút cài một chạm. */
export function InstallPromptCapture() {
  return null;
}
