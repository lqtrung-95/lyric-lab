import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { LearnMobileHeader } from "@/components/layout/learn-mobile-header";
import { SiteHeader } from "@/components/layout/site-header";
import { SongSummaryScreen } from "@/components/summary/song-summary-screen";
import { readCachedAnalysis, readSongRow } from "@/lib/analysis/server-deps";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export const metadata: Metadata = { title: "Tổng kết bài", robots: { index: false } };

export default async function SummaryPage({ params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;
  if (!isValidVideoId(videoId)) notFound();
  const analysis = await readCachedAnalysis(videoId);
  const song = analysis ? await readSongRow(videoId) : null;
  if (!analysis || !song) redirect(`/learn/${videoId}`);

  return (
    <>
      <div className="hidden md:block"><SiteHeader /></div>
      <LearnMobileHeader title="Tổng kết" />
      <main id="main" tabIndex={-1} className="px-gutter pt-20 outline-none">
        <SongSummaryScreen analysis={analysis} title={analysis.track?.title ?? song.title} />
      </main>
    </>
  );
}
