"use client";

interface ToggleSwitchProps {
  on: boolean;
  onChange: (next: boolean) => void;
  /** Tên đọc cho trình đọc màn hình (nhãn của dòng cài đặt). */
  label: string;
  disabled?: boolean;
}

/**
 * Công tắc bật/tắt: nút gạt trượt sang phải khi bật, kèm chữ "Đang bật"/"Đang tắt" nên không chỉ dựa vào màu. Là <button role="switch"> thật;
 * vùng bấm cao 44 px. Dùng cho các cài đặt có hai trạng thái (nhắc học, email).
 */
export function ToggleSwitch({ on, onChange, label, disabled = false }: ToggleSwitchProps) {
  return (
    <button
      type="button" role="switch" aria-checked={on} aria-label={label} disabled={disabled} onClick={() => onChange(!on)}
      className="inline-flex min-h-11 items-center gap-3 rounded-full px-1 text-label-md font-semibold text-on-surface disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="w-16 text-right">{on ? "Đang bật" : "Đang tắt"}</span>
      <span aria-hidden="true" className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${on ? "bg-primary" : "bg-surface-container-highest ring-1 ring-inset ring-outline-variant"}`}>
        <span className={`absolute left-0.5 h-6 w-6 rounded-full shadow transition-transform motion-reduce:transition-none ${on ? "translate-x-5 bg-on-primary" : "translate-x-0 bg-on-surface-variant"}`} />
      </span>
    </button>
  );
}
