/** Thanh tiến độ kiểu game: rãnh có viền mềm, phần đã đạt màu cam (xanh rêu khi `tone="success"`, nâu mực khi `tone="ink"` để thấy rõ trên nền cam). Có role progressbar để trình đọc màn hình đọc được giá trị. */
export function ProgressBar({ value, max = 100, label, tone = "primary", className = "" }: { value: number; max?: number; label: string; tone?: "primary" | "success" | "ink"; className?: string }) {
  const percent = max > 0 ? Math.max(0, Math.min(100, Math.round((100 * value) / max))) : 0;
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.min(value, max)} className={`h-3 overflow-hidden rounded-full border-2 border-[var(--ink-soft)] ${tone === "ink" ? "bg-surface-container-lowest" : "bg-surface-container-high"} ${className}`}>
      <div className={`h-full rounded-full ${tone === "success" ? "bg-secondary" : tone === "ink" ? "bg-[var(--ink)]" : "bg-primary-container"}`} style={{ width: `${percent}%` }} />
    </div>
  );
}
