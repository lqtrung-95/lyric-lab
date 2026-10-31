"use client";

import { useCallback, useEffect } from "react";
import { useLocalJson } from "@/components/pet/use-local-json-store";
import { ensureAnonymousSession, hasExistingSession } from "@/lib/auth/ensure-anonymous-session";
import { EMPTY_PROGRESS, RADICAL_PROGRESS_EVENT, RADICAL_PROGRESS_KEY, mergeRadicalProgress, parseRadicalProgress, recordRadicalAnswer, toggleKnown, type RadicalProgress } from "@/lib/radicals/radicals-progress";
import { loadRemoteRadicalProgress, saveRemoteRadicalProgress } from "@/lib/radicals/radicals-progress-repo";

// Mỗi trang chỉ gộp với tài khoản một lần dù nhiều thành phần dùng hook.
let synced = false;
let pushTimer: ReturnType<typeof setTimeout> | undefined;

function readLocal(): RadicalProgress {
  try { return parseRadicalProgress(JSON.parse(localStorage.getItem(RADICAL_PROGRESS_KEY) ?? "null")); } catch { return EMPTY_PROGRESS; }
}

/** Đẩy bản mới nhất lên tài khoản sau một nhịp (gom nhiều thay đổi liên tiếp); lỗi mạng hay chưa chạy migration thì bỏ qua, bản cục bộ vẫn đúng. */
function schedulePush() {
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    void (async () => {
      try { if (await ensureAnonymousSession()) await saveRemoteRadicalProgress(readLocal()); } catch { /* chưa đồng bộ được */ }
    })();
  }, 1500);
}

/** Tiến độ bộ thủ: bản làm việc ở thiết bị, gộp với tài khoản (bảng `user_radical_progress`) khi đã có phiên. */
export function useRadicalProgress() {
  const [progress, write] = useLocalJson<RadicalProgress>(RADICAL_PROGRESS_KEY, RADICAL_PROGRESS_EVENT, parseRadicalProgress, EMPTY_PROGRESS);

  useEffect(() => {
    if (synced) return;
    synced = true;
    void (async () => {
      try {
        if (!(await hasExistingSession())) { synced = false; return; }
        const local = readLocal();
        const merged = mergeRadicalProgress(local, await loadRemoteRadicalProgress());
        if (JSON.stringify(merged) !== JSON.stringify(local)) write(merged);
        await saveRemoteRadicalProgress(merged);
      } catch { /* chưa có bảng hoặc mất mạng: dùng bản trong trình duyệt */ }
    })();
  }, [write]);

  const toggle = useCallback((num: number) => { write(toggleKnown(readLocal(), num)); schedulePush(); }, [write]);
  const record = useCallback((num: number, correct: boolean) => { write(recordRadicalAnswer(readLocal(), num, correct, Date.now())); schedulePush(); }, [write]);
  return { progress, toggle, record };
}
