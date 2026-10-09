import { readCachedAnalysis, readSongRow } from "@/lib/analysis/server-deps";
import { MARKETING_OG_ALT, MARKETING_OG_SIZE, renderMarketingOgImage } from "@/lib/seo/marketing-og-image";
import { renderSongOgImage } from "@/lib/seo/song-og-image";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export const runtime = "nodejs";
export const alt = MARKETING_OG_ALT;
export const size = MARKETING_OG_SIZE;
export const contentType = "image/png";

/** Ảnh xem trước của link bài học: bài đã có trong kho thì ảnh riêng của bài (bìa + tên), còn lại dùng ảnh chung của SongHanzi. */
export default async function Image({ params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;
  if (!isValidVideoId(videoId)) return renderMarketingOgImage();
  try {
    const [analysis, song] = await Promise.all([readCachedAnalysis(videoId), readSongRow(videoId)]);
    const title = analysis?.track?.title ?? song?.title;
    if (!title) return renderMarketingOgImage();
    return await renderSongOgImage({ videoId, title, artist: analysis?.track?.artist ?? song?.channelTitle });
  } catch {
    return renderMarketingOgImage();
  }
}
