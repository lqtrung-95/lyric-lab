"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { ChatThread } from "./chat-thread";
import { useChatStatus } from "./use-chat-status";

// Chỉ hiện ở các trang liệt kê/làm việc chung. Không hiện ở trang chat (đã là chat), phòng thi đấu/thử thách (đang chơi), cài đặt, quản trị. Màn học video và nghe bài hát nằm ngoài nhóm
// layout này nên tự không có (trình phát dính và phím tắt ở đó dễ vướng bong bóng).
const SHOW_ON = [/^\/app$/, /^\/review(\/|$)/, /^\/video(\/add)?$/, /^\/library(\/|$)/];

/**
 * Bong bóng chat cộng đồng nổi ở góc phải dưới (đặt cao hơn thanh tab dưới trên điện thoại). Bấm mở khung chat nhỏ (điện thoại: toàn màn hình), có chấm khi có tin mới,
 * nút "Mở rộng" sang trang `/chat`, Esc hoặc nút đóng để thu lại. Cuộc trò chuyện chỉ được dựng (và hỏi tin mới) khi khung đang mở; lúc thu lại chỉ có bộ hỏi trạng thái dùng chung.
 */
export function ChatBubble() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { hasUnread } = useChatStatus();
  const bubble = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const visible = SHOW_ON.some((re) => re.test(pathname));

  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || document.querySelector("dialog[open]")) return; // Esc đang đóng hộp xác nhận thì không đóng cả khung
      setOpen(false);
      bubble.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!visible) return null;
  return (
    <>
      {open && (
        <div
          ref={panel} role="dialog" aria-label="Chat cộng đồng" tabIndex={-1}
          className="fixed inset-0 z-[60] flex flex-col gap-2 bg-surface p-3 pt-safe pb-safe outline-none md:inset-auto md:bottom-24 md:right-6 md:h-[34rem] md:w-96 md:rounded-3xl md:shadow-[0_12px_40px_-8px_rgba(30,26,22,0.35)] md:ring-1 md:ring-outline-variant"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-serif text-headline-md">Cộng đồng</h2>
            <div className="flex">
              <Link href="/chat" onClick={() => setOpen(false)} aria-label="Mở rộng sang trang Cộng đồng" title="Mở rộng" className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface">
                <Icon name="open_in_full" size={20} />
              </Link>
              <button type="button" aria-label="Đóng chat" title="Đóng" onClick={() => { setOpen(false); bubble.current?.focus(); }} className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface">
                <Icon name="close" size={22} />
              </button>
            </div>
          </div>
          <ChatThread listClassName="h-full" />
        </div>
      )}
      <button
        ref={bubble} type="button" aria-expanded={open} aria-label={hasUnread && !open ? "Mở chat cộng đồng, có tin mới" : "Mở chat cộng đồng"} onClick={() => setOpen((o) => !o)}
        className={`fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-[0_6px_20px_-4px_rgba(30,26,22,0.45)] transition-transform hover:scale-105 md:bottom-6 md:right-6 ${open ? "max-md:hidden" : ""}`}
      >
        <Icon name="forum" size={26} filled />
        {hasUnread && !open && <span aria-hidden data-testid="chat-bubble-dot" className="absolute right-1 top-1 h-3.5 w-3.5 rounded-full bg-error ring-2 ring-surface" />}
      </button>
    </>
  );
}
