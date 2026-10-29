"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";
import { parsePet, type Pet } from "@/lib/pet/pet-logic";
import { PET_EVENT, PET_STORAGE_KEY, loadRemotePet, saveRemotePet, writeLocalPet } from "@/lib/pet/pet-repo";

// Mỗi trang chỉ đồng bộ với tài khoản một lần dù có nhiều thành phần dùng `usePet` (thẻ pet, pet thu nhỏ ở màn học).
let synced = false;

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(PET_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(PET_EVENT, onChange);
  };
}
function readRaw(): string | null {
  try {
    return localStorage.getItem(PET_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Linh vật của người dùng. undefined = chưa đọc xong (lần vẽ đầu), null = chưa nhận nuôi. Bản gốc ở bảng `user_pet`, trình duyệt giữ bản làm việc; chưa chạy migration thì chỉ lưu ở trình duyệt. */
export function usePet() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => undefined);
  const pet = useMemo<Pet | null | undefined>(() => {
    if (raw === undefined) return undefined;
    try {
      return raw ? parsePet(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  }, [raw]);

  // Đồng bộ một lần khi mở trang: tài khoản đã có pet thì lấy về; chỉ có ở trình duyệt thì đẩy lên.
  useEffect(() => {
    if (synced) return;
    synced = true;
    let cancelled = false;
    (async () => {
      try {
        if (!(await ensureAnonymousSession())) return;
        const remote = await loadRemotePet();
        if (cancelled) return;
        const local = parsePet(JSON.parse(readRaw() ?? "null"));
        if (remote && !local) writeLocalPet(remote);
        else if (!remote && local) await saveRemotePet(local);
      } catch {
        // Chưa chạy migration hoặc chưa có phiên: dùng bản trong trình duyệt.
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const adopt = useCallback((next: Pet) => {
    writeLocalPet(next);
    void saveRemotePet(next).catch(() => {});
  }, []);

  return { pet, adopt };
}
