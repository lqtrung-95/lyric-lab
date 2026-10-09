import { isValidVideoId } from "@/lib/youtube/parse-video-id";
import { videoThumbnailUrl } from "@/lib/youtube/video-thumbnail";

/**
 * Ảnh bìa YouTube (16:9, `mqdefault`) dưới dạng data URL để đưa vào ảnh xem trước dựng ở server (satori). Lỗi mạng, video không có ảnh hoặc quá 4 giây thì trả
 * null: ảnh xem trước vẫn dựng được, chỉ không có ảnh bìa.
 */
export async function fetchOgThumbnail(videoId: string, quality: "hqdefault" | "mqdefault" = "mqdefault"): Promise<string | null> {
  if (!isValidVideoId(videoId)) return null;
  try {
    const res = await fetch(videoThumbnailUrl(videoId, quality), { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    return `data:image/jpeg;base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch {
    return null;
  }
}
