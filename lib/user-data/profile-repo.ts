import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export interface Profile {
  newCardsPerDay: number;
  onboarded: boolean;
}

export const DEFAULT_PROFILE: Profile = { newCardsPerDay: 15, onboarded: false };
export const NEW_CARDS_OPTIONS = [5, 10, 15, 20, 30] as const;

export async function fetchProfile(): Promise<Profile> {
  const { data, error } = await createSupabaseBrowserClient().from("user_profiles").select("new_cards_per_day,onboarded").maybeSingle();
  if (error) throw new Error(error.message);
  return data ? { newCardsPerDay: data.new_cards_per_day, onboarded: data.onboarded } : DEFAULT_PROFILE;
}

/** Ghi thiết lập (tạo phiên ẩn danh nếu chưa có). Trả false nếu không có phiên hoặc ghi lỗi. */
export async function saveProfile(patch: Partial<Profile>): Promise<boolean> {
  if (!(await ensureAnonymousSession())) return false;
  const sb = createSupabaseBrowserClient();
  const { data } = await sb.auth.getSession();
  const userId = data.session?.user.id;
  if (!userId) return false;
  const row: Record<string, unknown> = { user_id: userId, updated_at: new Date().toISOString() };
  if (patch.newCardsPerDay !== undefined) row.new_cards_per_day = patch.newCardsPerDay;
  if (patch.onboarded !== undefined) row.onboarded = patch.onboarded;
  const { error } = await sb.from("user_profiles").upsert(row);
  return !error;
}
