"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";
import type { ChatMessage } from "@/lib/chat/chat-types";
import { markChatSeen } from "./chat-status-store";

const POLL_MS = 5000;

interface ListResponse { messages: ChatMessage[]; hasMore: boolean; deletedIds: number[] }
type SendError = "empty" | "too_long" | "has_link" | "inappropriate" | "spam" | "duplicate" | "nickname_required" | "rate_limited" | "blocked" | "auth_required" | "server_error" | "network";

/** Gộp tin mới vào danh sách (bỏ trùng theo id, giữ thứ tự id tăng dần) và gỡ các tin đã bị xóa. */
function merge(current: ChatMessage[], incoming: ChatMessage[], deletedIds: number[] = []): ChatMessage[] {
  const gone = new Set(deletedIds);
  const byId = new Map(current.map((m) => [m.id, m]));
  for (const m of incoming) byId.set(m.id, m);
  return [...byId.values()].filter((m) => !gone.has(m.id)).sort((a, b) => a.id - b.id);
}

/**
 * Chat cộng đồng: tải 50 tin mới nhất, hỏi tin mới mỗi 5 giây khi tab đang hiện (CDN giữ vài giây nên nhiều người cùng hỏi chỉ tốn một lượt đọc DB), gửi tin,
 * xóa tin (quản trị), xem tin cũ hơn. Mở trang này thì coi như đã xem tới tin mới nhất.
 */
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const lastId = useRef(0);

  const apply = useCallback((incoming: ChatMessage[], deletedIds: number[] = []) => {
    setMessages((cur) => {
      const next = merge(cur, incoming, deletedIds);
      lastId.current = next.at(-1)?.id ?? lastId.current;
      return next;
    });
  }, []);

  useEffect(() => {
    if (lastId.current > 0) markChatSeen(lastId.current);
  }, [messages]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/chat", { cache: "no-store" })
      .then(async (r) => (r.ok ? ((await r.json()) as ListResponse) : Promise.reject(new Error("chat"))))
      .then((d) => { if (cancelled) return; apply(d.messages, d.deletedIds); setHasMore(d.hasMore); setStatus("ready"); })
      .catch(() => { if (!cancelled) setStatus("error"); });
    return () => { cancelled = true; };
  }, [apply]);

  useEffect(() => {
    if (status !== "ready") return;
    const poll = async () => {
      if (document.visibilityState === "hidden") return;
      try {
        const res = await fetch(`/api/chat?after=${lastId.current}`, { cache: "no-store" });
        if (!res.ok) return;
        const d = (await res.json()) as ListResponse;
        apply(d.messages, d.deletedIds);
      } catch { /* lần sau thử lại */ }
    };
    const timer = setInterval(() => void poll(), POLL_MS);
    const onVisible = () => { if (document.visibilityState === "visible") void poll(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, [status, apply]);

  const send = useCallback(async (body: string, announcement: boolean): Promise<SendError | null> => {
    if (!(await ensureAnonymousSession())) return "auth_required";
    const post = () => fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body, announcement }) });
    try {
      let res = await post();
      if (res.status === 401 && (await ensureAnonymousSession())) res = await post();
      const data = (await res.json().catch(() => ({}))) as { message?: ChatMessage; error?: SendError };
      if (!res.ok || !data.message) return data.error ?? "server_error";
      apply([data.message]);
      return null;
    } catch {
      return "network";
    }
  }, [apply]);

  const remove = useCallback(async (id: number, block: boolean): Promise<boolean> => {
    try {
      const res = await fetch(`/api/chat/${id}${block ? "?block=1" : ""}`, { method: "DELETE" });
      if (!res.ok && res.status !== 404) return false;
      setMessages((cur) => cur.filter((m) => m.id !== id));
      return true;
    } catch {
      return false;
    }
  }, []);

  const loadOlder = useCallback(async () => {
    const first = messages[0]?.id;
    if (!first || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const res = await fetch(`/api/chat?before=${first}`, { cache: "no-store" });
      if (!res.ok) return;
      const d = (await res.json()) as ListResponse;
      setMessages((cur) => merge(cur, d.messages));
      setHasMore(d.hasMore);
    } finally {
      setLoadingOlder(false);
    }
  }, [messages, loadingOlder]);

  return { messages, status, hasMore, loadingOlder, send, remove, loadOlder };
}
