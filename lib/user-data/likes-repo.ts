import { ensureAnonymousSession, hasExistingSession } from "@/lib/auth/ensure-anonymous-session";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

/** Kho "yêu thích" theo bảng (`user_song_likes` cho bài hát, `user_video_likes` cho video): cùng cột `user_id`, `video_id`, RLS theo chủ sở hữu. */
export function createLikesRepo(table: "user_song_likes" | "user_video_likes") {
  /** Danh sách videoId người dùng hiện tại đã thích. Trả rỗng nếu chưa có phiên hoặc lỗi (kể cả bảng chưa có vì migration chưa chạy). */
  async function listLikedIds(): Promise<string[]> {
    try {
      if (!(await hasExistingSession())) return [];
      const { data, error } = await createSupabaseBrowserClient().from(table).select("video_id");
      return error ? [] : (data ?? []).map((r) => r.video_id as string);
    } catch {
      return [];
    }
  }

  /**
   * Bật/tắt thích một mục. Bật thì tạo phiên ẩn danh nếu cần (dấu hiệu người dùng thật sự muốn lưu). Trả trạng thái THẬT sau khi làm: ghi lỗi (mạng, bảng chưa có, hết phiên)
   * trả lại trạng thái cũ để giao diện hoàn tác thay vì giả vờ đã lưu.
   */
  async function toggleLike(videoId: string, liked: boolean): Promise<boolean> {
    try {
      if (!liked) {
        if (!(await hasExistingSession())) return false;
        const sb = createSupabaseBrowserClient();
        const userId = (await sb.auth.getSession()).data.session?.user.id;
        if (!userId) return false;
        const { error } = await sb.from(table).delete().eq("user_id", userId).eq("video_id", videoId);
        return Boolean(error); // xóa lỗi nghĩa là vẫn còn thích
      }
      if (!(await ensureAnonymousSession())) return false;
      const sb = createSupabaseBrowserClient();
      const userId = (await sb.auth.getSession()).data.session?.user.id;
      if (!userId) return false;
      const { error } = await sb.from(table).upsert({ user_id: userId, video_id: videoId });
      return !error;
    } catch {
      return !liked;
    }
  }

  return { listLikedIds, toggleLike };
}
