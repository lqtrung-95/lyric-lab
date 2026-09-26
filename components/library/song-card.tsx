import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { videoThumbnailUrl } from "@/lib/youtube/video-thumbnail";

interface SongCardProps {
  videoId: string;
  title: string;
  channelTitle: string;
  /** Có thì hiện thanh tiến độ nghe (thư viện); không có thì hiện nút phát trên ảnh (trang chủ). */
  progress?: { fraction: number; label: string };
  sizes: string;
}

/**
 * Thẻ bài hát dùng chung cho trang chủ và thư viện. Thẻ luôn cao bằng nhau trong một hàng: tiêu đề chiếm chỗ 2 dòng
 * và phần chân (kênh, tiến độ) dính đáy, nên bài có tiêu đề ngắn hay dài đều thẳng hàng.
 */
export function SongCard({ videoId, title, channelTitle, progress, sizes }: SongCardProps) {
  return (
    <Link
      href={`/learn/${videoId}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[0_1px_8px_rgba(30,26,22,0.06)] transition-shadow hover:shadow-[0_4px_16px_rgba(30,26,22,0.1)]"
    >
      <div className="relative aspect-video shrink-0 bg-surface-container-high">
        <Image src={videoThumbnailUrl(videoId, "mqdefault")} alt="" fill sizes={sizes} className="object-cover" />
        {!progress && (
          <span className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
            <Icon name="play_arrow" filled size={20} />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-space-md">
        <p className="line-clamp-2 min-h-12 text-body-md font-medium text-on-surface">{title}</p>
        <p className="mt-1 truncate text-label-md text-on-surface-variant">{channelTitle}</p>
        {progress && (
          <div className="mt-auto flex items-center gap-2 pt-space-sm">
            <div
              role="progressbar" aria-label="Tiến độ nghe" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress.fraction * 100)}
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container-highest"
            >
              <div className="h-full bg-primary" style={{ width: `${progress.fraction * 100}%` }} />
            </div>
            <span className="shrink-0 text-label-sm text-on-surface-variant">{progress.label}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
