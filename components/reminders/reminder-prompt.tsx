"use client";

import { useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/icon";
import { useReminders } from "./use-reminders";

const DISMISS_KEY = "lyric-lab-reminder-dismissed";
const subscribe = (cb: () => void) => { window.addEventListener("lyric-lab-reminder-dismissed", cb); return () => window.removeEventListener("lyric-lab-reminder-dismissed", cb); };
const readDismissed = () => { try { return localStorage.getItem(DISMISS_KEY) === "1"; } catch { return false; } };

/** Gợi ý một lần ở trang chủ: bật nhắc học. Chỉ hiện khi thiết bị hỗ trợ, chưa bật, chưa bị chặn và chưa từng bấm "Để sau". */
export function ReminderPrompt() {
  const { status, busy, enable } = useReminders();
  const dismissed = useSyncExternalStore(subscribe, readDismissed, () => true);
  if (status !== "off" || dismissed) return null;

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* không lưu được thì chỉ ẩn trong lần này */ }
    window.dispatchEvent(new Event("lyric-lab-reminder-dismissed"));
  };
  return (
    <section aria-label="Nhắc học" className="mt-space-md flex flex-wrap items-center gap-3 rounded-2xl bg-surface-container-low p-space-md">
      <Icon name="schedule" size={22} className="text-primary" />
      <p className="min-w-0 flex-1 text-body-md text-on-surface">Muốn được nhắc học mỗi tối (20:00) khi bạn chưa học trong ngày?</p>
      <button type="button" disabled={busy} onClick={() => void enable().then((ok) => ok && dismiss())} className="min-h-11 rounded-full bg-primary px-5 text-label-md font-semibold text-on-primary hover:bg-primary-container disabled:opacity-60">Bật nhắc học</button>
      <button type="button" onClick={dismiss} className="min-h-11 rounded-full px-4 text-label-md font-medium text-on-surface-variant hover:bg-surface-container-high">Để sau</button>
    </section>
  );
}
