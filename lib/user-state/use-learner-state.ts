"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { notifyDueCountChanged } from "@/lib/review/due-count-event";
import { pushLearnerChange, startLearnerSync } from "@/lib/user-data/learner-sync-client";
import {
  initialLearnerState, markKnown, parseLearnerState, setLevel, toggleSaved, unmarkKnown,
  type LearnerState, type SavedItem,
} from "./learner-state";
import { LEARNER_STATE_EVENT, readLearnerRaw, readLearnerState, writeLearnerState } from "./local-learner-store";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(LEARNER_STATE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(LEARNER_STATE_EVENT, onChange);
  };
}

/**
 * Trạng thái học: đọc/ghi localStorage ngay (không chờ mạng) và đồng bộ với Supabase ở nền.
 * Lần đầu có phiên thì nhập dữ liệu cũ hoặc tải bản đã lưu về (đăng nhập ở thiết bị khác).
 */
export function useLearnerState() {
  const raw = useSyncExternalStore(subscribe, readLearnerRaw, () => null);
  const state = useMemo(() => parseLearnerState(raw), [raw]);

  useEffect(() => {
    void startLearnerSync();
  }, []);

  const update = useCallback((fn: (s: LearnerState) => LearnerState) => {
    const prev = readLearnerState();
    const next = fn(prev);
    writeLearnerState(next);
    void pushLearnerChange(prev, next).then(notifyDueCountChanged);
  }, []);

  return {
    state: raw === null ? initialLearnerState : state,
    setLevel: useCallback((level: number) => update((s) => setLevel(s, level)), [update]),
    markKnown: useCallback((key: string) => update((s) => markKnown(s, key)), [update]),
    unmarkKnown: useCallback((key: string) => update((s) => unmarkKnown(s, key)), [update]),
    toggleSaved: useCallback((item: SavedItem) => update((s) => toggleSaved(s, item)), [update]),
  };
}
