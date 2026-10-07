import { getCurrentUser } from "@/lib/auth/current-user";
import { isAdminAccount } from "@/lib/admin/admin-accounts";
import { listReportedSongs } from "@/lib/admin/song-reports";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export const runtime = "nodejs";

/** GET → các bài đang bị người dùng báo sai (mới nhất trước), gộp theo bài. `?videoId=` chỉ lấy một bài (dùng cho dải cảnh báo ở trang bài hát). */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!isAdminAccount(user?.email ?? null)) return Response.json({ error: "forbidden" }, { status: 403 });
  const videoId = new URL(req.url).searchParams.get("videoId") ?? undefined;
  if (videoId !== undefined && !isValidVideoId(videoId)) return Response.json({ error: "invalid_video" }, { status: 400 });
  try {
    return Response.json({ items: await listReportedSongs(videoId) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
