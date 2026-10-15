"use client";

import { useSyncExternalStore } from "react";

// Chromium (Chrome/Edge trên Android và máy tính) bắn `beforeinstallprompt` MỘT lần khi app đủ điều kiện cài; nếu không giữ lại thì người mở trang hướng dẫn bằng
// chuyển trang trong app sẽ lỡ mất sự kiện. `InstallPromptCapture` (gắn ở khung trang chính) giữ sự kiện ở đây để nút "Cài app ngay" dùng được ở bất cứ trang nào.
interface BeforeInstallPromptEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> }

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

let capturing = false;

/**
 * Bắt đầu nghe sự kiện cài app (chỉ đăng ký một lần cho cả trang, gọi lại không sao). Được gọi ngay khi mã này được tải (không chờ React gắn thành phần) vì Chromium
 * có thể bắn sự kiện sớm sau khi trang tải xong.
 */
export function startInstallPromptCapture(): void {
  if (capturing || typeof window === "undefined") return;
  capturing = true;
  const onPrompt = (e: Event) => { e.preventDefault(); deferred = e as BeforeInstallPromptEvent; emit(); };
  const onInstalled = () => { deferred = null; emit(); };
  window.addEventListener("beforeinstallprompt", onPrompt);
  window.addEventListener("appinstalled", onInstalled);
}

startInstallPromptCapture();

const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

/** `canInstall`: trình duyệt cho cài bằng một chạm; `install()` mở hộp thoại cài của trình duyệt và trả true nếu người dùng đồng ý. */
export function useInstallPrompt() {
  const canInstall = useSyncExternalStore(subscribe, () => deferred !== null, () => false);
  async function install(): Promise<boolean> {
    const event = deferred;
    if (!event) return false;
    await event.prompt();
    const { outcome } = await event.userChoice;
    deferred = null; // mỗi sự kiện chỉ dùng được một lần
    emit();
    return outcome === "accepted";
  }
  return { canInstall, install };
}
