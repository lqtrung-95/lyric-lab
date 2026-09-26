"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { removeSongFromHistory, restoreSongToHistory, type RemovedSong } from "@/lib/user-state/song-history";

const UNDO_MS = 8000;

interface Pending {
  title: string;
  removed: RemovedSong;
}

/**
 * Xóa bài khỏi lịch sử: hỏi xác nhận trong hộp thoại, rồi cho hoàn tác thêm vài giây. `onChanged` được gọi sau khi xóa hoặc hoàn tác
 * để danh sách tải lại nếu nó giữ dữ liệu riêng (tab "Bài hát của tôi").
 */
export function useSongRemoval(onChanged?: () => void) {
  const [pending, setPending] = useState<Pending | null>(null);
  const [asking, setAsking] = useState<{ videoId: string; title: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const perform = useCallback(async (videoId: string, title: string) => {
    const removed = await removeSongFromHistory(videoId);
    clearTimeout(timer.current);
    setPending({ title, removed });
    timer.current = setTimeout(() => setPending(null), UNDO_MS);
    onChanged?.();
  }, [onChanged]);

  /** Mở hộp thoại xác nhận (chưa xóa gì). */
  const remove = useCallback((videoId: string, title: string) => setAsking({ videoId, title }), []);

  const confirmRemoval = useCallback(async () => {
    if (!asking) return;
    const { videoId, title } = asking;
    setAsking(null);
    await perform(videoId, title);
  }, [asking, perform]);

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
  const dialog = (
    <ConfirmDialog
      open={asking !== null}
      title="Bỏ bài này khỏi danh sách?"
      body={`“${asking?.title ?? ""}” sẽ biến khỏi "Bài hát gần đây" và "Bài hát của tôi", kèm tiến độ nghe. Từ đã lưu và thẻ ôn của bài vẫn được giữ.`}
      confirmLabel="Bỏ khỏi danh sách"
      onConfirm={confirmRemoval}
      onCancel={() => setAsking(null)}
    />
  );
  return { remove, toast, dialog };
}
