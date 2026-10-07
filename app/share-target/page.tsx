import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { findVideoIdInText } from "@/lib/youtube/parse-video-id";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Đích của "Chia sẻ" từ app YouTube (Web Share Target của PWA, xem app/manifest.ts): lấy link trong nội dung chia sẻ rồi vào thẳng bài. */
export default async function ShareTarget({ searchParams }: { searchParams: Promise<{ url?: string; text?: string; title?: string }> }) {
  const { url, text, title } = await searchParams;
  const id = findVideoIdInText([url, text, title].filter(Boolean).join(" "));
  redirect(id ? `/learn/${id}` : "/app");
}
