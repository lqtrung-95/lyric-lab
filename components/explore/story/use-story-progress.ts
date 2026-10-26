"use client";

import { useCallback, useEffect, useState } from "react";
import { emptyStory, loadStory, parseStory, saveStory } from "@/lib/explore/story/story-state";
import { mergeStory } from "@/lib/explore/sync/merge-explore-state";
import type { StoryProgress } from "@/lib/explore/story/story-types";
import { loadRemoteStory, saveRemoteStory } from "@/lib/explore/sync/explore-state-repo";
import { useRemoteSync } from "../use-remote-sync";

/** Tiến độ cốt truyện trong localStorage, đồng bộ với tài khoản. `ready` = đã đọc xong (lúc mới vào chưa biết đã chơi tới đâu nên giao diện chờ). */
export function useStoryProgress(caseId: string) {
  const [progress, setProgress] = useState<StoryProgress>(emptyStory);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Đọc kho lưu sau khi mount (server không có localStorage) nên cần setState trong effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(loadStory(window.localStorage, caseId));
    setReady(true);
  }, [caseId]);

  const update = useCallback((fn: (p: StoryProgress) => StoryProgress) => {
    setProgress((cur) => {
      const next = fn(cur);
      saveStory(window.localStorage, next, caseId);
      return next;
    });
  }, [caseId]);

  const replace = useCallback((next: StoryProgress) => update(() => next), [update]);
  useRemoteSync({ kind: "story", value: progress, ready, parse: parseStory, merge: mergeStory, replace, remote: { load: () => loadRemoteStory(caseId), save: (v) => saveRemoteStory(caseId, v) } });

  const reset = useCallback(() => update(() => emptyStory()), [update]);
  return { progress, ready, update, reset };
}
