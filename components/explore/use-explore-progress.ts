"use client";

import { useCallback, useEffect, useState } from "react";
import { emptyProgress, loadProgress, markDiscovered, recordAnswer, saveProgress, type ExploreProgress } from "@/lib/explore/explore-progress";

/** Tiến độ khám phá trong localStorage. `ready` = đã đọc xong (tránh nháy trạng thái "chưa học" lúc mới vào). */
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

  const discover = useCallback((id: string) => update((p) => markDiscovered(p, id, Date.now())), [update]);
  const answer = useCallback((id: string, ok: boolean) => update((p) => recordAnswer(p, id, ok, Date.now())), [update]);
  const reset = useCallback(() => update(() => emptyProgress()), [update]);

  return { progress, ready, now, discover, answer, reset };
}
