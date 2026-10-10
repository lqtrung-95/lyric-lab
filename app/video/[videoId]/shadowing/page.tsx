import { notFound, redirect } from "next/navigation";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

/** Link cũ: chép chính tả và luyện nói giờ là tab của trang học video. */
export default async function VideoStudyTabRedirect({ params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;
  if (!isValidVideoId(videoId)) notFound();
  redirect(`/video/${videoId}?tab=shadowing`);
}
