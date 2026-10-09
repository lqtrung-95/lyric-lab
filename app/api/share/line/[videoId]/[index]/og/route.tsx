import { readCachedAnalysis, readSongRow } from "@/lib/analysis/server-deps";
import { renderMarketingOgImage } from "@/lib/seo/marketing-og-image";
import { renderLineOgImage } from "@/lib/seo/line-og-image";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export const runtime = "nodejs";

/**
 * GET → ảnh xem trước (og:image) của link chia sẻ MỘT câu lời: chữ Hán, pinyin, nghĩa tiếng Việt, tên bài. Bài hoặc câu không tồn tại thì trả
 * ảnh chung của SongHanzi. Chỉ trả ảnh (không phải văn bản lời) và gắn noindex; cache dài vì nội dung câu ít đổi (admin sửa lời thì sau cache sẽ cập nhật).
 */
export async function GET(_req: Request, ctx: { params: Promise<{ videoId: string; index: string }> }) {
  const { videoId, index } = await ctx.params;
  const headers = { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800", "X-Robots-Tag": "noindex" };
  const fallback = async () => { const res = await renderMarketingOgImage(); for (const [k, v] of Object.entries(headers)) res.headers.set(k, v); return res; };
  if (!isValidVideoId(videoId) || !/^\d{1,4}$/.test(index)) return fallback();
  try {
    const [analysis, song] = await Promise.all([readCachedAnalysis(videoId), readSongRow(videoId)]);
    const line = analysis?.lines.find((l) => l.index === Number(index));
    if (!analysis || !line) return fallback();
    const res = await renderLineOgImage({
      han: line.text, pinyin: line.pinyin, translation: line.translation,
      title: analysis.track?.title ?? song?.title ?? "", artist: analysis.track?.artist ?? song?.channelTitle, videoId,
    });
    for (const [k, v] of Object.entries(headers)) res.headers.set(k, v);
    return res;
  } catch {
    return fallback();
  }
}
