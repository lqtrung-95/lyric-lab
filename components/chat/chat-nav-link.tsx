"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { useChatStatus } from "./use-chat-status";

/** Biểu tượng Cộng đồng ở thanh trên; có chấm khi có tin mới hơn tin đã xem (không hiện chấm khi đang ở chính trang chat). */
export function ChatNavLink() {
  const { hasUnread } = useChatStatus();
  const onChat = usePathname() === "/chat";
  const dot = hasUnread && !onChat;
  return (
    <Link href="/chat" aria-label={dot ? "Cộng đồng, có tin mới" : "Cộng đồng"} title="Cộng đồng" className="relative flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface">
      <Icon name="forum" size={20} />
      {dot && <span aria-hidden data-testid="chat-unread-dot" className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-surface" />}
    </Link>
  );
}
