import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { LearnMobileHeader } from "@/components/layout/learn-mobile-header";
import { SiteHeader } from "@/components/layout/site-header";
import { AnalyzingScreen } from "@/components/learn/analyzing-screen";
import { RememberSong } from "@/components/learn/remember-song";
import { PreviewScreen } from "@/components/preview/preview-screen";
import { loadWordStats } from "@/lib/preview/load-word-stats";
import { readCachedAnalysis, readSongRow } from "@/lib/analysis/server-deps";
import { buildLineShareMetadata } from "@/lib/seo/line-share-metadata";
import { hasVisibleLesson } from "@/lib/video/video-repo";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

/** Link cũ dạng `/learn/<id>?line=<số câu>` vẫn có thẻ xem trước đúng câu (link mới trỏ thẳng trang Nghe, xem `listen/page.tsx`). */
export async function generateMetadata({ params, searchParams }: { params: Promise<{ videoId: string }>; searchParams: Promise<{ line?: string | string[] }> }): Promise<Metadata> {
  const { videoId } = await params;
  return buildLineShareMetadata(videoId, (await searchParams).line);
}

export default async function LearnPage({ params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;
  if (!isValidVideoId(videoId)) notFound();

  // Hai truy vấn độc lập: chạy song song (bài chưa phân tích thì `song` bị bỏ qua bên dưới).
  const [analysis, songRow] = await Promise.all([readCachedAnalysis(videoId), readSongRow(videoId)]);
  const song = analysis ? songRow : null;
  // Link cũ tới bài học video (thẻ từ đã lưu ở video trỏ về /learn/<id>) thì chuyển sang trang video thay vì phân tích như bài hát.
  if (!analysis && (await hasVisibleLesson(videoId))) redirect(`/video/${videoId}`);
  const wordStats = analysis ? await loadWordStats(analysis.lines) : null;

  return (
    <>
      <div className="hidden md:block"><SiteHeader /></div>
      <LearnMobileHeader title={analysis ? "Xem trước" : "Đang phân tích"} />
      <main id="main" tabIndex={-1} className="pt-16 outline-none">
        {analysis && song ? (
          <>
            <RememberSong videoId={videoId} title={song.title} channelTitle={song.channelTitle} />
            <PreviewScreen analysis={analysis} song={song} wordStats={wordStats} />
          </>
        ) : (
          <div className="mx-auto max-w-page px-gutter pt-space-lg md:px-6 lg:px-12"><AnalyzingScreen videoId={videoId} /></div>
        )}
      </main>
    </>
  );
}
