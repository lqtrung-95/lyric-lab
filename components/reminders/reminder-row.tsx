"use client";

import { SettingRow } from "@/components/settings/settings-card";
import { useReminders } from "./use-reminders";

/** Dòng "Nhắc học mỗi ngày" trong Cài đặt: bật/tắt thông báo đẩy lúc 20:00. Ẩn khi thiết bị hoặc server không hỗ trợ. */
export function ReminderRow() {
  const { status, busy, enable, disable } = useReminders();
  if (status === "loading" || status === "unsupported") return null;
  const on = status === "on";
  const hint = status === "denied" ? "Trình duyệt đang chặn thông báo. Mở cài đặt trang web để cho phép." : "Một thông báo lúc 20:00 nếu hôm nay bạn chưa học. Trên iPhone cần cài app vào màn hình chính.";
  return (
    <SettingRow label="Nhắc học mỗi ngày" hint={hint}>
      <button
        type="button" role="switch" aria-checked={on} aria-label="Nhắc học mỗi ngày"
        disabled={busy || status === "denied"} onClick={() => void (on ? disable() : enable())}
        className={`inline-flex min-h-11 min-w-20 items-center justify-center rounded-full px-4 text-label-md font-semibold transition-colors disabled:opacity-50 ${on ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"}`}
      >
        {on ? "Đang bật" : "Bật"}
      </button>
    </SettingRow>
  );
}
