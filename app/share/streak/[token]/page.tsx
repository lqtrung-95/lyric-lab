import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getStreakShare } from "./get-streak-share";

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const share = await getStreakShare(token);
  if (!share) return { title: "Không tìm thấy" };
  const title = `${share.currentStreak} ngày liên tiếp học tiếng Trung qua bài hát`;
  const description = `${share.learnedWords} từ đã ôn · ${share.weekCount} ngày học tuần này trên SongHanzi.`;
  return { title, description, openGraph: { title, description }, twitter: { card: "summary_large_image", title, description } };
}

/** Trang chia sẻ công khai 1 ảnh chụp chuỗi ngày học (bất biến theo token) — og:image tự sinh ở opengraph-image.tsx. */
export default async function StreakSharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const share = await getStreakShare(token);
  if (!share) notFound();

  return (
    <main className="mx-auto flex max-w-xl flex-col items-center gap-space-md px-gutter py-space-xl text-center">
      <p className="font-serif text-headline-xl text-primary">{share.currentStreak}</p>
      <p className="text-headline-md text-on-surface">ngày liên tiếp học tiếng Trung qua bài hát</p>
      <p className="text-body-md text-on-surface-variant">{share.learnedWords} từ đã ôn · {share.weekCount} ngày học tuần này</p>
      <Link href="/app" className="mt-space-md inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:bg-primary-container">
        Học cùng SongHanzi
      </Link>
    </main>
  );
}
