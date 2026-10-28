"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { MODE_LABELS } from "./review-modes";

/** Thanh đầu mỗi chế độ luyện: quay về trang chủ Ôn & Nói (nơi chọn chế độ, gom theo mục đích) và cho biết đang ở chế độ nào. */
export function ModeTabs() {
  const pathname = usePathname();
  const label = MODE_LABELS[pathname] ?? null;
  return (
    <nav aria-label="Ôn và nói" className="mx-auto mb-space-md flex max-w-3xl items-center gap-2">
      <Link href="/review" className="flex min-h-11 items-center gap-1 rounded-full bg-surface-container-low px-4 text-label-md font-semibold text-on-surface hover:bg-surface-container-high">
        <Icon name="arrow_back" size={18} />Ôn &amp; Nói
      </Link>
      {label && <span aria-current="page" className="text-label-md text-on-surface-variant">/ {label}</span>}
    </nav>
  );
}
