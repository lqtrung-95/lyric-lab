import { DISHES, dishById, type DishId } from "@/lib/games/restaurant-menu";

export const MAX_PER_DISH = 3;
export type Tray = Partial<Record<DishId, number>>;

const tile = "relative flex min-h-24 flex-col items-center justify-center gap-0.5 rounded-2xl border-2 bg-surface-container-lowest p-2 text-center transition-colors disabled:opacity-60";

/** Quầy món (bấm để thêm một phần vào khay) và khay hiện tại (bấm một món trong khay để bớt một phần). */
export function RestaurantMenu({ tray, disabled, onAdd, onRemove, onClear }: {
  tray: Tray; disabled: boolean; onAdd: (id: DishId) => void; onRemove: (id: DishId) => void; onClear: () => void;
}) {
  const inTray = DISHES.filter((d) => (tray[d.id] ?? 0) > 0);
  return (
    <div className="space-y-space-sm">
      <ul aria-label="Thực đơn" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {DISHES.map((d) => {
          const n = tray[d.id] ?? 0;
          return (
            <li key={d.id}>
              <button
                type="button" disabled={disabled || n >= MAX_PER_DISH} onClick={() => onAdd(d.id)} aria-label={`Thêm ${d.zh}, ${d.vi}`}
                className={`${tile} w-full ${n > 0 ? "border-primary" : "border-outline-variant hover:border-primary"}`}
              >
                <span aria-hidden className="text-3xl">{d.emoji}</span>
                <span lang="zh" className="font-serif text-body-lg font-semibold text-on-surface">{d.zh}</span>
                <span className="text-label-sm text-primary">{d.pinyin}</span>
                {n > 0 && <span aria-hidden className="absolute right-1.5 top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1 text-label-sm font-semibold text-on-primary">{n}</span>}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex min-h-14 flex-wrap items-center gap-2 rounded-2xl bg-surface-container-low p-2" aria-label="Khay của bạn" role="group">
        {inTray.length === 0 && <span className="px-2 text-label-md text-on-surface-variant">Khay trống: bấm món khách gọi ở trên.</span>}
        {inTray.map((d) => (
          <button key={d.id} type="button" disabled={disabled} onClick={() => onRemove(d.id)} aria-label={`Bớt một ${d.zh} khỏi khay, đang có ${tray[d.id]}`}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-primary-container px-4 text-label-md font-medium text-on-primary-container">
            <span aria-hidden>{d.emoji}</span><span lang="zh">{d.zh}</span><span>×{tray[d.id]}</span>
          </button>
        ))}
        {inTray.length > 0 && !disabled && <button type="button" onClick={onClear} className="ml-auto inline-flex min-h-11 items-center rounded-full px-3 text-label-md text-on-surface-variant hover:bg-surface-container-high">Dọn khay</button>}
      </div>
    </div>
  );
}

export const trayLabel = (tray: Tray) => DISHES.filter((d) => (tray[d.id] ?? 0) > 0).map((d) => `${tray[d.id]} ${dishById(d.id).vi}`).join(", ");
