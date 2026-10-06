import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LearnMobileHeader } from "@/components/layout/learn-mobile-header";
import { SiteHeader } from "@/components/layout/site-header";
import { VideoShadowingPage as ShadowingPage } from "@/components/video/video-shadowing-page";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export const metadata: Metadata = { title: "Luyện nói theo", robots: { index: false, follow: false } };

export default async function VideoShadowingRoute({ params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;
  if (!isValidVideoId(videoId)) notFound();
  return (
    <>
      <div className="hidden md:block"><SiteHeader /></div>
      <LearnMobileHeader title="Luyện nói" />
      <main id="main" tabIndex={-1} className="pt-16 outline-none">
        <ShadowingPage videoId={videoId} />
      </main>
    </>
  );
}
