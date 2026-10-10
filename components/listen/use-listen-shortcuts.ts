"use client";

import { useEffect } from "react";
import { resolveShortcut, type ShortcutAction } from "@/lib/listen/keyboard-shortcuts";

/** Gắn phím tắt cho màn Nghe (bài hát) và màn Xem (video): mỗi hành động là một hàm do màn truyền vào. `enabled` = false thì tạm tắt (màn có nhiều tab, chỉ tab đang dùng phím tắt mới bật). */
export function useListenShortcuts(handlers: Record<ShortcutAction, () => void>, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    function onKey(e: KeyboardEvent) {
      const action = resolveShortcut({ key: e.key, ctrlKey: e.ctrlKey, metaKey: e.metaKey, altKey: e.altKey, target: e.target as HTMLElement | null });
      if (!action) return;
      e.preventDefault();
      handlers[action]();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handlers, enabled]);
}
