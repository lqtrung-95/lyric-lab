import { hasExistingSession } from "@/lib/auth/ensure-anonymous-session";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

/** Độ lệch lời đã lưu trên tài khoản cho một bài; null nếu chưa có phiên hoặc chưa từng chỉnh. */
export async function fetchRemoteOffset(videoId: string): Promise<number | null> {
  try {
    if (!(await hasExistingSession())) return null;
    const { data } = await createSupabaseBrowserClient().from("user_song_progress").select("lyric_offset_sec").eq("video_id", videoId).maybeSingle();
    return data?.lyric_offset_sec ?? null;
  } catch {
    return null;
  }
}

/** Lưu độ lệch lên tài khoản (chỉ khi đã có phiên; người chưa có phiên vẫn giữ bản cục bộ). Lỗi mạng bị bỏ qua. */
export async function pushRemoteOffset(videoId: string, offsetSec: number): Promise<void> {
  try {
    if (!(await hasExistingSession())) return;
    const sb = createSupabaseBrowserClient();
    const userId = (await sb.auth.getSession()).data.session?.user.id;
    if (!userId) return;
    // Chỉ ghi cột độ lệch: upsert giữ nguyên tiến độ nghe đã có của hàng này.
    await sb.from("user_song_progress").upsert({ user_id: userId, video_id: videoId, lyric_offset_sec: offsetSec, updated_at: new Date().toISOString() });
  } catch {
    // Bỏ qua.
  }
}
