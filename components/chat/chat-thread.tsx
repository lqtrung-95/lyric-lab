"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useIsAdmin } from "@/components/library/use-is-admin";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatMessage } from "@/lib/chat/chat-types";
import { ChatComposer } from "./chat-composer";
import { ChatMessageItem } from "./chat-message-item";
import { useChat } from "./use-chat";

/**
 * Cuộc trò chuyện (danh sách tin cũ → mới, tự cuộn xuống khi có tin mới nếu đang ở cuối, và ô soạn tin), dùng chung cho trang `/chat` và bong bóng chat nổi.
 * Chiều cao vùng danh sách do nơi dùng quyết qua `listClassName`. Quản trị viên xóa/chặn được ngay trên từng tin.
 */
export function ChatThread({ listClassName }: { listClassName: string }) {
  const { messages, status, hasMore, loadingOlder, send, remove, loadOlder } = useChat();
  const canModerate = useIsAdmin() === true;
  const [blocking, setBlocking] = useState<ChatMessage | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const prevCount = useRef(0);

  // Đang ở sát cuối thì giữ nguyên ở cuối khi có tin mới; đang đọc tin cũ ở trên thì không kéo xuống.
  useLayoutEffect(() => {
    const el = list.current;
    if (el && stick.current && messages.length >= prevCount.current) el.scrollTop = el.scrollHeight;
    prevCount.current = messages.length;
  }, [messages]);
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const onScroll = () => { stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80; };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  async function sendAndStick(body: string, announcement: boolean) {
    stick.current = true;
    return send(body, announcement);
  }

  return (
    <>
      <section aria-label="Cuộc trò chuyện" className="min-h-0 flex-1 rounded-3xl bg-surface-container-lowest shadow-[0_1px_10px_rgba(30,26,22,0.06)]">
        <div ref={list} className={`overflow-y-auto p-2 ${listClassName}`}>
          {status === "loading" && <div role="status" aria-label="Đang tải tin nhắn" className="space-y-2 p-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>}
          {status === "error" && <p role="alert" className="p-space-md text-body-md text-error">Chưa tải được tin nhắn. Kiểm tra kết nối rồi tải lại trang nhé.</p>}
          {status === "ready" && (
            <>
              {hasMore && (
                <div className="flex justify-center p-2">
                  <button type="button" onClick={() => void loadOlder()} disabled={loadingOlder} className="inline-flex min-h-11 items-center rounded-full bg-surface-container-high px-4 text-label-md font-medium text-on-surface hover:bg-surface-container-highest disabled:opacity-60">
                    {loadingOlder ? "Đang tải…" : "Xem tin cũ hơn"}
                  </button>
                </div>
              )}
              {messages.length === 0 ? (
                <p className="p-space-lg text-center text-body-md text-on-surface-variant">Chưa có tin nhắn nào. Hãy là người đầu tiên chào mọi người nhé.</p>
              ) : (
                <ol role="log" aria-live="polite" aria-label="Các tin nhắn" className="space-y-0.5">
                  {messages.map((m) => <ChatMessageItem key={m.id} message={m} canModerate={canModerate} onDelete={remove} onRequestBlock={setBlocking} />)}
                </ol>
              )}
            </>
          )}
        </div>
      </section>
      <ChatComposer onSend={sendAndStick} />
      {/* MỘT hộp thoại xác nhận chung cho mọi tin (xem ChatMessageItem). */}
      <ConfirmDialog
        open={blocking !== null} title={`Chặn ${blocking?.nickname ?? ""}?`} body="Tin này sẽ bị xóa và người này không gửi được tin trong cộng đồng nữa (vẫn đọc được). Dùng cho spam hoặc nói tục."
        confirmLabel="Xóa và chặn" cancelLabel="Hủy"
        onCancel={() => setBlocking(null)}
        onConfirm={() => { const m = blocking; setBlocking(null); if (m) void remove(m.id, true); }}
      />
    </>
  );
}
