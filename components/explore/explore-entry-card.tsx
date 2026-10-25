import Link from "next/link";
import { Icon } from "@/components/ui/icon";

/** Lối vào Khám phá ở mục Chơi: đi quanh các cảnh để học từ theo ngữ cảnh, và vụ án có cốt truyện. */
export function ExploreEntryCard() {
  return (
    <Link href="/explore" className="flex flex-wrap items-center gap-3 rounded-2xl bg-primary-container p-space-md text-on-primary-container shadow-sm transition hover:brightness-105">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-lowest text-primary"><Icon name="search" size={26} /></span>
      <span className="min-w-0 flex-1">
        <span className="block font-serif text-headline-md">Khám phá và phá án</span>
        <span className="block text-body-md">Điều khiển Gấu Trúc đi quanh 10 cảnh, chạm đồ vật để học từ, rồi phá vụ án bằng tiếng Trung.</span>
      </span>
      <span className="inline-flex min-h-11 items-center gap-1 rounded-full bg-surface-container-lowest px-5 text-label-md font-semibold text-primary">Chơi ngay <Icon name="arrow_forward" size={18} /></span>
    </Link>
  );
}
