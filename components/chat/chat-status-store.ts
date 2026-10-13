"use client";

import type { ChatStatus } from "@/lib/chat/chat-types";

/**
 * Trạng thái chat dùng chung cho mọi nơi trên trang (chấm tin mới ở thanh trên, banner thông báo ở trang chủ): MỘT bộ hỏi định kỳ cho tất cả, chỉ chạy khi có nơi đang dùng
 * và tab đang hiện. Id tin đã xem và thông báo đã đóng nhớ trong localStorage (theo từng trình duyệt).
 */
export interface ChatStatusState {
  status: ChatStatus | null;
  seenId: number;
  dismissedAnnouncementId: number;
}

const SEEN_KEY = "songhanzi-chat-seen";
const DISMISSED_KEY = "songhanzi-chat-dismissed-announcement";
const POLL_MS = 60_000;

const readNumber = (key: string) => {
  try {
    const v = Number(localStorage.getItem(key));
    return Number.isFinite(v) && v > 0 ? v : 0;
  } catch {
    return 0;
  }
};
const writeNumber = (key: string, value: number) => {
  try { localStorage.setItem(key, String(value)); } catch { /* không lưu được: chấm tin mới có thể hiện lại, không sao */ }
};

export const SERVER_STATE: ChatStatusState = { status: null, seenId: 0, dismissedAnnouncementId: 0 };
let state: ChatStatusState = SERVER_STATE;
let loaded = false;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function set(next: ChatStatusState) {
  state = next;
  listeners.forEach((l) => l());
}

async function poll() {
  if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
  try {
    const res = await fetch("/api/chat/status", { cache: "no-store" });
    if (!res.ok) return;
    set({ ...state, status: (await res.json()) as ChatStatus });
  } catch { /* mạng lỗi: lần hỏi sau thử lại */ }
}

const onVisible = () => { if (document.visibilityState === "visible") void poll(); };

export function subscribe(listener: () => void): () => void {
  if (!loaded) {
    loaded = true;
    state = { ...state, seenId: readNumber(SEEN_KEY), dismissedAnnouncementId: readNumber(DISMISSED_KEY) };
  }
  listeners.add(listener);
  if (listeners.size === 1) {
    void poll();
    timer = setInterval(() => void poll(), POLL_MS);
    document.addEventListener("visibilitychange", onVisible);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      if (timer) clearInterval(timer);
      timer = null;
      document.removeEventListener("visibilitychange", onVisible);
    }
  };
}

export const getSnapshot = () => state;
export const getServerSnapshot = () => SERVER_STATE;

/** Đánh dấu đã xem tới tin `id` (chỉ tăng). */
export function markChatSeen(id: number) {
  if (id <= state.seenId) return;
  writeNumber(SEEN_KEY, id);
  set({ ...state, seenId: id });
}

export function dismissAnnouncement(id: number) {
  if (id <= state.dismissedAnnouncementId) return;
  writeNumber(DISMISSED_KEY, id);
  set({ ...state, dismissedAnnouncementId: id });
}
