import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

// Trang bài học chứa lời bài hát: không cho công cụ tìm kiếm lập chỉ mục (CLAUDE.md quy tắc 6). Áp dụng cho xem trước, nghe và tổng kết.
export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Kiểm tra videoId ở layout (nằm ngoài khung `loading.tsx`) để link sai định dạng trả 404 thật.
 * Nếu để trong page, server đã kịp gửi khung chờ với mã 200 trước khi `notFound()` chạy.
 */
export default async function LearnLayout({ children, params }: { children: React.ReactNode; params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;
  if (!isValidVideoId(videoId)) notFound();
  return children;
}
