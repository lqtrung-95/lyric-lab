import { ensureAnonymousSession } from "./ensure-anonymous-session";
import { LEARNER_STATE_KEY } from "@/lib/user-state/learner-state";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export const MERGE_TOKEN_KEY = "lyric-lab-merge-token";

export interface AccountInfo {
  isAnonymous: boolean;
  email: string | null;
}

/** Tài khoản hiện tại của trình duyệt; null nếu chưa có phiên nào. */
export async function fetchAccountInfo(): Promise<AccountInfo | null> {
  const { data } = await createSupabaseBrowserClient().auth.getUser();
  return data.user ? { isAnonymous: data.user.is_anonymous ?? false, email: data.user.email ?? null } : null;
}

const callbackUrl = (next: string) => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

/** Nâng tài khoản ẩn danh lên tài khoản Google (giữ nguyên dữ liệu). Chuyển hướng sang Google; lỗi thì trả thông báo. */
export async function linkGoogle(): Promise<string | null> {
  if (!(await ensureAnonymousSession())) return "Chưa mở được phiên. Kiểm tra kết nối rồi thử lại.";
  const { error } = await createSupabaseBrowserClient().auth.linkIdentity({ provider: "google", options: { redirectTo: callbackUrl("/settings") } });
  return error ? error.message : null;
}

/**
 * Google này đã có tài khoản: xin mã một lần cho dữ liệu ẩn danh đang có, cất lại, rồi đăng nhập Google.
 * Sau khi quay về, trang gộp dùng mã này để chứng minh dữ liệu ẩn danh là của người đang thao tác.
 */
export async function signInGoogleForMerge(): Promise<string | null> {
  const res = await fetch("/api/account/merge-token", { method: "POST" });
  if (res.ok) {
    try {
      localStorage.setItem(MERGE_TOKEN_KEY, (await res.json()).token);
    } catch {
      return "Trình duyệt đang chặn lưu trữ nên chưa gộp được dữ liệu.";
    }
  }
  const { error } = await createSupabaseBrowserClient().auth.signInWithOAuth({
    provider: "google", options: { redirectTo: callbackUrl(res.ok ? "/settings/merge" : "/settings") },
  });
  return error ? error.message : null;
}

export async function signOutAndReset(): Promise<void> {
  await createSupabaseBrowserClient().auth.signOut();
  try {
    // Giữ lựa chọn giao diện sáng/tối; xóa mọi thứ thuộc về tài khoản cũ.
    localStorage.removeItem(LEARNER_STATE_KEY);
    localStorage.removeItem(MERGE_TOKEN_KEY);
  } catch {
    // Bỏ qua: trình duyệt chặn localStorage.
  }
  // Tải lại toàn trang (không dùng router) để bỏ hết trạng thái của tài khoản cũ trong bộ nhớ.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign("/");
}
