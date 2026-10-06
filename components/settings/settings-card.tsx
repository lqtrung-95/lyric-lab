import type { ReactNode } from "react";

/** Thẻ cài đặt có tiêu đề; các hàng bên trong (SettingRow) ngăn nhau bằng đường kẻ mảnh. */
export function SettingsCard({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm">
      <h2 id={id} className="font-serif text-headline-md text-on-surface">{title}</h2>
      <div className="mt-1 divide-y divide-outline-variant">{children}</div>
    </section>
  );
}

/**
 * Một dòng cài đặt: nhãn và gợi ý bên trái, ô chọn bên phải (điện thoại thì ô chọn xuống dưới nhãn).
 * Gốc là <div> (không phải <label>) vì ô chọn bên trong có thể tự mang <label> (LevelSelect); mỗi ô chọn tự đặt tên truy cập.
 */
export function SettingRow({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 py-space-sm sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <span className="min-w-0">
        <span className="block text-body-md font-medium text-on-surface">{label}</span>
        {hint && <span className="block text-label-md text-on-surface-variant">{hint}</span>}
      </span>
      <span className="shrink-0">{children}</span>
    </div>
  );
}
