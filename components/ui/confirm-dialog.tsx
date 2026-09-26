"use client";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Hộp thoại xác nhận dùng phần tử <dialog> gốc của trình duyệt: có sẵn khóa focus, đóng bằng Esc, nền mờ phía sau và
 * trình đọc màn hình hiểu đây là hộp thoại. Focus ban đầu ở nút "Hủy" (thao tác an toàn), nút xác nhận là hành động nguy hiểm.
 */
export function ConfirmDialog({ open, title, body, confirmLabel, cancelLabel = "Giữ lại", onConfirm, onCancel }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      aria-describedby="confirm-body"
      onCancel={(e) => { e.preventDefault(); onCancel(); }} // Esc: đi qua onCancel để trạng thái của cha luôn khớp
      onClick={(e) => { if (e.target === ref.current) onCancel(); }} // bấm ra vùng nền mờ
      className="m-auto w-[min(92vw,26rem)] rounded-3xl bg-surface-container-lowest p-0 text-on-surface shadow-[0_24px_60px_-20px_rgba(20,10,5,0.5)] backdrop:bg-black/50 backdrop:backdrop-blur-[2px]"
    >
      <div className="p-space-lg">
        <h2 id="confirm-title" className="font-serif text-headline-md">{title}</h2>
        <p id="confirm-body" className="mt-space-sm text-body-md text-on-surface-variant">{body}</p>
        <div className="mt-space-lg flex flex-col-reverse gap-space-sm sm:flex-row sm:justify-end">
          <button type="button" autoFocus onClick={onCancel}
            className="min-h-11 rounded-full px-5 text-label-md font-medium text-on-surface hover:bg-surface-container-high">{cancelLabel}</button>
          <button type="button" onClick={onConfirm}
            className="min-h-11 rounded-full bg-error px-5 text-label-md font-semibold text-on-error hover:opacity-90">{confirmLabel}</button>
        </div>
      </div>
    </dialog>
  );
}
