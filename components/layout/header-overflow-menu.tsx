"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { SECONDARY_LINKS } from "./nav-links";
import { toggleTheme, useIsDark } from "./theme-toggle";

const ITEMS = SECONDARY_LINKS;
const ROW = "flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-body-md text-on-surface hover:bg-surface-container-high";

/**
 * Nút "Menu" (⋯) ở thanh trên của điện thoại và máy tính bảng (dưới 1280px, kể cả iPad Pro 13 dọc rộng 1032px): gom các lối vào phụ (Công cụ, Xếp hạng, Góp ý, Cài đặt, đổi giao diện) thành một bảng có chữ,
 * thay cho một hàng icon trần khó đoán và tràn màn hình hẹp. Dùng <dialog> gốc: có sẵn khóa focus, đóng bằng Esc và trình đọc màn hình hiểu đây là hộp thoại.
 * Chỉ hiện dưới xl; từ xl (1280px) trở lên thanh trên có đủ chỗ cho từng icon.
 */
export function HeaderOverflowMenu({ hideFrom = "xl" }: { hideFrom?: "lg" | "xl" } = {}) {
  // Lớp phải viết nguyên chuỗi để Tailwind quét được.
  const hide = hideFrom === "lg" ? "lg:hidden" : "xl:hidden";
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const dark = useIsDark();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <button type="button" aria-label="Menu" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}
        className={`flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface ${hide}`}>
        <Icon name="more_horiz" size={24} />
      </button>
      <dialog ref={ref} aria-label="Menu" onClose={() => setOpen(false)} onClick={(e) => { if (e.target === ref.current) setOpen(false); }}
        className={`m-0 mt-auto w-full max-w-none rounded-t-3xl bg-surface p-space-sm pb-safe text-on-surface backdrop:bg-black/40 md:mx-auto md:mb-4 md:max-w-md md:rounded-3xl ${hide}`}>
        <div className="flex items-center justify-between px-3 pb-1 pt-2">
          <p className="text-label-md font-semibold text-on-surface-variant">Menu</p>
          <button type="button" aria-label="Đóng menu" onClick={() => setOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high">
            <Icon name="close" size={22} />
          </button>
        </div>
        <ul>
          {ITEMS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} onClick={() => setOpen(false)} className={ROW}>
                <Icon name={item.icon} size={22} className="text-on-surface-variant" />
                <span className="flex-1">{item.label}</span>
                <Icon name="chevron_right" size={20} className="text-on-surface-variant" />
              </Link>
            </li>
          ))}
          <li>
            <button type="button" onClick={toggleTheme} className={ROW}>
              <Icon name={dark ? "light_mode" : "dark_mode"} size={22} className="text-on-surface-variant" />
              <span className="flex-1 text-left">{dark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}</span>
            </button>
          </li>
        </ul>
      </dialog>
    </>
  );
}
