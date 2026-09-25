"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  LEARNER_STATE_KEY, initialLearnerState, markKnown, parseLearnerState, setLevel, toggleSaved, unmarkKnown,
  type LearnerState, type SavedItem,
} from "./learner-state";

const EVENT = "lyric-lab-learner-state";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}
function readRaw(): string | null {
  try {
    return localStorage.getItem(LEARNER_STATE_KEY);
  } catch {
    return null;
  }
}

/** Trạng thái học từ localStorage (đồng bộ giữa các tab). Bọc sau hook này để M3 đổi sang Supabase mà không sửa giao diện. */
export function useLearnerState() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  const state = useMemo(() => parseLearnerState(raw), [raw]);

  const update = useCallback((fn: (s: LearnerState) => LearnerState) => {
    const next = fn(parseLearnerState(readRaw()));
    try {
      localStorage.setItem(LEARNER_STATE_KEY, JSON.stringify(next));
    } catch {
      // localStorage bị chặn: thay đổi chỉ tồn tại tới khi tải lại trang.
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return {
    state: raw === null ? initialLearnerState : state,
    setLevel: useCallback((level: number) => update((s) => setLevel(s, level)), [update]),
    markKnown: useCallback((key: string) => update((s) => markKnown(s, key)), [update]),
    unmarkKnown: useCallback((key: string) => update((s) => unmarkKnown(s, key)), [update]),
    toggleSaved: useCallback((item: SavedItem) => update((s) => toggleSaved(s, item)), [update]),
  };
}
