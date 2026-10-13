"use client";

import { useRef, useState } from "react";
import { NicknameForm } from "@/components/leaderboard/nickname-form";
import { useIsAdmin } from "@/components/library/use-is-admin";
import { useNickname } from "@/components/profile/use-nickname";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatSignInPrompt } from "./chat-sign-in-prompt";
import { useChatAccount } from "./use-chat-account";
import { CHAT_ERROR_MESSAGES, CHAT_MAX_CHARS } from "@/lib/chat/validate-chat-message";

/**
 * Ô soạn tin. Chưa đăng nhập Google thì chỉ có lời mời đăng nhập (nhắn tin cần tài khoản thật). Chưa có biệt danh thì hiện form đặt ngay tại chỗ (biệt danh dùng chung với bảng xếp hạng và phòng thi đấu). Quản trị viên có ô chọn "Gửi dưới dạng thông báo".
 * Enter gửi, Shift+Enter xuống dòng. `onSend` trả mã lỗi hoặc null.
 */
export function ChatComposer({ onSend }: { onSend: (body: string, announcement: boolean) => Promise<string | null> }) {
  const registered = useChatAccount();
  const nick = useNickname();
  const isAdmin = useIsAdmin() === true;
  const [text, setText] = useState("");
  const [announcement, setAnnouncement] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLTextAreaElement>(null);

  if (registered === undefined || nick.nickname === undefined) return <Skeleton className="h-24 w-full" />;
  if (!registered) return <ChatSignInPrompt />;
  if (nick.nickname === null) {
    return (
      <div className="rounded-2xl bg-surface-container-low p-space-md">
        <p className="mb-2 text-body-md text-on-surface">Đặt biệt danh để nhắn tin trong cộng đồng. Biệt danh dùng chung với bảng xếp hạng và phòng thi đấu.</p>
        <NicknameForm submitLabel="Lưu biệt danh" onSubmit={nick.save} />
      </div>
    );
  }

  async function submit() {
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true);
    setError(null);
    const code = await onSend(body, isAdmin && announcement);
    setBusy(false);
    if (code) return setError((CHAT_ERROR_MESSAGES as Record<string, string>)[code] ?? CHAT_ERROR_MESSAGES.server_error);
    setText("");
    setAnnouncement(false);
    input.current?.focus();
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); void submit(); }} className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Tin nhắn</span>
          <textarea
            ref={input} value={text} rows={2} maxLength={CHAT_MAX_CHARS} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void submit(); } }}
            placeholder={`Nhắn với tên ${nick.nickname}… (Enter để gửi)`}
            className="block w-full resize-none rounded-2xl border border-outline-variant bg-surface-container-lowest p-3 text-body-md text-on-surface focus:border-primary focus:outline-none"
          />
        </label>
        <button type="submit" disabled={busy || !text.trim()} aria-label="Gửi tin nhắn" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary hover:bg-primary-container disabled:opacity-50">
          <Icon name="send" size={22} />
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-label-sm text-on-surface-variant">
        <span>Giữ lịch sự, không gửi link hay quảng cáo.</span>
        <span>{text.length}/{CHAT_MAX_CHARS}</span>
      </div>
      {isAdmin && (
        <label className="flex min-h-11 items-center gap-2 text-label-md text-on-surface">
          <input type="checkbox" className="h-5 w-5 accent-[var(--color-primary)]" checked={announcement} onChange={(e) => setAnnouncement(e.target.checked)} />
          Gửi dưới dạng thông báo (nổi bật, hiện banner ở trang chủ)
        </label>
      )}
      {error && <p role="alert" className="text-label-md text-error">{error}</p>}
    </form>
  );
}
