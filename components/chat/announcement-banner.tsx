"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { dismissAnnouncement } from "./chat-status-store";
import { useChatStatus } from "./use-chat-status";

/** Banner thông báo mới nhất của admin ở trang chủ (cho người không mở chat). Đóng được; xem chat cũng coi như đã đọc. */
export function AnnouncementBanner() {
  const { announcement } = useChatStatus();
  if (!announcement) return null;
  return (
    <section aria-label="Thông báo từ SongHanzi" className="mb-space-md flex items-start gap-3 rounded-2xl bg-secondary-container p-space-md text-on-secondary-container">
      <Icon name="campaign" size={24} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-label-sm font-semibold uppercase tracking-wide">Thông báo từ {announcement.nickname}</p>
        <p className="mt-0.5 line-clamp-3 whitespace-pre-wrap break-words text-body-md">{announcement.body}</p>
        <Link href="/chat" className="mt-1 inline-flex min-h-11 items-center text-label-md font-semibold underline underline-offset-2">Xem trong Cộng đồng</Link>
      </div>
      <button type="button" aria-label="Đóng thông báo" onClick={() => dismissAnnouncement(announcement.id)} className="-m-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-black/10">
        <Icon name="close" size={20} />
      </button>
    </section>
  );
}
