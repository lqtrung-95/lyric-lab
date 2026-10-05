"use client";

import { useId, useState } from "react";
import { NICKNAME_MAX, NICKNAME_MESSAGES, validateNickname } from "@/lib/leaderboard/nickname";

/**
 * Form đặt/đổi biệt danh để tham gia bảng xếp hạng. Kiểm tra định dạng ngay ở client; tên trùng do server báo (409).
 * `onSubmit` trả mã lỗi (chuỗi) hoặc null nếu thành công.
 */
export function NicknameForm({ initial = "", submitLabel, onSubmit, onCancel }: {
  initial?: string;
  submitLabel: string;
  onSubmit: (nickname: string) => Promise<string | null>;
  onCancel?: () => void;
}) {
  const id = useId();
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const invalid = validateNickname(value);
    if (invalid) return setError(NICKNAME_MESSAGES[invalid]);
    setBusy(true);
    const code = await onSubmit(value);
    setBusy(false);
    setError(code ? (NICKNAME_MESSAGES as Record<string, string>)[code] ?? "Chưa lưu được. Thử lại sau nhé." : null);
  }

  return (
    <form onSubmit={submit} noValidate className="mt-space-sm">
      <label htmlFor={id} className="text-label-md font-medium text-on-surface">Biệt danh hiển thị (không dùng email hay tên Google)</label>
      <div className="mt-1 flex flex-wrap gap-2">
        <input id={id} value={value} onChange={(e) => { setValue(e.target.value); setError(null); }} maxLength={NICKNAME_MAX + 5} autoComplete="off"
          aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined}
          className="min-h-12 min-w-0 flex-1 rounded-2xl bg-surface-container px-4 text-body-lg text-on-surface outline-none ring-2 ring-transparent focus:ring-secondary aria-[invalid=true]:ring-error" />
        <button type="submit" disabled={busy} className="min-h-12 rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:bg-primary-container disabled:opacity-60">{busy ? "Đang lưu…" : submitLabel}</button>
        {onCancel && <button type="button" onClick={onCancel} className="min-h-12 rounded-full px-4 text-label-md font-medium text-on-surface-variant hover:bg-surface-container-high">Hủy</button>}
      </div>
      {error && <p id={`${id}-error`} role="alert" className="mt-1 text-label-md text-error">{error}</p>}
    </form>
  );
}
