import { notFound } from "next/navigation";
import { LearnMobileHeader } from "@/components/layout/learn-mobile-header";
import { SiteHeader } from "@/components/layout/site-header";
import { AnalyzingScreen } from "@/components/learn/analyzing-screen";
import { RememberSong } from "@/components/learn/remember-song";
import { PreviewScreen } from "@/components/preview/preview-screen";
import { readCachedAnalysis, readSongRow } from "@/lib/analysis/server-deps";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export default async function LearnPage({ params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;
  if (!isValidVideoId(videoId)) notFound();

  // Hai truy vấn độc lập: chạy song song (bài chưa phân tích thì `song` bị bỏ qua bên dưới).
  const [analysis, songRow] = await Promise.all([readCachedAnalysis(videoId), readSongRow(videoId)]);
  const song = analysis ? songRow : null;

  return (
    <>
      <div className="hidden md:block"><SiteHeader /></div>
      <LearnMobileHeader title={analysis ? "Xem trước" : "Đang phân tích"} />
      <main id="main" tabIndex={-1} className="pt-16 outline-none">
        {analysis && song ? (
          <>
            <RememberSong videoId={videoId} title={song.title} channelTitle={song.channelTitle} />
            <PreviewScreen analysis={analysis} song={song} />
          </>
        ) : (
          <div className="mx-auto max-w-7xl px-gutter pt-space-lg md:px-6 lg:px-12"><AnalyzingScreen videoId={videoId} /></div>
        )}
      </main>
    </>
  );
}
