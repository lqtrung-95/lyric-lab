import { PronounceButton } from "@/components/ui/pronounce-button";
import type { Order } from "@/lib/games/restaurant-order";

const FACES = ["🧑", "👩", "👨", "👵", "👴", "👧", "👦"];

/** Khách và lời gọi món (bong bóng thoại). `listenOnly` ẩn chữ và pinyin tới khi `reveal`; nghĩa tiếng Việt chỉ hiện sau khi phục vụ xong. */
export function RestaurantCustomer({ order, index, listenOnly, reveal, showMeaning }: { order: Order; index: number; listenOnly: boolean; reveal: boolean; showMeaning: boolean }) {
  const hidden = listenOnly && !reveal;
  return (
    <div className="flex items-start gap-3">
      <span aria-hidden className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-secondary-container text-4xl">{FACES[index % FACES.length]}</span>
      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm bg-surface-container-lowest p-3 shadow-[0_1px_10px_rgba(30,26,22,0.08)]">
        <div className="flex items-start justify-between gap-2">
          {hidden ? (
            <p className="py-2 text-body-md text-on-surface-variant">Bấm nút loa để nghe khách gọi món.</p>
          ) : (
            <div lang="zh">
              <p className="font-serif text-headline-md leading-snug text-on-surface">{order.zh}</p>
              <p lang="vi" className="mt-0.5 text-label-md text-primary">{order.pinyin}</p>
            </div>
          )}
          <PronounceButton text={order.zh} />
        </div>
        {showMeaning && <p className="mt-2 border-t border-outline-variant/50 pt-2 text-label-md text-on-surface-variant">{order.vi}</p>}
      </div>
    </div>
  );
}
