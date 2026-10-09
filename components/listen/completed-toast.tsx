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
  // Điện thoại: thẻ rộng gần hết bề ngang, hàng trên là lời nhắc + nút đóng, hàng dưới chia đều các nút (một nút thì rộng cả hàng); đứng trên thanh "Đang hát"
  // (bottom sheet thu gọn, ~64px) để không che nó. Từ sm trở lên gộp thành một hàng ở góc phải như cũ.
  const pill = "inline-flex min-h-11 flex-1 items-center justify-center gap-1 rounded-full px-4 text-label-md font-semibold whitespace-nowrap sm:flex-none";

  return (
    <div role="status" className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] z-40 sm:inset-x-auto sm:right-4 lg:bottom-4">
      <div className="flex flex-col gap-2 rounded-3xl bg-secondary p-3 pl-4 text-on-secondary shadow-[0_8px_30px_rgba(20,10,5,0.35)] sm:flex-row sm:items-center sm:gap-3 sm:py-2 sm:pr-2">
        <div className="flex items-center justify-between gap-2 sm:contents">
          <p className="flex items-center gap-2 text-label-md font-medium"><Icon name="check_circle" filled size={20} />Bạn đã nghe xong bài</p>
          <button type="button" onClick={onDismiss} aria-label="Đóng thông báo" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-on-secondary/15 sm:order-last sm:h-9 sm:w-9">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="flex gap-2 pr-1 sm:pr-0">
          <Link href={`/learn/${videoId}/summary`} className={`${pill} bg-on-secondary/15 hover:bg-on-secondary/25`}>Xem tổng kết</Link>
          {next && <Link href={`/learn/${next.videoId}`} className={`${pill} bg-on-secondary text-secondary hover:bg-on-secondary/90`}>Bài tiếp theo<Icon name="arrow_forward" size={16} /></Link>}
        </div>
      </div>
    </div>
  );
}
