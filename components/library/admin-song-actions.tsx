"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

interface AdminSongActionsProps {
  videoId: string;
  /** Gọi sau khi ẩn/xóa thành công, để trang tự bỏ bài khỏi danh sách đang xem. */
  onDone: () => void;
}

const btn = "flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm hover:bg-black/75";

/**
 * Nút quản trị trên thẻ bài hát ở Khám phá: ẩn ngay khỏi Khám phá, hoặc xóa hẳn (có xác nhận; tự chuyển thành ẩn
 * nếu còn người dùng lưu thẻ/tiến độ từ bài đó, để không mất dữ liệu học của họ).
 */
export function AdminSongActions({ videoId, onDone }: AdminSongActionsProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  async function call(action: "hide" | "delete") {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/songs/${videoId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      const body = (await res.json().catch(() => ({}))) as { done?: string };
      if (!res.ok) { setNote("Chưa thực hiện được."); setBusy(false); return; }
      if (body.done === "hidden_instead") { onDone(); return; } // còn người dùng lưu thẻ: đã tự ẩn thay vì xóa
      onDone();
    } catch {
      setNote("Chưa thực hiện được.");
      setBusy(false);
    }
  }

  if (confirmDelete) {
    return (
      <div onClick={(e) => e.preventDefault()} className="flex flex-col gap-1 rounded-xl bg-inverse-surface p-2 text-inverse-on-surface shadow-lg">
        <p className="max-w-40 text-label-sm">Xóa hẳn bài này? Không hoàn tác được.</p>
        <div className="flex gap-1">
          <button type="button" disabled={busy} onClick={() => void call("delete")} className="min-h-9 flex-1 rounded-full bg-error px-2 text-label-sm font-medium text-on-error disabled:opacity-60">Xóa</button>
          <button type="button" disabled={busy} onClick={() => setConfirmDelete(false)} className="min-h-9 flex-1 rounded-full bg-inverse-on-surface/15 px-2 text-label-sm">Hủy</button>
        </div>
        {note && <p className="max-w-40 text-label-sm text-error">{note}</p>}
      </div>
    );
  }

  return (
    <div onClick={(e) => e.preventDefault()} className="relative flex items-center gap-1">
      <button type="button" disabled={busy} onClick={() => void call("hide")} aria-label="Ẩn bài này khỏi Khám phá" title="Ẩn khỏi Khám phá" className={btn}>
        <Icon name="visibility_off" size={18} />
      </button>
      <button type="button" disabled={busy} onClick={() => setConfirmDelete(true)} aria-label="Xóa hẳn bài này" title="Xóa hẳn" className={btn}>
        <Icon name="close" size={18} />
      </button>
      {note && <p role="alert" className="absolute left-0 top-full mt-1 w-40 rounded-lg bg-inverse-surface p-1.5 text-label-sm text-inverse-on-surface shadow-lg">{note}</p>}
    </div>
  );
}
