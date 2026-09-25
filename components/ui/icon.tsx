import type { IconName } from "./icon-names";

interface IconProps {
  name: IconName;
  /** Kích thước px (mặc định 24). */
  size?: number;
  /** Icon đặc (FILL=1) thay vì viền. */
  filled?: boolean;
  className?: string;
}

/** Icon trang trí (aria-hidden). Nút chứa icon phải có `aria-label` hoặc chữ đi kèm. */
export function Icon({ name, size = 24, filled = false, className = "" }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined ${filled ? "filled" : ""} ${className}`}
      style={{ fontSize: size }}
    >
      {name}
    </span>
  );
}
