import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LearnMobileHeader } from "@/components/layout/learn-mobile-header";
import { SiteHeader } from "@/components/layout/site-header";
import { AnalyzingScreen } from "@/components/learn/analyzing-screen";
import { RememberSong } from "@/components/learn/remember-song";
import { PreviewScreen } from "@/components/preview/preview-screen";
import { loadWordStats } from "@/lib/preview/load-word-stats";
import { readCachedAnalysis, readSongRow } from "@/lib/analysis/server-deps";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

const LINE_SHARE_DESCRIPTION = "Học tiếng Trung qua bài hát cùng SongHanzi";

/**
 * Link chia sẻ một câu (`?line=<số thứ tự>`): thẻ xem trước là ĐÚNG câu đó (chữ Hán làm tiêu đề, nghĩa tiếng Việt + tên bài làm mô tả, ảnh do
 * `/api/share/line/.../og` dựng). Chỉ một câu, trang vẫn noindex (xem layout). Không có `line` hợp lệ thì dùng thẻ của cả bài ở layout.
 */
export async function generateMetadata({ params, searchParams }: { params: Promise<{ videoId: string }>; searchParams: Promise<{ line?: string | string[] }> }): Promise<Metadata> {
  const { videoId } = await params;
  const { line } = await searchParams;
  if (!isValidVideoId(videoId) || typeof line !== "string" || !/^\d{1,4}$/.test(line)) return {};
  try {
    const [analysis, song] = await Promise.all([readCachedAnalysis(videoId), readSongRow(videoId)]);
    const found = analysis?.lines.find((l) => l.index === Number(line));
    if (!analysis || !found) return {};
    const songTitle = analysis.track?.title ?? song?.title ?? "SongHanzi";
    const description = [found.translation ? `“${found.translation}”` : "", songTitle].filter(Boolean).join(" · ");
    const image = { url: `/api/share/line/${videoId}/${line}/og`, width: 1200, height: 630, alt: "Câu hát trên SongHanzi" };
    return {
      robots: { index: false, follow: false },
      openGraph: { title: found.text, description: description || LINE_SHARE_DESCRIPTION, type: "website", siteName: "SongHanzi", locale: "vi_VN", images: [image] },
      twitter: { card: "summary_large_image", title: found.text, description: description || LINE_SHARE_DESCRIPTION, images: [image.url] },
    };
  } catch {
    return {};
  }
}

export default async function LearnPage({ params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;
  if (!isValidVideoId(videoId)) notFound();

  // Hai truy vấn độc lập: chạy song song (bài chưa phân tích thì `song` bị bỏ qua bên dưới).
  const [analysis, songRow] = await Promise.all([readCachedAnalysis(videoId), readSongRow(videoId)]);
  const song = analysis ? songRow : null;
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
          <div className="mx-auto max-w-7xl px-gutter pt-space-lg md:px-6 lg:px-12"><AnalyzingScreen videoId={videoId} /></div>
        )}
      </main>
    </>
  );
}
