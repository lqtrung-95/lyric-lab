"use client";

import { useCallback, useEffect } from "react";
import { useLocalJson } from "@/components/pet/use-local-json-store";
import { ensureAnonymousSession, hasExistingSession } from "@/lib/auth/ensure-anonymous-session";
import { EMPTY_STATS, GRAMMAR_STATS_EVENT, GRAMMAR_STATS_KEY, mergeStats, parseGrammarStats, recordAnswer, sameStats, type GrammarStats } from "@/lib/grammar/grammar-stats";
import { loadRemoteGrammarStats, saveRemoteGrammarStats } from "@/lib/grammar/grammar-stats-repo";

// Mỗi trang chỉ gộp với tài khoản một lần dù nhiều thành phần dùng hook (trang chủ pet, hub, bài tập).
let synced = false;
let pushTimer: ReturnType<typeof setTimeout> | undefined;

function readLocal(): GrammarStats {
  try { return parseGrammarStats(JSON.parse(localStorage.getItem(GRAMMAR_STATS_KEY) ?? "null")); } catch { return EMPTY_STATS; }
}

/** Đẩy bản mới nhất lên tài khoản sau một nhịp (gom nhiều câu liên tiếp); lỗi mạng hay chưa chạy migration thì bỏ qua, bản cục bộ vẫn đúng. */
function schedulePush() {
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    void (async () => {
      try { if (await ensureAnonymousSession()) await saveRemoteGrammarStats(readLocal()); } catch { /* chưa đồng bộ được */ }
    })();
  }, 1500);
}

/** Thống kê đúng/sai theo mẫu ngữ pháp: bản làm việc ở thiết bị, gộp với tài khoản (bảng `user_grammar_stats`) khi đã có phiên. */
export function useGrammarStats() {
  const [stats, write] = useLocalJson<GrammarStats>(GRAMMAR_STATS_KEY, GRAMMAR_STATS_EVENT, parseGrammarStats, EMPTY_STATS);

  useEffect(() => {
    if (synced) return;
    synced = true;
    void (async () => {
      try {
        if (!(await hasExistingSession())) { synced = false; return; }
        const local = readLocal();
        const merged = mergeStats(local, await loadRemoteGrammarStats());
        if (!sameStats(merged, local)) write(merged);
        await saveRemoteGrammarStats(merged);
      } catch { /* chưa có bảng hoặc mất mạng: dùng bản trong trình duyệt */ }
    })();
  }, [write]);

  const record = useCallback((patternId: string, correct: boolean) => {
    write(recordAnswer(readLocal(), patternId, correct, Date.now()));
    schedulePush();
  }, [write]);
  return { stats, record };
}
