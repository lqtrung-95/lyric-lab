import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { LearnMobileHeader } from "@/components/layout/learn-mobile-header";
import { SiteHeader } from "@/components/layout/site-header";
import { ListenScreen } from "@/components/listen/listen-screen";
import { readCachedAnalysis, readSongRow } from "@/lib/analysis/server-deps";
import { buildLineShareMetadata, parseLineParam } from "@/lib/seo/line-share-metadata";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

/** Link chia sẻ một câu (`?line=`) trỏ thẳng trang Nghe nên thẻ xem trước đặt ở đây. */
export async function generateMetadata({ params, searchParams }: { params: Promise<{ videoId: string }>; searchParams: Promise<{ line?: string | string[] }> }): Promise<Metadata> {
  const { videoId } = await params;
  return buildLineShareMetadata(videoId, (await searchParams).line);
}

export default async function ListenPage({ params, searchParams }: { params: Promise<{ videoId: string }>; searchParams: Promise<{ t?: string; line?: string | string[] }> }) {
  const { videoId } = await params;
  // `?t=84`: mở đúng chỗ đang nghe dở (giây). Giá trị sai bị bỏ qua.
  const query = await searchParams;
  const t = Number(query.t);
  let startAt = Number.isFinite(t) && t > 0 && t < 36000 ? t : undefined;
  const sharedLine = parseLineParam(query.line);
  if (!isValidVideoId(videoId)) notFound();

  // Chưa có phân tích thì về trang bài học để chạy phân tích trước.
  // Hai truy vấn độc lập: chạy song song (bài chưa phân tích thì `song` bị bỏ qua bên dưới).
  const [analysis, songRow] = await Promise.all([readCachedAnalysis(videoId), readSongRow(videoId)]);
  const song = analysis ? songRow : null;
  if (!analysis || !song) redirect(`/learn/${videoId}`);
  // `?line=10`: link chia sẻ một câu. Mở đúng câu đó (tua tới đầu câu, câu được tô sáng và cuộn giữa màn hình); trình duyệt không cho tự phát nhạc nên người nhận bấm phát.
  if (startAt === undefined && sharedLine !== null) {
    const found = analysis.lines.find((l) => l.index === sharedLine);
    if (found) startAt = Math.max(0.05, found.start + 0.05); // vừa qua mốc đầu câu để câu đó (không phải câu trước) là câu đang hát
  }

  return (
    <>
      <div className="hidden md:block"><SiteHeader /></div>
      <LearnMobileHeader title="Nghe" />
      <main id="main" tabIndex={-1} className="pt-16 outline-none">
        <ListenScreen analysis={analysis} song={song} startAt={startAt} />
      </main>
    </>
  );
}
