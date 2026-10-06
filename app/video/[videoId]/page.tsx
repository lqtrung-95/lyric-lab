import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LearnMobileHeader } from "@/components/layout/learn-mobile-header";
import { SiteHeader } from "@/components/layout/site-header";
import { VideoPage } from "@/components/video/video-page";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export const metadata: Metadata = { title: "Xem video", robots: { index: false, follow: false } };

export default async function VideoWatchPage({ params, searchParams }: { params: Promise<{ videoId: string }>; searchParams: Promise<{ t?: string }> }) {
  const { videoId } = await params;
  if (!isValidVideoId(videoId)) notFound();
  // `?t=84`: mở đúng chỗ (giây), ví dụ từ thẻ ôn. Giá trị sai bị bỏ qua.
  const t = Number((await searchParams).t);
  const startAt = Number.isFinite(t) && t > 0 && t < 36000 ? t : undefined;
  return (
    <>
      <div className="hidden md:block"><SiteHeader /></div>
      <LearnMobileHeader title="Video" />
      <main id="main" tabIndex={-1} className="pt-16 outline-none">
        <VideoPage videoId={videoId} startAt={startAt} />
      </main>
    </>
  );
}
