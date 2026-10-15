"use client";

import { useCallback, useEffect, useState } from "react";
import { emptyProgress, loadProgress, saveProgress, type PronunciationProgress } from "@/lib/pronunciation/learning-progress";

/** Tiến độ luyện phát âm trên thiết bị. Bản đầu (server và lần render đầu) là rỗng, đọc localStorage sau khi hydrate để tránh lệch HTML. */
export function usePronunciationProgress() {
  const [progress, setProgress] = useState<PronunciationProgress>(emptyProgress);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage chỉ đọc được sau hydrate
  useEffect(() => { setProgress(loadProgress()); }, []);
  const update = useCallback((fn: (p: PronunciationProgress) => PronunciationProgress) => {
    setProgress((prev) => { const next = fn(prev); saveProgress(next); return next; });
  }, []);
  return { progress, update };
}
