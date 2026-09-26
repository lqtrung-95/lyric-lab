"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { normalizeOffset, parseOffsets } from "@/lib/listen/lyric-offset";
import { fetchRemoteOffset, pushRemoteOffset } from "@/lib/user-data/lyric-offset-repo";

const KEY = "lyric-lab-lyric-offsets";
const EVENT = "lyric-lab-lyric-offsets-changed";

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
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}
function writeLocal(videoId: string, offset: number) {
  try {
    const table = parseOffsets(readRaw());
    if (offset === 0) delete table[videoId];
    else table[videoId] = offset;
    localStorage.setItem(KEY, JSON.stringify(table));
  } catch {
    // localStorage bị chặn: độ lệch chỉ có hiệu lực tới khi tải lại trang.
  }
  window.dispatchEvent(new Event(EVENT));
}

/**
 * Độ lệch lời của một bài (giây), lưu trong trình duyệt và đồng bộ lên tài khoản khi đã có phiên.
 * Khi mở bài mà máy này chưa có bản cục bộ thì lấy bản trên tài khoản (chỉnh ở thiết bị khác).
 */
export function useLyricOffset(videoId: string | null | undefined) {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  const local = videoId ? parseOffsets(raw)[videoId] : undefined;

  useEffect(() => {
    if (!videoId || local !== undefined) return;
    let cancelled = false;
    fetchRemoteOffset(videoId).then((remote) => {
      if (!cancelled && remote) writeLocal(videoId, normalizeOffset(remote));
    });
    return () => { cancelled = true; };
  }, [videoId, local]);

  const setOffset = useCallback((value: number) => {
    if (!videoId) return;
    const next = normalizeOffset(value);
    writeLocal(videoId, next);
    void pushRemoteOffset(videoId, next);
  }, [videoId]);

  return { offset: local ?? 0, setOffset };
}
