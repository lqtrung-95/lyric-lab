"use client";

import type { ReactNode } from "react";
import { ArtSprite } from "./art/art-sprite";
import { FLAT_SPRITES } from "./art/flat/flat-sprites";
import { SceneBackdrop } from "./art/scene-backdrop";
import type { SceneDecor, SceneExit, SceneNpc, SceneTheme, SceneWord } from "@/lib/explore/explore-types";
import type { Vec } from "@/lib/explore/player-movement";

export type ObjectMark = "new" | "learned" | "faded";

/** Thứ vẽ thêm trong cảnh ngoài vật từ vựng: NPC hoặc vật chứng của cốt truyện (bấm/chạm hay đứng gần nhấn E để tương tác). */
export interface CanvasExtra {
  id: string;
  kind: "npc" | "spot";
  sprite: string;
  label: string;
  x: number;
  y: number;
  w: number;
}

interface Props {
  theme: SceneTheme;
  objects: SceneWord[];
  npc: SceneNpc;
  decor: SceneDecor[];
  exits: SceneExit[];
  extras?: CanvasExtra[];
  marks: Record<string, ObjectMark>;
  /** Đang làm nhiệm vụ: ẩn nhãn chữ Hán và tên đọc cho trình đọc màn hình (không lộ đáp án). */
  hideLabels: boolean;
  /** Vật được tô sáng vì vừa trả lời (đúng hoặc chỉ đáp án). */
  highlightId: string | null;
  shakeId: string | null;
  /** Vật (hoặc NPC) đang ở gần nhân vật: nhấn E để tương tác. */
  nearId: string | null;
  /** Bấm/chạm vào một vật hoặc NPC: nhân vật tự đi tới rồi tương tác. */
  onActivate: (id: string) => void;
  /** Bấm/chạm vào sàn: nhân vật tự đi tới đó. */
  onFloorPoint: (p: Vec) => void;
  /** Nhân vật người chơi (vẽ trên cùng nhưng xếp lớp theo vị trí). */
  children: ReactNode;
}

/** Mã tương tác của một lối đi (dùng chung với bộ điều khiển). */
export const exitId = (e: SceneExit): string => `exit:${e.to}`;
const zOf = (y: number, above?: boolean) => 10 + Math.round(y * 10) + (above ? 500 : 0);
// Độ to nhỏ riêng của từng sprite (nhân với `w` của vật trong cảnh); mặc định 1.
const SCALES: Record<string, number> = {};

function KeyChip() {
  return <span aria-hidden="true" className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-md border-2 border-ink bg-[#4a2e1b] px-1.5 text-label-md font-extrabold leading-5 text-white">E</span>;
}

/**
 * Khung cảnh 4:3: nền + các vật đặt theo % (giữa-đáy) + NPC + nhân vật người chơi, xếp lớp theo y (vật gần người xem vẽ sau). Mỗi vật là một nút thật
 * (bàn phím và trình đọc màn hình dùng được); vùng bấm = kích thước vật nới 6 px mỗi cạnh (trên điện thoại vài vật nhỏ vẫn nhỏ hơn 44 px, đã ghi trong tài liệu bàn giao).
 */
export function SceneCanvas({ theme, objects, npc, decor, exits, extras = [], marks, hideLabels, highlightId, shakeId, nearId, onActivate, onFloorPoint, children }: Props) {
  const ordered = [...objects].sort((a, b) => Number(!!a.above) - Number(!!b.above) || a.y - b.y);
  const npcSprite = FLAT_SPRITES[npc.id];
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border-2 border-ink shadow-[0_4px_0_var(--shadow-ink)]" style={{ aspectRatio: "4 / 3" }}>
      <SceneBackdrop theme={theme} />
      <div
        className="absolute inset-0 cursor-pointer"
        style={{ zIndex: 1 }}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          onFloorPoint({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
      />
      {decor.map((d, i) => FLAT_SPRITES[d.sprite] && (
        <div key={`${d.sprite}-${i}`} aria-hidden="true" className="pointer-events-none absolute" style={{ left: `${d.x}%`, top: `${d.y}%`, width: `${d.w}%`, transform: "translate(-50%, -100%)", zIndex: zOf(d.y) }}>
          <ArtSprite sprite={FLAT_SPRITES[d.sprite]} />
        </div>
      ))}
      {ordered.map((o) => {
        const sprite = FLAT_SPRITES[o.id];
        if (!sprite) return null;
        const mark = marks[o.id] ?? "new";
        const near = nearId === o.id;
        const hit = highlightId === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onActivate(o.id)}
            aria-label={hideLabels ? "Vật trong phòng" : `${o.term}, ${o.gloss}`}
            className={`group absolute cursor-pointer rounded-lg outline-offset-2 transition-transform after:absolute after:-inset-1.5 after:content-[''] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-primary ${shakeId === o.id ? "anim-note-shake" : ""} ${hit ? "anim-note-pop" : ""}`}
            style={{ left: `${o.x}%`, top: `${o.y}%`, width: `${o.w * (SCALES[o.id] ?? 1)}%`, transform: "translate(-50%, -100%)", zIndex: zOf(o.y, o.above) }}
          >
            {!o.wall && <span aria-hidden="true" className="pointer-events-none absolute -bottom-[5%] left-[4%] right-[4%] h-[14%] rounded-[50%] bg-[rgba(74,46,27,0.22)]" style={{ zIndex: -1 }} />}
            <span className={`block transition-all ${mark === "faded" ? "opacity-60 saturate-50" : ""} ${near ? "drop-shadow-[0_0_8px_rgba(230,126,34,1)]" : mark === "new" && !hideLabels ? "drop-shadow-[0_0_6px_rgba(255,200,60,0.95)]" : ""} ${hit ? "drop-shadow-[0_0_10px_rgba(60,200,90,1)]" : ""}`}>
              <ArtSprite sprite={sprite} />
            </span>
            {near && <KeyChip />}
            {!hideLabels && mark !== "new" && (
              <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-ink bg-surface-container-lowest px-2 text-label-md font-extrabold leading-5 text-on-surface">
                {o.term}{mark === "faded" && <span className="ml-1 text-primary">↻</span>}
              </span>
            )}
            {!hideLabels && mark === "new" && !near && <span aria-hidden="true" className="pointer-events-none absolute -right-1 -top-2 animate-pulse text-base">✨</span>}
          </button>
        );
      })}
      {npcSprite && (
        <button
          type="button"
          onClick={() => onActivate(npc.id)}
          aria-label={`Nói chuyện với ${npc.name}`}
          className="group absolute cursor-pointer rounded-lg outline-offset-2 transition-transform after:absolute after:-inset-1.5 after:content-[''] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-primary"
          style={{ left: `${npc.x}%`, top: `${npc.y}%`, width: `${npc.w}%`, transform: "translate(-50%, -100%)", zIndex: zOf(npc.y) }}
        >
          <span aria-hidden="true" className="pointer-events-none absolute -bottom-[5%] left-[4%] right-[4%] h-[12%] rounded-[50%] bg-[rgba(74,46,27,0.22)]" style={{ zIndex: -1 }} />
          <span className={`block ${nearId === npc.id ? "drop-shadow-[0_0_8px_rgba(230,126,34,1)]" : ""}`}><ArtSprite sprite={npcSprite} /></span>
          {nearId === npc.id && <KeyChip />}
          <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-ink bg-primary-container px-2 text-label-md font-extrabold leading-5 text-on-primary-container">{npc.name}</span>
        </button>
      )}
      {exits.map((e) => FLAT_SPRITES[e.sprite] && (
        <button
          key={e.to}
          type="button"
          onClick={() => onActivate(exitId(e))}
          aria-label={e.label}
          className="group absolute cursor-pointer rounded-lg outline-offset-2 transition-transform after:absolute after:-inset-1.5 after:content-[''] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-primary"
          style={{ left: `${e.x}%`, top: `${e.y}%`, width: `${e.w}%`, transform: "translate(-50%, -100%)", zIndex: zOf(e.y) }}
        >
          <span className={`block ${nearId === exitId(e) ? "drop-shadow-[0_0_8px_rgba(230,126,34,1)]" : ""}`}><ArtSprite sprite={FLAT_SPRITES[e.sprite]} /></span>
          {nearId === exitId(e) && <KeyChip />}
          <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-ink bg-surface-container-lowest px-2 text-label-md font-extrabold leading-5 text-on-surface">{e.label}</span>
        </button>
      ))}
      {extras.map((e) => FLAT_SPRITES[e.sprite] && (
        <button
          key={e.id}
          type="button"
          onClick={() => onActivate(e.id)}
          aria-label={e.kind === "npc" ? `Nói chuyện với ${e.label}` : `Xem xét: ${e.label}`}
          className="group absolute cursor-pointer rounded-lg outline-offset-2 transition-transform after:absolute after:-inset-1.5 after:content-[''] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-primary"
          style={{ left: `${e.x}%`, top: `${e.y}%`, width: `${e.w}%`, transform: "translate(-50%, -100%)", zIndex: zOf(e.y, e.kind === "spot") }}
        >
          {e.kind === "npc" && <span aria-hidden="true" className="pointer-events-none absolute -bottom-[5%] left-[4%] right-[4%] h-[12%] rounded-[50%] bg-[rgba(74,46,27,0.22)]" style={{ zIndex: -1 }} />}
          <span className={`block ${nearId === e.id ? "drop-shadow-[0_0_8px_rgba(230,126,34,1)]" : e.kind === "spot" ? "drop-shadow-[0_0_6px_rgba(80,160,220,0.95)]" : ""}`}><ArtSprite sprite={FLAT_SPRITES[e.sprite]} /></span>
          {nearId === e.id && <KeyChip />}
          <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-ink bg-tertiary-container px-2 text-label-md font-extrabold leading-5 text-on-tertiary-container">{e.label}</span>
        </button>
      ))}
      {children}
    </div>
  );
}
