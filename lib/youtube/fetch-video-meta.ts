import "server-only";
import { getServerEnv } from "@/lib/env/server-env";
import type { VideoMeta } from "@/lib/lyrics/lyrics-types";
import { isValidVideoId } from "./parse-video-id";
import { parseIsoDuration } from "./parse-iso-duration";

const decodeEntities = (s: string) =>
  s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

/** Lấy tiêu đề, kênh, thời lượng qua Data API (videos.list, 1 đơn vị quota). Trả null nếu video không tồn tại. `embeddable` = false khi chủ video tắt nhúng. */
export async function fetchVideoMeta(videoId: string): Promise<VideoMeta | null> {
  if (!isValidVideoId(videoId)) return null;
  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "snippet,contentDetails,status");
  url.searchParams.set("id", videoId);
  url.searchParams.set("key", getServerEnv().YOUTUBE_DATA_API_KEY);

  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`YouTube Data API lỗi HTTP ${res.status}`);
  const item = (await res.json()).items?.[0];
  if (!item) return null;
  return {
    videoId,
    title: decodeEntities(item.snippet.title),
    channelTitle: decodeEntities(item.snippet.channelTitle),
    durationSec: parseIsoDuration(item.contentDetails.duration),
    // Chủ video tắt nhúng thì player của app không phát được (undefined nếu API không trả trường này).
    embeddable: typeof item.status?.embeddable === "boolean" ? item.status.embeddable : undefined,
  };
}
