"use client";

import { useId } from "react";
import { NICKNAME_MAX } from "@/lib/leaderboard/nickname";
import { useDisplayName } from "./use-display-name";

/** Ô nhập tên hiển thị trong phòng (3–20 ký tự), dùng chung cho tạo phòng và vào phòng. */
export function DisplayNameField({ name, setName, valid, showError }: ReturnType<typeof useDisplayName> & { showError: boolean }) {
  const id = useId();
  const invalid = showError && valid === null;
  return (
    <div>
      <label htmlFor={id} className="text-label-md font-medium text-on-surface">Tên hiển thị trong phòng</label>
      <input
        id={id} value={name} onChange={(e) => setName(e.target.value)} maxLength={NICKNAME_MAX + 5} autoComplete="nickname"
        aria-invalid={invalid} aria-describedby={invalid ? `${id}-error` : undefined} placeholder="Ví dụ: Linh"
        className="mt-1 min-h-11 w-full rounded-xl bg-surface-container-high px-4 text-body-md text-on-surface placeholder:text-on-surface-variant/70"
      />
      {invalid && <p id={`${id}-error`} role="alert" className="mt-1 text-label-md text-error">Tên cần 3–20 ký tự (chữ, số, dấu cách, chấm, gạch).</p>}
    </div>
  );
}
