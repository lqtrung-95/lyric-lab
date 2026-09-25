import { getCurrentUser } from "@/lib/auth/current-user";
import type { RemoteSongProgress } from "@/lib/library/merge-library-songs";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET → bài đã nghe của người dùng kèm tiến độ. Tiến độ đọc qua RLS; tên bài lấy từ bảng `songs` (chỉ server đọc được). */
export async function GET() {
  if (!(await getCurrentUser())) return Response.json({ songs: [] satisfies RemoteSongProgress[] });
  const sb = await createSupabaseServerClient();
  const { data: rows, error } = await sb.from("user_song_progress").select("video_id,last_position_sec,completed,updated_at").order("updated_at", { ascending: false }).limit(100);
  if (error) return Response.json({ error: "server_error" }, { status: 500 });
  if (!rows?.length) return Response.json({ songs: [] });

  const { data: songs } = await createSupabaseServiceClient().from("songs").select("video_id,title,channel_title,duration_sec").in("video_id", rows.map((r) => r.video_id));
  const meta = new Map((songs ?? []).map((s) => [s.video_id, s]));
  const result: RemoteSongProgress[] = rows.flatMap((r) => {
    const s = meta.get(r.video_id);
    return s ? [{
      videoId: r.video_id, title: s.title, channelTitle: s.channel_title, durationSec: s.duration_sec,
      lastPositionSec: r.last_position_sec, completed: r.completed, updatedAt: r.updated_at,
    }] : [];
  });
  return Response.json({ songs: result }, { headers: { "Cache-Control": "private, no-store" } });
}
