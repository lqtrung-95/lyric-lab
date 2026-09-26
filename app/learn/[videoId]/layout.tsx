import { notFound } from "next/navigation";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

/**
 * Kiểm tra videoId ở layout (nằm ngoài khung `loading.tsx`) để link sai định dạng trả 404 thật.
 * Nếu để trong page, server đã kịp gửi khung chờ với mã 200 trước khi `notFound()` chạy.
 */
export default async function LearnLayout({ children, params }: { children: React.ReactNode; params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;
  if (!isValidVideoId(videoId)) notFound();
  return children;
}
