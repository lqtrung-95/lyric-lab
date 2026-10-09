import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readCachedAnalysis, readSongRow } from "@/lib/analysis/server-deps";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

const DESCRIPTION = "Học tiếng Trung qua bài hát: từ vựng, pinyin, âm Hán Việt và nghĩa tiếng Việt cho từng câu, cùng SongHanzi.";

/**
 * Trang bài học chứa lời bài hát: không cho công cụ tìm kiếm lập chỉ mục (CLAUDE.md quy tắc 6). Áp dụng cho xem trước, nghe và tổng kết. Vẫn khai
 * báo og/twitter (tên bài, mô tả; ảnh do `opengraph-image.tsx` dựng) để dán link vào Telegram/Facebook/Zalo hiện được thẻ xem trước; chỉ có tên bài,
 * không có lời. `noindex` không ngăn các mạng xã hội đọc thẻ này.
 */
export async function generateMetadata({ params }: { params: Promise<{ videoId: string }> }): Promise<Metadata> {
  const robots = { index: false, follow: false };
  const { videoId } = await params;
  if (!isValidVideoId(videoId)) return { robots };
  try {
    const [analysis, song] = await Promise.all([readCachedAnalysis(videoId), readSongRow(videoId)]);
    const title = analysis?.track?.title ?? song?.title;
    if (!title) return { robots };
    return {
      title,
      description: DESCRIPTION,
      robots,
      openGraph: { title: `${title} · SongHanzi`, description: DESCRIPTION, type: "website", siteName: "SongHanzi", locale: "vi_VN" },
      twitter: { card: "summary_large_image", title: `${title} · SongHanzi`, description: DESCRIPTION },
    };
  } catch {
    return { robots };
  }
}

/**
 * Kiểm tra videoId ở layout (nằm ngoài khung `loading.tsx`) để link sai định dạng trả 404 thật.
 * Nếu để trong page, server đã kịp gửi khung chờ với mã 200 trước khi `notFound()` chạy.
 */
export default async function LearnLayout({ children, params }: { children: React.ReactNode; params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;
  if (!isValidVideoId(videoId)) notFound();
  return children;
}
