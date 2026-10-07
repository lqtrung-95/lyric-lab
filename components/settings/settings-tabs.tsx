"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, type KeyboardEvent, type ReactNode } from "react";

export interface SettingsTab {
  id: string;
  label: string;
  content: ReactNode;
}

/**
 * Các tab của trang Cài đặt: mỗi nhóm một tab ngắn thay vì một cột dài. Tab đang mở nằm trong `?tab=` để tải lại hay chia sẻ link vẫn giữ đúng tab.
 * Mọi bảng nội dung đều được dựng sẵn (chỉ ẩn bảng không chọn) nên các phần tự tải dữ liệu không bị mất trạng thái khi chuyển tab.
 * Bàn phím: ← → Home End chuyển tab như mẫu tab chuẩn.
 */
export function SettingsTabs({ tabs }: { tabs: SettingsTab[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const requested = params.get("tab");
  const active = tabs.find((t) => t.id === requested)?.id ?? tabs[0].id;

  function select(id: string) {
    const next = new URLSearchParams(params.toString());
    next.set("tab", id);
    router.replace(`?${next.toString()}`, { scroll: false });
  }

  function onKeyDown(e: KeyboardEvent, index: number) {
    const last = tabs.length - 1;
    const target = e.key === "ArrowRight" ? (index === last ? 0 : index + 1) : e.key === "ArrowLeft" ? (index === 0 ? last : index - 1) : e.key === "Home" ? 0 : e.key === "End" ? last : null;
    if (target === null) return;
    e.preventDefault();
    select(tabs[target].id);
    refs.current[target]?.focus();
  }

  return (
    <div className="flex flex-col gap-space-md">
      <div role="tablist" aria-label="Nhóm cài đặt" className="-mx-gutter flex gap-1 overflow-x-auto px-gutter pb-1 md:mx-0 md:px-0">
        {tabs.map((t, i) => {
          const on = t.id === active;
          return (
            <button
              key={t.id} ref={(el) => { refs.current[i] = el; }} type="button" role="tab" id={`settings-tab-${t.id}`}
              aria-selected={on} aria-controls={`settings-panel-${t.id}`} tabIndex={on ? 0 : -1}
              onClick={() => select(t.id)} onKeyDown={(e) => onKeyDown(e, i)}
              className={`min-h-11 shrink-0 rounded-full px-5 text-label-md font-semibold transition-colors ${on ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"}`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {tabs.map((t) => (
        <div key={t.id} role="tabpanel" id={`settings-panel-${t.id}`} aria-labelledby={`settings-tab-${t.id}`} hidden={t.id !== active} className="flex flex-col gap-space-md">
          {t.content}
        </div>
      ))}
    </div>
  );
}
