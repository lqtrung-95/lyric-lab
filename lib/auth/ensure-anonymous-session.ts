import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

let pending: Promise<boolean> | null = null;

/**
 * Bảo đảm trình duyệt có phiên Supabase (đăng nhập ẩn danh nếu chưa có). Chỉ chạy một lần cho mọi nơi gọi;
 * thất bại thì lần gọi sau thử lại. Trả true nếu có phiên. Cookie phiên do `@supabase/ssr` ghi nên server đọc được.
 */
export function ensureAnonymousSession(): Promise<boolean> {
  pending ??= start().then((ok) => {
    if (!ok) pending = null;
    return ok;
  });
  return pending;
}

async function start(): Promise<boolean> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.getSession();
    if (data.session) return true;
    const { error } = await supabase.auth.signInAnonymously();
    return !error;
  } catch {
    return false;
  }
}

/** Đã có phiên (ẩn danh hoặc Google) trong trình duyệt chưa. Không tạo phiên mới. */
export async function hasExistingSession(): Promise<boolean> {
  try {
    const { data } = await createSupabaseBrowserClient().auth.getSession();
    return Boolean(data.session);
  } catch {
    return false;
  }
}
