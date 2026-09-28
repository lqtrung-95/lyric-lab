import { ensureAnonymousSession, hasExistingSession } from "@/lib/auth/ensure-anonymous-session";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

/** Danh sách videoId bài hát người dùng hiện tại đã thích. Trả rỗng nếu chưa có phiên. */
export async function listLikedVideoIds(): Promise<string[]> {
  try {
    if (!(await hasExistingSession())) return [];
    const { data } = await createSupabaseBrowserClient().from("user_song_likes").select("video_id");
    return (data ?? []).map((r) => r.video_id);
  } catch {
    return [];
  }
}

/** Bật/tắt thích một bài. Bật thì tạo phiên ẩn danh nếu cần (dấu hiệu người dùng thật sự muốn lưu). Trả trạng thái mới; lỗi mạng giữ nguyên trạng thái cũ. */
export async function toggleSongLike(videoId: string, liked: boolean): Promise<boolean> {
  try {
    if (!liked) {
      if (!(await hasExistingSession())) return false;
      const sb = createSupabaseBrowserClient();
      const userId = (await sb.auth.getSession()).data.session?.user.id;
      if (!userId) return false;
      await sb.from("user_song_likes").delete().eq("user_id", userId).eq("video_id", videoId);
      return false;
    }
    if (!(await ensureAnonymousSession())) return liked;
    const sb = createSupabaseBrowserClient();
    const userId = (await sb.auth.getSession()).data.session?.user.id;
    if (!userId) return liked;
    await sb.from("user_song_likes").upsert({ user_id: userId, video_id: videoId });
    return true;
  } catch {
    return liked;
  }
}
