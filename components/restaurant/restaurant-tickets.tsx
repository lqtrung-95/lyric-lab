import { PronounceButton } from "@/components/ui/pronounce-button";
import type { Customer } from "@/lib/games/restaurant-engine";

/** Bảng order phía trên cảnh: mỗi khách đang chờ một phiếu (số bàn, lời gọi món, thanh kiên nhẫn). `listenOnly` ẩn chữ để chỉ luyện nghe. */
export function RestaurantTickets({ customers, listenOnly }: { customers: Customer[]; listenOnly: boolean }) {
  if (customers.length === 0) return <p className="min-h-16 rounded-2xl bg-surface-container-low p-3 text-label-md text-on-surface-variant">Đang chờ khách mới…</p>;
  return (
    <ul aria-label="Order của khách" className="grid gap-2 sm:grid-cols-3">
      {[...customers].sort((a, b) => a.table - b.table).map((c) => (
        <li key={c.id} data-testid="ticket" className="flex items-start gap-2 rounded-2xl bg-surface-container-lowest p-2 shadow-[0_1px_8px_rgba(30,26,22,0.08)]">
          <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-label-md font-bold text-on-primary" aria-label={`Bàn ${c.table + 1}`}>{c.table + 1}</span>
          <div className="min-w-0 flex-1">
            {listenOnly ? <p className="py-1 text-label-md text-on-surface-variant">Bấm loa để nghe.</p> : (
              <div lang="zh"><p className="font-serif text-body-lg leading-snug text-on-surface">{c.order.zh}</p><p lang="vi" className="text-label-sm text-primary">{c.order.pinyin}</p></div>
            )}
            <div aria-hidden className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-container-high"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, c.patience) * 100}%` }} /></div>
          </div>
          <PronounceButton text={c.order.zh} />
        </li>
      ))}
    </ul>
  );
}
