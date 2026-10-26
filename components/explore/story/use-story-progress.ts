"use client";

import { useCallback, useEffect, useState } from "react";
import { emptyStory, loadStory, parseStory, saveStory } from "@/lib/explore/story/story-state";
import { mergeStory } from "@/lib/explore/sync/merge-explore-state";
import type { StoryProgress } from "@/lib/explore/story/story-types";
import { loadRemoteStory, saveRemoteStory } from "@/lib/explore/sync/explore-state-repo";
import { useRemoteSync } from "../use-remote-sync";

/** Tiến độ cốt truyện trong localStorage, đồng bộ với tài khoản. `ready` = đã đọc xong (lúc mới vào chưa biết đã chơi tới đâu nên giao diện chờ). */
/** `storageId` (mặc định là `caseId`) là khóa lưu ở máy; `isolated` = không đồng bộ tài khoản (phòng chơi chung). */
export function useStoryProgress(caseId: string, opts: { storageId?: string; isolated?: boolean } = {}) {
  const storageId = opts.storageId ?? caseId;
  const [progress, setProgress] = useState<StoryProgress>(emptyStory);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Đọc kho lưu sau khi mount (server không có localStorage) nên cần setState trong effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(loadStory(window.localStorage, storageId));
    setReady(true);
  }, [storageId]);

  const update = useCallback((fn: (p: StoryProgress) => StoryProgress) => {
    setProgress((cur) => {
      const next = fn(cur);
      saveStory(window.localStorage, next, storageId);
      return next;
    });
  }, [storageId]);

  const replace = useCallback((next: StoryProgress) => update(() => next), [update]);
  useRemoteSync({ kind: "story", value: progress, ready, parse: parseStory, merge: mergeStory, replace, disabled: opts.isolated, remote: { load: () => loadRemoteStory(caseId), save: (v) => saveRemoteStory(caseId, v) } });

  const reset = useCallback(() => update(() => emptyStory()), [update]);
  return { progress, ready, update, reset };
}
