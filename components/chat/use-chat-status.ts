"use client";

import { useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, subscribe } from "./chat-status-store";

/** Chấm "có tin mới" (tin mới hơn tin đã xem) và thông báo mới nhất chưa xem/chưa đóng. */
export function useChatStatus() {
  const { status, seenId, dismissedAnnouncementId } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hasUnread = !!status && status.latestId > seenId;
  const announcement = status?.announcement && status.announcement.id > Math.max(seenId, dismissedAnnouncementId) ? status.announcement : null;
  return { hasUnread, announcement };
}
