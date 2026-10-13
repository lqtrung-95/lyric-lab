import { dishById, DISHES } from "@/lib/games/restaurant-menu";
import { BIN, STATIONS, TABLES, WORLD_H, type Target } from "@/lib/games/restaurant-world";
import type { GameState } from "@/lib/games/restaurant-engine";

const FACES = ["🧑", "👩", "👨", "👵", "👴", "👧", "👦"];
const left = (x: number) => `${x}%`;
const top = (y: number) => `${(y / WORLD_H) * 100}%`;
const at = (x: number, y: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", left: left(x), top: top(y), transform: "translate(-50%, -50%)", ...extra });
const cq = (n: number) => `${n}cqw`;

/** Cảnh quán nhìn từ trên xuống. Mọi kích thước tính theo bề rộng khung (cqw) nên co giãn đều trên điện thoại lẫn máy tính; ô món và bàn là nút thật nên dùng được bằng bàn phím và chạm. */
export function RestaurantScene({ game, onTarget }: { game: GameState; onTarget: (t: Target) => void }) {
  function onFloor(e: React.PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("button")) return;
    const r = e.currentTarget.getBoundingClientRect();
    onTarget({ kind: "floor", x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * WORLD_H });
  }
  return (
    <div
      data-testid="scene" onPointerDown={onFloor}
      className="relative w-full select-none overflow-hidden rounded-3xl border-4 border-[#b4281f] text-[#3b2a1a]"
      style={{ containerType: "inline-size", aspectRatio: `100 / ${WORLD_H}`, background: "repeating-conic-gradient(#efe6d2 0% 25%, #e6dbc2 0% 50%) 0 0 / 6% 9.7%", touchAction: "manipulation" }}
    >
      <div aria-hidden style={{ position: "absolute", left: 0, top: 0, width: "100%", height: top(16), background: "#2f5d50", borderBottom: "0.8cqw solid #1f3f36" }} />
      {STATIONS.map((s) => {
        const d = dishById(s.dishId);
        return (
          <button key={s.dishId} type="button" onClick={() => onTarget({ kind: "station", dishId: s.dishId })} aria-label={`Lấy ${d.zh}, ${d.vi}`}
            style={{ ...at(s.x, s.y, { width: cq(10.5), height: top(13) }), borderRadius: cq(1.5), background: "#fff8e8", border: "0.4cqw solid #1f3f36" }}
            className="flex flex-col items-center justify-center leading-none active:scale-95">
            <span aria-hidden style={{ fontSize: cq(3.8) }}>{d.emoji}</span>
            <span lang="zh" style={{ fontSize: cq(2.3), fontWeight: 700 }}>{d.zh}</span>
            <span style={{ fontSize: cq(1.5), color: "#8a3b12" }}>{d.pinyin}</span>
          </button>
        );
      })}
      {TABLES.map((t) => {
        const c = game.customers.find((x) => x.table === t.index);
        return (
          <div key={t.index}>
            <button type="button" onClick={() => onTarget({ kind: "table", index: t.index })} aria-label={`Bàn ${t.index + 1}${c ? ", có khách" : ", trống"}`}
              style={{ ...at(t.x, t.y, { width: cq(15), height: cq(15), borderRadius: "50%" }), background: "#c98a4b", border: "0.6cqw solid #8a5a2b" }}
              className="flex items-center justify-center active:scale-95">
              <span aria-hidden style={{ fontSize: cq(3), fontWeight: 700, color: "#5a3a1a" }}>{t.index + 1}</span>
            </button>
            {c && (
              <>
                <span aria-hidden style={{ ...at(t.x, t.y - 11, { fontSize: cq(6.5), lineHeight: 1, pointerEvents: "none" }) }}>{FACES[c.id % FACES.length]}</span>
                <span aria-hidden style={{ ...at(t.x, t.y - 4.5, { width: cq(11), height: cq(1.4), borderRadius: cq(1), background: "#00000022", overflow: "hidden", pointerEvents: "none" }) }}>
                  <span style={{ display: "block", height: "100%", width: `${Math.max(0, c.patience) * 100}%`, background: c.patience > 0.5 ? "#3a9d5d" : c.patience > 0.25 ? "#e0a21b" : "#d63a2a" }} />
                </span>
              </>
            )}
          </div>
        );
      })}
      <button type="button" onClick={() => onTarget({ kind: "bin" })} aria-label="Thùng rác: đổ khay"
        style={{ ...at(BIN.x, BIN.y, { width: cq(8), height: cq(8) }), borderRadius: cq(1.5), background: "#dfe3e6", border: "0.4cqw solid #7b848a", fontSize: cq(4.5) }} className="flex items-center justify-center active:scale-95">
        <span aria-hidden>🗑️</span>
      </button>
      <div data-testid="player" data-x={game.player.x.toFixed(1)} data-y={game.player.y.toFixed(1)} aria-hidden style={{ ...at(game.player.x, game.player.y), pointerEvents: "none", zIndex: 5, textAlign: "center" }}>
        <div style={{ fontSize: cq(2.6), lineHeight: 1, marginBottom: cq(0.3), minHeight: cq(2.6), whiteSpace: "nowrap" }}>{game.carried.map((id) => DISHES.find((d) => d.id === id)!.emoji).join("")}</div>
        <div style={{ fontSize: cq(6.5), lineHeight: 1 }}>🧑‍🍳</div>
      </div>
    </div>
  );
}
