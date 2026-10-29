"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Hộp thoại tổng kết cuối buổi trò chuyện: dùng phần tử <dialog> gốc (khóa focus, Esc, nền mờ). Mở ngay khi hiện ra;
 * đóng bằng Esc hoặc bấm nền thì gọi `onClose` (cùng việc với nút "Xong" bên trong). Nội dung dài thì cuộn trong hộp.
 */
export function RoleplaySummaryModal({ label, onClose, children }: { label: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={label}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className="m-auto max-h-[90vh] w-[min(94vw,48rem)] overflow-y-auto rounded-3xl bg-surface-container-lowest p-0 text-on-surface shadow-[0_24px_60px_-20px_rgba(20,10,5,0.5)] backdrop:bg-black/50 backdrop:backdrop-blur-[2px]"
    >
      {children}
    </dialog>
  );
}
