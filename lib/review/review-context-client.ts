import { noteDefaultOffset } from "@/lib/user-state/use-lyric-offset";
import type { ReviewContext } from "./review-context-types";

/** Tải câu hát cho thẻ ôn của một video; null nếu bài không còn (bị gỡ) hoặc lỗi. */
export async function fetchReviewContext(videoId: string, fetchFn: typeof fetch = fetch): Promise<ReviewContext | null> {
  try {
    const res = await fetchFn(`/api/review/context?videoId=${encodeURIComponent(videoId)}`);
    if (!res.ok) return null;
    const context = (await res.json()) as ReviewContext;
    // Ghi nhận mức mặc định hiện tại để bản chỉnh cá nhân đã cũ (admin vừa đổi mức mặc định) không bị cộng đôi ở các màn ôn tập.
    if (typeof context.lyricOffsetSec === "number") noteDefaultOffset(videoId, context.lyricOffsetSec);
    return context;
  } catch {
    return null;
  }
}
