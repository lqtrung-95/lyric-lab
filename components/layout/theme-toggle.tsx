"use client";

import { useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/icon";

const STORAGE_KEY = "lyric-lab-theme";

// Trạng thái sáng/tối nằm ở class `dark` trên <html> (script trong layout áp dụng trước khi vẽ); component chỉ theo dõi nó.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
const isDark = () => document.documentElement.classList.contains("dark");

/** Đổi sáng/tối. Mặc định theo hệ thống; lựa chọn của người dùng được nhớ. */
export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // Chế độ riêng tư có thể chặn localStorage: vẫn đổi được trong phiên hiện tại.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
      className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high"
    >
      <Icon name={dark ? "light_mode" : "dark_mode"} size={22} />
    </button>
  );
}
