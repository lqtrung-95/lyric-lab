"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRecentSongs } from "@/components/home/use-recent-songs";
import { useRecommendedSongs } from "@/components/home/use-home-data";
import { Icon } from "@/components/ui/icon";
import { useLearnerState } from "@/lib/user-state/use-learner-state";

interface CompletedToastProps {
  videoId: string;
  onDismiss: () => void;
}

/**
 * Nhắc nhẹ khi nghe hết bài, ghim ở góc màn hình nên thấy được dù đang đọc lời ở bất kỳ đâu (banner đầy đủ ở đầu trang dễ bị cuộn khuất):
 * "Xem tổng kết" và, nếu có, "Bài tiếp theo" (một bài hợp level chưa nghe) để học liền mạch như autoplay. Không tự cuộn trang.
 */
export function CompletedToast({ videoId, onDismiss }: CompletedToastProps) {
  const { state } = useLearnerState();
  const { songs: recent } = useRecentSongs();
  const openedIds = useMemo(() => (recent === null ? null : recent.map((s) => s.videoId)), [recent]);
  const next = useRecommendedSongs(state.level, openedIds)?.find((s) => s.videoId !== videoId);
  const pill = "inline-flex min-h-9 items-center rounded-full bg-on-secondary/15 px-4 text-label-md font-semibold hover:bg-on-secondary/25";

  return (
    <div role="status" className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex justify-center sm:inset-x-auto sm:right-4 sm:justify-end">
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-3xl bg-secondary py-2 pl-5 pr-2 text-on-secondary shadow-[0_8px_30px_rgba(20,10,5,0.35)]">
        <p className="text-label-md font-medium">Bạn đã nghe xong bài</p>
        <Link href={`/learn/${videoId}/summary`} className={pill}>Xem tổng kết</Link>
        {next && <Link href={`/learn/${next.videoId}`} className={`${pill} gap-1`}>Bài tiếp theo<Icon name="arrow_forward" size={16} /></Link>}
        <button type="button" onClick={onDismiss} aria-label="Đóng thông báo" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-on-secondary/15">
          <Icon name="close" size={18} />
        </button>
      </div>
    </div>
  );
}
