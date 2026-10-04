"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { normalizeOffset, parseOffsetEntries, parseOffsets, resolveOffset } from "@/lib/listen/lyric-offset";
import { fetchRemoteOffset, pushRemoteOffset } from "@/lib/user-data/lyric-offset-repo";

const KEY = "lyric-lab-lyric-offsets";
// Mức mặc định hiện tại của từng bài (do admin đặt) mà trình duyệt này đã nhận từ server, để biết bản chỉnh cá nhân đã cũ chưa.
const DEFAULTS_KEY = "lyric-lab-default-offsets";
const EVENT = "lyric-lab-lyric-offsets-changed";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}
const read = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const readRaw = () => read(KEY);
const readDefaultsRaw = () => read(DEFAULTS_KEY);

function writeLocal(videoId: string, offset: number, base: number) {
  try {
    const table = parseOffsetEntries(readRaw());
    // Lưu cả giá trị 0 (không xóa khóa): "chưa có bản cục bộ" mới đi hỏi tài khoản, còn "đã đặt về 0" thì không. Nếu xóa khóa,
    // lúc vừa đặt về 0 máy sẽ hỏi lại tài khoản trước khi bản 0 kịp ghi lên đó và nhận về độ lệch cũ.
    table[videoId] = { o: offset, base };
    localStorage.setItem(KEY, JSON.stringify(table));
  } catch {
    // localStorage bị chặn: độ lệch chỉ có hiệu lực tới khi tải lại trang.
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Ghi nhận mức mặc định hiện tại của một bài (server gửi kèm lời). Gọi mỗi khi nhận được lời từ server. */
export function noteDefaultOffset(videoId: string, defaultOffsetSec: number) {
  try {
    const table = parseOffsets(readDefaultsRaw());
    if (table[videoId] === defaultOffsetSec) return;
    table[videoId] = defaultOffsetSec;
    localStorage.setItem(DEFAULTS_KEY, JSON.stringify(table));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // localStorage bị chặn: bỏ qua.
  }
}

/** Độ lệch cá nhân đã lưu của một bài, đọc một lần (không phải hook): dùng trong trình xử lý sự kiện. 0 nếu chưa chỉnh hoặc đã cũ. */
export const readLyricOffset = (videoId: string): number =>
  resolveOffset(parseOffsetEntries(readRaw())[videoId], parseOffsets(readDefaultsRaw())[videoId]) ?? 0;

/**
 * Độ lệch lời cá nhân của một bài (giây), cộng lên trên mức mặc định của bài (`defaultOffsetSec`, do admin đặt, đã nằm sẵn
 * trong mốc thời gian server trả về). Lưu trong trình duyệt và đồng bộ lên tài khoản khi đã có phiên.
 * Khi mở bài mà máy này chưa có bản cục bộ thì lấy bản trên tài khoản (chỉnh ở thiết bị khác).
 * Khi admin đổi mức mặc định sau lúc người dùng chỉnh, bản chỉnh cũ tự bị bỏ để không cộng đôi.
 */
export function useLyricOffset(videoId: string | null | undefined, defaultOffsetSec?: number) {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  const defaultsRaw = useSyncExternalStore(subscribe, readDefaultsRaw, () => null);
  // Mức mặc định từ server (nếu có) thắng bản đã lưu, để lần vẽ đầu tiên không nháy một frame cộng đôi.
  const known = videoId ? defaultOffsetSec ?? parseOffsets(defaultsRaw)[videoId] : undefined;
  const local = videoId ? resolveOffset(parseOffsetEntries(raw)[videoId], known) : undefined;

  useEffect(() => {
    if (videoId && defaultOffsetSec !== undefined) noteDefaultOffset(videoId, defaultOffsetSec);
  }, [videoId, defaultOffsetSec]);

  useEffect(() => {
    if (!videoId || local !== undefined) return;
    let cancelled = false;
    fetchRemoteOffset(videoId).then((remote) => {
      if (!cancelled && remote) writeLocal(videoId, normalizeOffset(remote), known ?? 0);
    });
    return () => { cancelled = true; };
  }, [videoId, local, known]);

  const setOffset = useCallback((value: number) => {
    if (!videoId) return;
    const next = normalizeOffset(value);
    writeLocal(videoId, next, known ?? 0);
    void pushRemoteOffset(videoId, next);
  }, [videoId, known]);

  return { offset: local ?? 0, setOffset };
}
