import { ensureAnonymousSession, hasExistingSession } from "@/lib/auth/ensure-anonymous-session";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

/**
 * Ghi tiến độ nghe của người dùng cho một bài. Tiến độ dở dang chỉ ghi khi đã có phiên; nghe hết bài (`completed`)
 * thì tạo phiên ẩn danh nếu cần, vì đó là dấu hiệu người dùng thật sự học bài này. Lỗi mạng bị bỏ qua (chỉ là thống kê).
 */
export async function saveSongProgress(videoId: string, positionSec: number, completed: boolean): Promise<void> {
  try {
    const hasSession = completed ? await ensureAnonymousSession() : await hasExistingSession();
    if (!hasSession) return;
    const sb = createSupabaseBrowserClient();
    const userId = (await sb.auth.getSession()).data.session?.user.id;
    if (!userId) return;
    const existing = completed ? null : await sb.from("user_song_progress").select("completed").eq("video_id", videoId).maybeSingle();
    await sb.from("user_song_progress").upsert({
      user_id: userId, video_id: videoId, last_position_sec: positionSec,
      // Đã nghe hết một lần thì giữ trạng thái hoàn thành khi nghe lại giữa chừng.
      completed: completed || existing?.data?.completed === true, updated_at: new Date().toISOString(),
    });
  } catch {
    // Bỏ qua.
  }
}
