import { notFound, redirect } from "next/navigation";
import { LearnMobileHeader } from "@/components/layout/learn-mobile-header";
import { SiteHeader } from "@/components/layout/site-header";
import { ListenScreen } from "@/components/listen/listen-screen";
import { readCachedAnalysis, readSongRow } from "@/lib/analysis/server-deps";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export default async function ListenPage({ params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;
  if (!isValidVideoId(videoId)) notFound();

  // Chưa có phân tích thì về trang bài học để chạy phân tích trước.
  const analysis = await readCachedAnalysis(videoId);
  const song = analysis ? await readSongRow(videoId) : null;
  if (!analysis || !song) redirect(`/learn/${videoId}`);

  return (
    <>
      <div className="hidden md:block"><SiteHeader /></div>
      <LearnMobileHeader title="Nghe" />
      <main id="main" tabIndex={-1} className="pt-16 outline-none">
        <ListenScreen analysis={analysis} song={song} />
      </main>
    </>
  );
}
