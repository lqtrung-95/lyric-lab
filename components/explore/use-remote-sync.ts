"use client";

import { useEffect, useRef } from "react";
import { loadRemoteState, saveRemoteState, type ExploreStateKind } from "@/lib/explore/sync/explore-state-repo";

interface Options<T> {
  kind: ExploreStateKind;
  value: T;
  /** Đã đọc xong bản ở máy. */
  ready: boolean;
  parse: (raw: unknown) => T;
  merge: (local: T, remote: T) => T;
  /** Thay trạng thái bằng bản đã gộp (hook gốc cũng ghi lại localStorage). */
  replace: (next: T) => void;
  /** Cách đọc/ghi riêng (mặc định đọc/ghi cả khối theo `kind`). */
  remote?: { load: () => Promise<unknown | null>; save: (value: T) => Promise<void> };
  /** Tắt đồng bộ (vd. tiến độ phòng chơi chung không được ghi đè tiến độ chơi một mình). */
  disabled?: boolean;
}

const PUSH_DELAY_MS = 1500;

/**
 * Đồng bộ một khối tiến độ với tài khoản: lúc vào lấy bản trên tài khoản, gộp với bản ở máy rồi dùng bản gộp; sau đó mỗi thay đổi được đẩy lên (chờ 1,5 giây cho gọn).
 * Lỗi bất kỳ (chưa đăng nhập, chưa chạy migration, mất mạng) chỉ tắt đồng bộ, game vẫn chơi bình thường bằng bản ở máy.
 */
export function useRemoteSync<T>({ kind, value, ready, parse, merge, replace, remote, disabled }: Options<T>) {
  const valueRef = useRef(value);
  const enabled = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const latest = useRef({ parse, merge, replace, remote });
  useEffect(() => {
    valueRef.current = value;
    latest.current = { parse, merge, replace, remote };
  });

  useEffect(() => {
    if (!ready || disabled) return;
    let alive = true;
    (latest.current.remote?.load() ?? loadRemoteState(kind))
      .then((raw) => {
        if (!alive) return;
        const { parse: p, merge: m, replace: r } = latest.current;
        r(raw == null ? valueRef.current : m(valueRef.current, p(raw)));
        enabled.current = true;
      })
      .catch(() => { enabled.current = false; });
    return () => { alive = false; };
  }, [kind, ready, disabled]);

  useEffect(() => {
    if (!enabled.current) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { (latest.current.remote?.save(valueRef.current) ?? saveRemoteState(kind, valueRef.current)).catch(() => { /* lần sau thử lại */ }); }, PUSH_DELAY_MS);
    return () => clearTimeout(timer.current);
  }, [kind, value]);
}
