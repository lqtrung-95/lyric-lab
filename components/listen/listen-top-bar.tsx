"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { ViewToggles } from "./view-toggles";

interface ListenTopBarProps {
  title: string;
  artist: string;
  backHref: string;
  showPinyin: boolean;
  showTranslation: boolean;
  onTogglePinyin: () => void;
  onToggleTranslation: () => void;
}

/** Thanh phụ màn Nghe: quay lại xem trước, tên bài; trên desktop có cả nút bật/tắt pinyin và bản dịch. */
export function ListenTopBar({ title, artist, backHref, showPinyin, showTranslation, onTogglePinyin, onToggleTranslation }: ListenTopBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-low px-gutter py-2 md:px-6 lg:px-12">
      <div className="flex min-w-0 items-center gap-3">
        <Link href={backHref} aria-label="Quay lại xem trước" className="hidden h-11 w-11 items-center justify-center rounded-full hover:bg-surface-container-high md:flex">
          <Icon name="arrow_back" size={22} />
        </Link>
        <div className="min-w-0">
          <p lang="zh" className="truncate font-serif text-headline-md text-primary">{title}</p>
          <p className="truncate text-label-sm text-on-surface-variant">{artist}</p>
        </div>
      </div>
      <ViewToggles
        className="hidden md:flex"
        showPinyin={showPinyin} showTranslation={showTranslation}
        onTogglePinyin={onTogglePinyin} onToggleTranslation={onToggleTranslation}
      />
    </div>
  );
}
