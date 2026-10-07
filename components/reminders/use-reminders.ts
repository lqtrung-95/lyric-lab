"use client";

import { useCallback, useEffect, useState } from "react";
import { VAPID_PUBLIC_KEY } from "@/lib/push/push-config";

export type ReminderStatus = "loading" | "unsupported" | "off" | "on" | "denied";

/** Lý do không đăng ký được nhắc học, để hiện cho người dùng (và để chẩn đoán nhanh khi cấu hình sai). */
export type ReminderError = "bad_key" | "push_service" | "server" | "network";

export const REMINDER_ERROR_MESSAGES: Record<ReminderError, string> = {
  bad_key: "Khóa thông báo của hệ thống bị lỗi định dạng. Hãy báo cho quản trị viên.",
  push_service: "Trình duyệt không kết nối được dịch vụ thông báo. Với Brave, bật “Use Google services for push messaging” trong cài đặt; hoặc thử trình duyệt khác.",
  server: "Máy chủ chưa lưu được đăng ký (có thể do chưa đăng nhập hoặc thiếu cấu hình). Thử tải lại trang rồi bật lại.",
  network: "Chưa đăng ký được. Kiểm tra kết nối rồi thử lại.",
};

const classify = (e: unknown): ReminderError => {
  const name = (e as { name?: string })?.name;
  if (name === "InvalidCharacterError" || name === "InvalidAccessError") return "bad_key";
  if (name === "AbortError" || name === "NotSupportedError") return "push_service";
  return "network";
};

function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

const supported = () => typeof window !== "undefined" && Boolean(VAPID_PUBLIC_KEY) && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

async function currentSubscription(): Promise<PushSubscription | null> {
  const reg = await navigator.serviceWorker.getRegistration("/sw.js");
  return reg ? reg.pushManager.getSubscription() : null;
}

const post = (method: "POST" | "DELETE", body: unknown) =>
  fetch("/api/push/subscribe", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

/**
 * Bật/tắt nhắc học bằng thông báo đẩy của trình duyệt. Thiết bị không hỗ trợ (hoặc server chưa có khóa VAPID) thì `status = "unsupported"`
 * và giao diện tự ẩn. Khi đã bật, mỗi lần mở app đăng ký lại endpoint để nó gắn với đúng tài khoản hiện tại (kể cả sau khi gộp tài khoản).
 */
export function useReminders() {
  const [status, setStatus] = useState<ReminderStatus>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ReminderError | null>(null);

  useEffect(() => {
    void (async () => {
      if (!supported()) return setStatus("unsupported");
      if (Notification.permission === "denied") return setStatus("denied");
      const sub = await currentSubscription().catch(() => null);
      if (sub && Notification.permission === "granted") {
        void post("POST", sub.toJSON()).catch(() => {});
        return setStatus("on");
      }
      setStatus("off");
    })();
  }, []);

  const enable = useCallback(async (): Promise<boolean> => {
    if (!supported()) return false;
    setBusy(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setStatus(permission === "denied" ? "denied" : "off"); return false; }
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64ToBytes(VAPID_PUBLIC_KEY) }));
      const res = await post("POST", sub.toJSON());
      if (!res.ok) { await sub.unsubscribe().catch(() => {}); setError("server"); setStatus("off"); return false; }
      setStatus("on");
      return true;
    } catch (e) {
      console.error("reminder_subscribe_failed", e);
      setError(classify(e));
      setStatus("off");
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  const disable = useCallback(async () => {
    setBusy(true);
    try {
      const sub = await currentSubscription();
      if (sub) {
        await post("DELETE", { endpoint: sub.endpoint }).catch(() => {});
        await sub.unsubscribe().catch(() => {});
      }
      setStatus("off");
    } finally {
      setBusy(false);
    }
  }, []);

  return { status, busy, error, enable, disable };
}
