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

/** Đang ở giao diện tối không (theo class `dark` trên <html>). Dùng chung cho nút trên thanh trên và dòng trong menu điện thoại. */
export function useIsDark(): boolean {
  return useSyncExternalStore(subscribe, isDark, () => false);
}

/** Đảo sáng/tối và nhớ lựa chọn. */
export function toggleTheme() {
  const next = !isDark();
  document.documentElement.classList.toggle("dark", next);
  try {
    localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
  } catch {
    // Chế độ riêng tư có thể chặn localStorage: vẫn đổi được trong phiên hiện tại.
  }
}

/** Đổi sáng/tối. Mặc định theo hệ thống; lựa chọn của người dùng được nhớ. */
export function ThemeToggle() {
  const dark = useIsDark();
  const toggle = toggleTheme;

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
