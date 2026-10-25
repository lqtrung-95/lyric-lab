"use client";

import { useCallback, useEffect, useState } from "react";
import { emptyStory, loadStory, saveStory } from "@/lib/explore/story/story-state";
import type { StoryProgress } from "@/lib/explore/story/story-types";

/** Tiến độ cốt truyện trong localStorage. `ready` = đã đọc xong (lúc mới vào chưa biết đã chơi tới đâu nên giao diện chờ). */
export function useStoryProgress() {
  const [progress, setProgress] = useState<StoryProgress>(emptyStory);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Đọc kho lưu sau khi mount (server không có localStorage) nên cần setState trong effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(loadStory(window.localStorage));
    setReady(true);
  }, []);

  const update = useCallback((fn: (p: StoryProgress) => StoryProgress) => {
    setProgress((cur) => {
      const next = fn(cur);
      saveStory(window.localStorage, next);
      return next;
    });
  }, []);

  const reset = useCallback(() => update(() => emptyStory()), [update]);
  return { progress, ready, update, reset };
}
