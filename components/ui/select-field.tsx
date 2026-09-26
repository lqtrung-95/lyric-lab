import type { SelectHTMLAttributes } from "react";
import { Icon } from "@/components/ui/icon";

/**
 * Ô chọn dạng viên thuốc với mũi tên tự vẽ (bỏ mũi tên gốc của trình duyệt vì mỗi trình duyệt đặt một kiểu, hay dính sát mép).
 * Vẫn là <select> thật nên dùng được bằng bàn phím và trình đọc màn hình.
 */
export function SelectField({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="relative inline-flex items-center">
      <select
        {...props}
        className={`min-h-11 cursor-pointer appearance-none rounded-full bg-surface-container-high py-0 pl-4 pr-10 text-label-md font-semibold text-secondary ${className}`}
      >
        {children}
      </select>
      <Icon name="expand_more" size={20} className="pointer-events-none absolute right-3 text-secondary" />
    </span>
  );
}
