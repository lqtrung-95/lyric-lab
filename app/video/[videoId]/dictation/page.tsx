import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LearnMobileHeader } from "@/components/layout/learn-mobile-header";
import { SiteHeader } from "@/components/layout/site-header";
import { VideoDictationPage as DictationPage } from "@/components/video/video-dictation-page";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export const metadata: Metadata = { title: "Chép chính tả", robots: { index: false, follow: false } };

export default async function VideoDictationPage({ params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;
  if (!isValidVideoId(videoId)) notFound();
  return (
    <>
      <div className="hidden md:block"><SiteHeader /></div>
      <LearnMobileHeader title="Chép chính tả" />
      <main id="main" tabIndex={-1} className="pt-16 outline-none">
        <DictationPage videoId={videoId} />
      </main>
    </>
  );
}
