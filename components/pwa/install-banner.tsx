"use client";

import Link from "next/link";
import { useCallback, useSyncExternalStore } from "react";
import { ONBOARDED_KEY } from "@/components/home/onboarding-banner";
import { Icon } from "@/components/ui/icon";
import { shouldShowInstallBanner } from "@/lib/pwa/install-banner-state";
import { detectInstallPlatform, isStandaloneDisplay } from "@/lib/pwa/install-platform";
import { useInstallPrompt } from "./install-prompt-store";

const DISMISS_KEY = "lyric-lab-install-banner-dismissed";
const EVENT = "lyric-lab-install-banner-changed";

const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => { window.removeEventListener("storage", onChange); window.removeEventListener(EVENT, onChange); };
};

const read = (key: string): string | null => { try { return localStorage.getItem(key); } catch { return null; } };

/** Snapshot chuỗi ("show"/"hide") thay vì đối tượng, để useSyncExternalStore so sánh được giữa các lần gọi. */
function snapshot(): "show" | "hide" {
  try {
    // Người dùng thật không bao giờ có `navigator.webdriver`: trình duyệt tự động hoá (test e2e) không thấy biểu ngữ trừ khi test bật cờ, để không che các thao tác khác.
    if (navigator.webdriver && !(window as unknown as { __forceInstallBanner?: boolean }).__forceInstallBanner) return "hide";
    const dismissed = read(DISMISS_KEY);
    return shouldShowInstallBanner({
      platform: detectInstallPlatform(navigator.userAgent, navigator.platform, navigator.maxTouchPoints),
      standalone: isStandaloneDisplay(),
      onboarded: read(ONBOARDED_KEY) === "1",
      dismissedAt: dismissed ? Number(dismissed) || null : null,
      now: Date.now(),
    }) ? "show" : "hide";
  } catch {
    return "hide";
  }
}

/**
 * Lời mời cài SongHanzi lên màn hình chính, ở trang chủ trên điện thoại. Android + Chrome cho cài một chạm ngay tại đây; còn lại dẫn sang `/install` (hướng dẫn từng bước).
 * "Để sau" ẩn biểu ngữ 14 ngày. Không hiện khi đã cài, trên máy tính, hay khi người dùng mới chưa thiết lập xong (để họ làm quen trước).
 */
export function InstallBanner() {
  const state = useSyncExternalStore(subscribe, snapshot, () => "hide");
  const { canInstall, install } = useInstallPrompt();
  const dismiss = useCallback(() => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* không ghi được: lần sau hiện lại */ }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  if (state === "hide") return null;
  const button = "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-label-md font-semibold";
  return (
    <aside aria-label="Cài app lên điện thoại" className="mt-space-lg flex items-start gap-3 rounded-2xl bg-primary-container/30 p-space-md md:hidden">
      <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container"><Icon name="install_mobile" size={22} /></span>
      <div className="min-w-0 flex-1">
        <p className="text-body-md font-medium text-on-surface">Cài SongHanzi lên màn hình chính</p>
        <p className="text-label-md text-on-surface-variant">Mở nhanh bằng một chạm, toàn màn hình như một app thật.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {canInstall
            ? <button type="button" onClick={() => void install().then((ok) => { if (ok) dismiss(); })} className={`${button} bg-primary text-on-primary hover:brightness-110`}>Cài app</button>
            : <Link href="/install" className={`${button} bg-primary text-on-primary hover:brightness-110`}>Xem cách cài</Link>}
          <button type="button" onClick={dismiss} className={`${button} text-on-surface-variant hover:bg-surface-container`}>Để sau</button>
        </div>
      </div>
    </aside>
  );
}
