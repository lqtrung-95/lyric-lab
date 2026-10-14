import { SongCard } from "@/components/library/song-card";
import type { LessonSummary } from "@/lib/video/video-repo";

const meta = (v: LessonSummary) =>
  [v.levelAvg !== null ? `HSK ~${v.levelAvg.toFixed(1)}` : null, `${v.lineCount} câu`, `${Math.max(1, Math.round(v.durationSec / 60))} phút`].filter(Boolean).join(" · ");

/** Lưới thẻ video. `extra` là ô cuối (ví dụ thẻ "Xem tất cả") nằm cùng hàng với các thẻ. */
export function VideoGrid({ videos, extra, columns = "lg:grid-cols-4" }: { videos: LessonSummary[]; extra?: React.ReactNode; columns?: string }) {
  return (
    <ul className={`grid grid-cols-1 gap-gutter sm:grid-cols-2 ${columns}`}>
      {videos.map((v) => (
        <li key={v.videoId}>
          <SongCard videoId={v.videoId} href={`/video/${v.videoId}`} title={v.title} channelTitle={v.channelTitle} meta={meta(v)} sizes="(min-width:1024px) 25vw, 50vw" />
        </li>
      ))}
      {extra && <li>{extra}</li>}
    </ul>
  );
}
