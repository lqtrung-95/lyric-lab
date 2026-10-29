import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { channelHref } from "@/lib/video/group-by-channel";

/** Thẻ cuối hàng của mỗi kênh ở trang Video: dẫn sang trang liệt kê mọi video của kênh. Rộng đúng một ô lưới, cao bằng các thẻ cùng hàng: KHÔNG dùng `aspect-video` cùng `h-full` vì chiều rộng suy ra từ chiều cao thẻ cả hàng (~350px) sẽ tràn khỏi ô và làm trang cuộn ngang. */
export function ChannelSeeAllCard({ channelTitle, total }: { channelTitle: string; total: number }) {
  return (
    <Link href={channelHref(channelTitle)} aria-label={`Xem tất cả ${total} video của kênh ${channelTitle || "khác"}`}
      className="flex h-full min-h-32 w-full flex-col items-center justify-center gap-1 rounded-2xl bg-surface-container-low text-on-surface shadow-[0_1px_8px_rgba(30,26,22,0.06)] transition-colors hover:bg-surface-container-high">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-container text-on-primary-container"><Icon name="chevron_right" size={24} /></span>
      <span className="text-label-md font-semibold">Xem tất cả</span>
      <span className="text-label-sm text-on-surface-variant">{total} bài học</span>
    </Link>
  );
}
