"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { removeSongFromHistory, restoreSongToHistory, type RemovedSong } from "@/lib/user-state/song-history";

const UNDO_MS = 8000;

interface Pending {
  title: string;
  removed: RemovedSong;
}

/**
 * Xóa bài khỏi lịch sử kèm cơ hội hoàn tác trong vài giây. `onChanged` được gọi sau khi xóa hoặc hoàn tác
 * để danh sách tải lại nếu nó giữ dữ liệu riêng (tab "Bài hát của tôi").
 */
export function useSongRemoval(onChanged?: () => void) {
  const [pending, setPending] = useState<Pending | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const remove = useCallback(async (videoId: string, title: string) => {
    const removed = await removeSongFromHistory(videoId);
    clearTimeout(timer.current);
    setPending({ title, removed });
    timer.current = setTimeout(() => setPending(null), UNDO_MS);
    onChanged?.();
  }, [onChanged]);

  const undo = useCallback(async () => {
    if (!pending) return;
    clearTimeout(timer.current);
    const { removed } = pending;
    setPending(null);
    await restoreSongToHistory(removed);
    onChanged?.();
  }, [pending, onChanged]);

  const toast = pending && (
    <div role="status" className="fixed inset-x-gutter bottom-24 z-[60] mx-auto flex max-w-md items-center justify-between gap-3 rounded-full bg-inverse-surface py-2 pl-5 pr-2 text-inverse-on-surface shadow-lg md:bottom-8">
      <span className="line-clamp-1 text-label-md">Đã bỏ “{pending.title}” khỏi danh sách</span>
      <button type="button" onClick={undo} className="min-h-11 shrink-0 rounded-full px-4 text-label-md font-semibold text-inverse-primary hover:bg-inverse-on-surface/10">Hoàn tác</button>
    </div>
  );
  return { remove, toast };
}
