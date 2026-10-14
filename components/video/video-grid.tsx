import { SongCard } from "@/components/library/song-card";
import { SongLikeButton } from "@/components/library/song-like-button";
import { toggleVideoLike } from "@/lib/user-data/video-likes-repo";
import type { LessonSummary } from "@/lib/video/video-repo";

const meta = (v: LessonSummary) =>
  [v.levelAvg !== null ? `HSK ~${v.levelAvg.toFixed(1)}` : null, `${v.lineCount} câu`, `${Math.max(1, Math.round(v.durationSec / 60))} phút`].filter(Boolean).join(" · ");

/** Tim yêu thích: tập video đã thích và hàm cập nhật (từ `useLikedVideos`). Không truyền thì thẻ không có nút tim. */
export interface VideoLikes { liked: Set<string>; setLiked: (videoId: string, value: boolean) => void }

/** Lưới thẻ video. `extra` là ô cuối (ví dụ thẻ "Xem tất cả") nằm cùng hàng với các thẻ. */
export function VideoGrid({ videos, extra, columns = "lg:grid-cols-4", likes }: { videos: LessonSummary[]; extra?: React.ReactNode; columns?: string; likes?: VideoLikes }) {
  return (
    <ul className={`grid grid-cols-1 gap-gutter sm:grid-cols-2 ${columns}`}>
      {videos.map((v) => (
        <li key={v.videoId}>
          <SongCard videoId={v.videoId} href={`/video/${v.videoId}`} title={v.title} channelTitle={v.channelTitle} meta={meta(v)} sizes="(min-width:1024px) 25vw, 50vw"
            likeButton={likes && <SongLikeButton videoId={v.videoId} liked={likes.liked.has(v.videoId)} onChange={(value) => likes.setLiked(v.videoId, value)} toggle={toggleVideoLike} noun="video" />} />
        </li>
      ))}
      {extra && <li>{extra}</li>}
    </ul>
  );
}
