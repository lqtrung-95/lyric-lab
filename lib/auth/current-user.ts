import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export interface CurrentUser {
  id: string;
  /** true với tài khoản ẩn danh (chưa liên kết Google). */
  isAnonymous: boolean;
}

/** Người dùng của request hiện tại (xác thực với Supabase Auth, không tin cookie thô); null nếu chưa có phiên. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return { id: data.user.id, isAnonymous: data.user.is_anonymous ?? false };
}
