import type { Metadata } from "next";
import { readCachedAnalysis, readSongRow } from "@/lib/analysis/server-deps";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

const DESCRIPTION = "Học tiếng Trung qua bài hát cùng SongHanzi";

/** Số thứ tự câu hợp lệ trong `?line=`, hoặc null. */
export function parseLineParam(line: string | string[] | undefined): number | null {
  return typeof line === "string" && /^\d{1,4}$/.test(line) ? Number(line) : null;
}

/**
 * Thẻ xem trước của link chia sẻ MỘT câu (`?line=<số thứ tự>`): chữ Hán làm tiêu đề, nghĩa tiếng Việt + tên bài làm mô tả, ảnh do
 * `/api/share/line/.../og` dựng. Chỉ một câu và trang vẫn noindex. Không có câu hợp lệ thì trả `{}` để dùng thẻ của cả bài ở layout.
 */
export async function buildLineShareMetadata(videoId: string, lineParam: string | string[] | undefined): Promise<Metadata> {
  const index = parseLineParam(lineParam);
  if (index === null || !isValidVideoId(videoId)) return {};
  try {
    const [analysis, song] = await Promise.all([readCachedAnalysis(videoId), readSongRow(videoId)]);
    const found = analysis?.lines.find((l) => l.index === index);
    if (!analysis || !found) return {};
    const songTitle = analysis.track?.title ?? song?.title ?? "SongHanzi";
    const description = [found.translation ? `“${found.translation}”` : "", songTitle].filter(Boolean).join(" · ") || DESCRIPTION;
    const image = { url: `/api/share/line/${videoId}/${index}/og`, width: 1200, height: 630, alt: "Câu hát trên SongHanzi" };
    return {
      robots: { index: false, follow: false },
      openGraph: { title: found.text, description, type: "website", siteName: "SongHanzi", locale: "vi_VN", images: [image] },
      twitter: { card: "summary_large_image", title: found.text, description, images: [image.url] },
    };
  } catch {
    return {};
  }
}
