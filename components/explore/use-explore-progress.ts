"use client";

import { useCallback, useEffect, useState } from "react";
import { clearScene, emptyProgress, loadProgress, markDiscovered, parseProgress, recordAnswer, saveProgress, type ExploreProgress } from "@/lib/explore/explore-progress";
import { mergeProgress } from "@/lib/explore/sync/merge-explore-state";
import { useRemoteSync } from "./use-remote-sync";

/** Tiến độ khám phá: lưu ở localStorage và đồng bộ với tài khoản (xem `useRemoteSync`). `ready` = đã đọc xong (tránh nháy trạng thái "chưa học" lúc mới vào). */
export function useExploreProgress() {
  const [progress, setProgress] = useState<ExploreProgress>(emptyProgress);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(0);

  useEffect(() => {
    // Đọc kho lưu sau khi mount (server không có localStorage) nên cần setState trong effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(loadProgress(window.localStorage));
    setNow(Date.now());
    setReady(true);
  }, []);

  const update = useCallback((fn: (p: ExploreProgress) => ExploreProgress) => {
    setProgress((cur) => {
      const next = fn(cur);
      saveProgress(window.localStorage, next);
      return next;
    });
  }, []);

  const replace = useCallback((next: ExploreProgress) => update(() => next), [update]);
  useRemoteSync({ kind: "progress", value: progress, ready, parse: parseProgress, merge: mergeProgress, replace });

  const discover = useCallback((id: string) => update((p) => markDiscovered(p, id, Date.now())), [update]);
  const answer = useCallback((id: string, ok: boolean) => update((p) => recordAnswer(p, id, ok, Date.now())), [update]);
  const resetScene = useCallback((sceneId: string) => update((p) => clearScene(p, sceneId)), [update]);

  return { progress, ready, now, discover, answer, resetScene };
}
