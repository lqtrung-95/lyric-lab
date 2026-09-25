import { notFound } from "next/navigation";
import { AnalyzingScreen } from "@/components/learn/analyzing-screen";
import { RememberSong } from "@/components/learn/remember-song";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { readCachedAnalysis, readSongRow } from "@/lib/analysis/server-deps";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export default async function LearnPage({ params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;
  if (!isValidVideoId(videoId)) notFound();

  const analysis = await readCachedAnalysis(videoId);
  const song = analysis ? await readSongRow(videoId) : null;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-gutter pb-28 pt-24 md:px-6 md:pb-16 lg:px-12">
        {analysis ? (
          <>
            {song && <RememberSong videoId={videoId} title={song.title} channelTitle={song.channelTitle} />}
            {/* Bản xem trước (S4) làm ở phase 3. */}
            <h1 className="font-serif text-headline-lg">{song?.title}</h1>
            <p className="mt-space-md text-body-lg text-on-surface-variant">{analysis.summary}</p>
            <p className="mt-space-md text-label-md text-on-surface-variant">{analysis.items.length} mục học · nguồn lời: {analysis.lyricsSource}</p>
          </>
        ) : (
          <AnalyzingScreen videoId={videoId} />
        )}
      </main>
      <MobileTabBar />
    </>
  );
}
