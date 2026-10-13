import Link from "next/link";
import { Icon } from "@/components/ui/icon";

/** Lối vào công cụ công khai chuyển chữ Hán sang pinyin và âm Hán Việt (trang `/chu-han-sang-pinyin`), để người đang dùng app cũng biết có công cụ này. */
export function PinyinToolLink() {
  return (
    <Link href="/chu-han-sang-pinyin" className="mt-space-md flex min-h-14 items-center gap-3 rounded-2xl bg-surface-container-low p-space-md transition-colors hover:bg-surface-container-high">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-primary"><Icon name="dictionary" size={22} /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-body-lg font-medium text-on-surface">Tra pinyin và âm Hán Việt</span>
        <span className="block text-label-md text-on-surface-variant">Dán đoạn chữ Hán bất kỳ, nhận pinyin và âm Hán Việt từng từ.</span>
      </span>
      <Icon name="chevron_right" size={22} className="shrink-0 text-on-surface-variant" />
    </Link>
  );
}
