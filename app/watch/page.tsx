import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Đường tắt đổi tên miền: thay `youtube.com` bằng tên miền của app trong link đang xem (giữ nguyên `/watch?v=…`) là vào thẳng bài.
 * Link sai thì về trang chủ app.
 */
export default async function WatchRedirect({ searchParams }: { searchParams: Promise<{ v?: string | string[] }> }) {
  const { v } = await searchParams;
  const id = Array.isArray(v) ? v[0] : v;
  redirect(id && isValidVideoId(id) ? `/learn/${id}` : "/app");
}
