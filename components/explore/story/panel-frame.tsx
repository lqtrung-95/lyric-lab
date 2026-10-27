"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";

/**
 * Khung chung của các bảng trong hộp thoại vụ án (sổ vụ án, buộc tội, bản đồ, thẻ manh mối): tiêu đề và nút đóng "×" ở góc trên phải luôn hiện (không cuộn),
 * chỉ phần nội dung bên dưới cuộn khi dài. Nhờ vậy trên điện thoại bảng dài vẫn đóng được ngay lúc nào cũng được.
 */
export function PanelFrame({ label, title, extra, onClose, children }: { label: string; title: string; extra?: ReactNode; onClose: () => void; children: ReactNode }) {
  return (
    <section aria-label={label} className="card-ink flex max-h-[88vh] flex-col overflow-hidden">
      <header className="flex shrink-0 items-center gap-2 border-b-2 border-outline-variant bg-surface-container-lowest px-space-md py-2">
        <h2 className="min-w-0 flex-1 truncate text-headline-md">{title}</h2>
        {extra}
        <button type="button" onClick={onClose} aria-label="Đóng" className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-surface-container-lowest hover:bg-surface-container">
          <Icon name="close" size={22} />
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-space-md">{children}</div>
    </section>
  );
}
