import Link from "next/link";
import type { RadicalEntry } from "@/lib/radicals/radicals";

/** Ô một bộ thủ ở lưới: chữ lớn, tên Hán Việt, nghĩa; dấu ✓ khi đã biết. */
export function RadicalTile({ e, known }: { e: RadicalEntry; known: boolean }) {
  return (
    <Link href={`/radicals/${e.num}`} aria-label={`Bộ ${e.name}, ${e.meaning}${known ? ", đã biết" : ""}`} className={`card-ink relative flex h-full min-h-11 flex-col items-center gap-1 p-space-sm text-center hover:brightness-105 ${known ? "!bg-secondary-container" : ""}`}>
      <span className="absolute left-2 top-1 text-label-sm text-on-surface-variant">#{e.num}</span>
      {known && <span aria-hidden="true" className="absolute right-2 top-1 text-label-md font-extrabold text-secondary">✓</span>}
      <span lang="zh-Hans" className="font-serif text-[40px] leading-tight">{e.char}</span>
      {/* Luôn chừa chỗ dòng biến thể và hai dòng nghĩa để mọi ô trong lưới cao bằng nhau. */}
      <span lang="zh-Hans" aria-hidden={e.variants.length === 0} className="-mt-1 min-h-6 font-serif text-label-md text-on-surface-variant">{e.variants.join(" ")}</span>
      <span className="text-label-lg font-extrabold">Bộ {e.name}</span>
      <span className="line-clamp-2 min-h-8 text-label-sm text-on-surface-variant">{e.meaning}</span>
    </Link>
  );
}
