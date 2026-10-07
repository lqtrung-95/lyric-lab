import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChallengeScreen } from "@/components/challenge/challenge-screen";
import { normalizeChallengeCode } from "@/lib/challenges/challenge-code";
import { SITE_URL } from "@/lib/seo/site-url";
import { getChallengeInfo } from "@/lib/challenges/challenge-repo";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const code = normalizeChallengeCode((await params).code);
  const info = code ? await getChallengeInfo(code, null).catch(() => null) : null;
  // Chỉ tên người thách và điểm: không đưa tên bài hay lời vào thẻ xem trước (quy tắc bản quyền).
  const title = info ? `${info.creatorName} thách bạn điền lời trên SongHanzi` : "Thử thách";
  const images = code ? [{ url: `${SITE_URL}/api/challenges/${code}/og`, width: 1200, height: 630 }] : [];
  const description = "10 câu điền lời, mỗi câu 15 giây. Chơi lúc nào cũng được rồi so điểm.";
  return { title, description, robots: { index: false }, openGraph: { title, description, images }, twitter: { card: "summary_large_image", title, description, images } };
}

export default async function ChallengePage({ params }: { params: Promise<{ code: string }> }) {
  const code = normalizeChallengeCode((await params).code);
  if (!code) notFound();
  return <ChallengeScreen code={code} />;
}
