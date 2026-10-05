import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { normalizeNickname, validateNickname } from "./nickname";

export interface Profile {
  nickname: string;
  optedIn: boolean;
  avatarUrl: string | null;
}

/** Hồ sơ của tài khoản (biệt danh dùng chung cho phòng thi đấu và bảng xếp hạng); null nếu chưa đặt biệt danh. */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await createSupabaseServiceClient().from("leaderboard_profiles").select("nickname,opted_in,avatar_url").eq("user_id", userId).maybeSingle();
  return data ? { nickname: data.nickname, optedIn: data.opted_in, avatarUrl: data.avatar_url } : null;
}

export type SaveProfileResult = "ok" | "taken" | "nickname_required" | NonNullable<ReturnType<typeof validateNickname>> | "server_error";

export interface ProfileChange {
  nickname?: string;
  optedIn?: boolean;
}

/**
 * Đặt biệt danh và/hoặc bật-tắt tham gia bảng xếp hạng. Biệt danh là MỘT giá trị dùng chung (phòng thi đấu, bảng xếp hạng); tham gia
 * bảng xếp hạng là lựa chọn riêng:
 * - chỉ `nickname`: tạo hồ sơ mới ở trạng thái CHƯA tham gia bảng (đặt tên ở Cài đặt hay khi vào phòng không tự công khai điểm của người dùng);
 *   hồ sơ đã có thì chỉ đổi tên, giữ nguyên trạng thái tham gia;
 * - `optedIn: true` (kèm hoặc không kèm `nickname`): tham gia bảng; không kèm tên thì cần đã có biệt danh;
 * - `optedIn: false`: rời bảng, giữ biệt danh.
 * Biệt danh duy nhất không phân biệt hoa thường (trùng thì "taken").
 */
export async function saveProfile(userId: string, change: ProfileChange): Promise<SaveProfileResult> {
  const sb = createSupabaseServiceClient();
  const now = new Date().toISOString();

  if (change.optedIn === false && change.nickname === undefined) {
    const { error } = await sb.from("leaderboard_profiles").update({ opted_in: false, updated_at: now }).eq("user_id", userId);
    return error ? "server_error" : "ok";
  }

  const existing = await getProfile(userId);
  let nickname = existing?.nickname;
  if (change.nickname !== undefined) {
    const invalid = validateNickname(change.nickname);
    if (invalid) return invalid;
    nickname = normalizeNickname(change.nickname);
  }
  if (!nickname) return "nickname_required";

  const optedIn = change.optedIn ?? existing?.optedIn ?? false;
  const { error } = await sb.from("leaderboard_profiles").upsert({ user_id: userId, nickname, opted_in: optedIn, updated_at: now });
  if (error?.code === "23505") return "taken";
  return error ? "server_error" : "ok";
}
