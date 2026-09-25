import { ensureAnonymousSession, hasExistingSession } from "@/lib/auth/ensure-anonymous-session";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import type { LearnerState } from "@/lib/user-state/learner-state";
import { readLearnerState, writeLearnerState } from "@/lib/user-state/local-learner-store";
import { diffLearnerState, isEmptyOps, opsFromState, stateFromRemote } from "./learner-sync";
import { fetchRemoteLearner, pushLearnerOps } from "./remote-learner-repo";

let ready: Promise<string | null> | null = null;

async function bootstrap(): Promise<string | null> {
  const { data } = await createSupabaseBrowserClient().auth.getSession();
  const userId = data.session?.user.id;
  if (!userId) return null;

  const remote = await fetchRemoteLearner();
  if (remote.level === null) {
    // Tài khoản chưa có hồ sơ: nhập trạng thái đang có trong trình duyệt (level, đã biết, thẻ đã lưu) một lần.
    await pushLearnerOps(userId, opsFromState(readLearnerState()));
  } else {
    writeLearnerState(stateFromRemote(remote));
  }
  return userId;
}

/**
 * Đồng bộ lần đầu: nhập dữ liệu cũ hoặc tải bản từ Supabase về. Chạy một lần cho mọi nơi gọi; lỗi thì lần sau thử lại.
 * Khi mở trang (`createSession` = false) chỉ đồng bộ nếu đã có phiên, để người chỉ xem không sinh tài khoản ẩn danh;
 * phiên được tạo ở lần thay đổi đầu tiên.
 */
export async function startLearnerSync(createSession = false): Promise<string | null> {
  if (ready) return ready;
  const hasSession = createSession ? await ensureAnonymousSession() : await hasExistingSession();
  if (!hasSession) return null;
  ready ??= bootstrap().catch((error) => {
    console.warn("learner sync bootstrap failed", error);
    ready = null;
    return null;
  });
  return ready;
}

/** Đẩy thay đổi giữa hai trạng thái lên Supabase (sau khi đồng bộ lần đầu xong). Lỗi mạng chỉ ghi log: bản cục bộ vẫn dùng được. */
export async function pushLearnerChange(prev: LearnerState, next: LearnerState): Promise<void> {
  const ops = diffLearnerState(prev, next);
  if (isEmptyOps(ops)) return;
  try {
    const userId = await startLearnerSync(true);
    if (userId) await pushLearnerOps(userId, ops);
  } catch (error) {
    console.warn("learner sync push failed", error);
  }
}
