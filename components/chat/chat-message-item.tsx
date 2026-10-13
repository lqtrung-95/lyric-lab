"use client";

import { AvatarCircle } from "@/components/leaderboard/avatar-circle";
import { Icon } from "@/components/ui/icon";
import { formatChatTime } from "@/lib/chat/chat-time";
import type { ChatMessage } from "@/lib/chat/chat-types";

/** Huy hiệu của quản trị viên: do server gắn theo tài khoản (`isAdmin`), người dùng không tự đặt được; biệt danh trùng chữ "admin" cũng không có huy hiệu này. */
function AdminBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-label-sm font-semibold text-on-primary">
      <Icon name="verified" size={14} filled />Admin
    </span>
  );
}

const iconButton = "flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface";

/**
 * Một tin nhắn. Thông báo của quản trị được làm nổi bật (khung màu, nhãn "Thông báo"). Quản trị viên có nút xóa tin và xóa kèm chặn người gửi; việc chặn cần xác nhận nên
 * chỉ báo lên `onRequestBlock` (màn hình giữ MỘT hộp thoại xác nhận chung: mỗi tin một hộp thoại sẽ trùng id `confirm-title` và sai tên trợ năng).
 */
export function ChatMessageItem({ message, canModerate, onDelete, onRequestBlock }: { message: ChatMessage; canModerate: boolean; onDelete: (id: number, block: boolean) => Promise<boolean>; onRequestBlock: (message: ChatMessage) => void }) {
  const announcement = message.kind === "announcement";
  return (
    <li
      data-testid="chat-message" data-kind={message.kind}
      className={`group/msg flex items-start gap-3 rounded-2xl p-3 ${announcement ? "bg-secondary-container text-on-secondary-container" : "hover:bg-surface-container-low"}`}
    >
      <AvatarCircle nickname={message.nickname} avatarUrl={message.avatarUrl} size={36} />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold text-on-surface">{message.nickname}</span>
          {message.isAdmin && <AdminBadge />}
          {announcement && <span className="inline-flex items-center gap-1 text-label-sm font-semibold uppercase tracking-wide text-secondary"><Icon name="campaign" size={16} />Thông báo</span>}
          <time dateTime={message.createdAt} className="text-label-sm text-on-surface-variant">{formatChatTime(message.createdAt)}</time>
        </p>
        <p className="mt-0.5 whitespace-pre-wrap break-words text-body-md text-on-surface">{message.body}</p>
      </div>
      {canModerate && (
        <div className="-my-1 flex shrink-0 md:opacity-0 md:transition-opacity md:focus-within:opacity-100 md:group-hover/msg:opacity-100">
          <button type="button" aria-label={`Xóa tin của ${message.nickname}`} title="Xóa tin" onClick={() => void onDelete(message.id, false)} className={iconButton}><Icon name="delete" size={18} /></button>
          {!message.isAdmin && <button type="button" aria-label={`Xóa tin và chặn ${message.nickname}`} title="Xóa tin và chặn người này" onClick={() => onRequestBlock(message)} className={iconButton}><Icon name="block" size={18} /></button>}
        </div>
      )}
    </li>
  );
}
