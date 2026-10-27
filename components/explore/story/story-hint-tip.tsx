"use client";

import { useSyncExternalStore } from "react";

const KEY = "songhanzi-story-tip-v1";
const listeners = new Set<() => void>();
let dismissedNow = false;
const subscribe = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; };
/** Đã bấm "Đã hiểu" (hoặc không đọc được kho lưu thì coi như đã ẩn, tránh hiện mãi). */
const isDismissed = (): boolean => {
  if (dismissedNow) return true;
  try { return window.localStorage.getItem(KEY) === "1"; } catch { return false; }
};

/** Lời nhắc nhỏ khi lần đầu chơi chế độ phá án: gợi ý (pinyin, nghĩa) đang tắt để luyện đọc, chỗ bật khi cần. Bấm "Đã hiểu" thì không hiện lại. */
export function StoryHintTip() {
  // Máy chủ coi như đã ẩn (không biết trình duyệt đã đọc chưa) để không lệch khi hiển thị lần đầu.
  const dismissed = useSyncExternalStore(subscribe, isDismissed, () => true);
  if (dismissed) return null;
  const dismiss = () => {
    dismissedNow = true;
    try { window.localStorage.setItem(KEY, "1"); } catch { /* không lưu được: chỉ ẩn lần này */ }
    listeners.forEach((l) => l());
  };
  return (
    <aside aria-label="Mẹo chơi" className="flex flex-col gap-2 rounded-2xl border-2 border-ink bg-secondary-container p-space-sm text-on-secondary-container sm:flex-row sm:items-center">
      <p className="min-w-0 flex-1 text-body-md"><strong>Mẹo luyện đọc:</strong> pinyin và nghĩa tiếng Việt đang tắt. Hãy thử đọc chữ Hán trước, chưa hiểu thì bấm nút <strong>Pinyin</strong> hoặc <strong>Nghĩa</strong> (trên thanh này hoặc ngay trong hội thoại). Lựa chọn của bạn được nhớ lại.</p>
      <button type="button" onClick={dismiss} className="min-h-11 shrink-0 rounded-full border-2 border-ink bg-surface-container-lowest px-4 text-label-md font-extrabold hover:bg-surface-container-low">Đã hiểu</button>
    </aside>
  );
}
