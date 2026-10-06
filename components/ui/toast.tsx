"use client";

import { useEffect } from "react";
import { Icon } from "./icon";

const AUTO_DISMISS_MS = 4000;
type ToastPlacement = "below-header" | "top-right";

/** Thông báo nổi góc trên-phải, tự biến mất — dùng cho phản hồi ngắn (gửi thành công…) không nên đẩy layout khi xuất hiện. */
export function Toast({ message, onDismiss, placement = "below-header" }: { message: string; onDismiss: () => void; placement?: ToastPlacement }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      role="status"
      className={`fixed right-4 ${placement === "top-right" ? "top-4" : "top-20"} z-[70] flex max-w-sm items-center gap-2 rounded-2xl bg-inverse-surface px-4 py-3 text-inverse-on-surface shadow-lg`}
    >
      <Icon name="check_circle" filled size={20} className="shrink-0 text-secondary" />
      <p className="text-body-md">{message}</p>
    </div>
  );
}
