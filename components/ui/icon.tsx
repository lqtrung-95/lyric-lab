import type { IconName } from "./icon-names";

interface IconProps {
  name: IconName;
  /** Kích thước px (mặc định 24). Truyền `null` để bỏ style cỡ chữ cố định, tự cỡ theo class responsive truyền vào `className` (vd. `text-[20px] lg:text-[26px]`). */
  size?: number | null;
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
      style={size == null ? undefined : { fontSize: size }}
    >
      {name}
    </span>
  );
}
