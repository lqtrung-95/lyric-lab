import type { ReviewContext } from "./review-context-types";

/** Tải câu hát cho thẻ ôn của một video; null nếu bài không còn (bị gỡ) hoặc lỗi. */
export async function fetchReviewContext(videoId: string, fetchFn: typeof fetch = fetch): Promise<ReviewContext | null> {
  try {
    const res = await fetchFn(`/api/review/context?videoId=${encodeURIComponent(videoId)}`);
    return res.ok ? ((await res.json()) as ReviewContext) : null;
  } catch {
    return null;
  }
}
