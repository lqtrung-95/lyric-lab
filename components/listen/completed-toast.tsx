"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";

interface CompletedToastProps {
  videoId: string;
  onDismiss: () => void;
}

/**
 * Nhắc nhẹ "Xem tổng kết" khi nghe hết bài, ghim ở góc màn hình nên thấy được dù đang đọc lời ở bất kỳ đâu
 * (banner đầy đủ ở đầu trang dễ bị cuộn khuất). Không tự cuộn trang: tránh giật màn hình như thanh điều khiển nhanh.
 */
export function CompletedToast({ videoId, onDismiss }: CompletedToastProps) {
  return (
    <div role="status" className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex justify-center sm:inset-x-auto sm:right-4 sm:justify-end">
      <div className="flex items-center gap-3 rounded-full bg-secondary py-2 pl-5 pr-2 text-on-secondary shadow-[0_8px_30px_rgba(20,10,5,0.35)]">
        <p className="text-label-md font-medium">Bạn đã nghe xong bài</p>
        <Link href={`/learn/${videoId}/summary`} className="inline-flex min-h-9 items-center rounded-full bg-on-secondary/15 px-4 text-label-md font-semibold hover:bg-on-secondary/25">
          Xem tổng kết
        </Link>
        <button type="button" onClick={onDismiss} aria-label="Đóng thông báo" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-on-secondary/15">
          <Icon name="close" size={18} />
        </button>
      </div>
    </div>
  );
}
