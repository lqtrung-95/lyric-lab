"use client";

import { ArtSprite } from "./art/art-sprite";
import { SceneBackdrop } from "./art/scene-backdrop";
import { resolveArt, type ArtStyle } from "./art/scene-art";
import type { SceneWord } from "@/lib/explore/explore-types";

export type ObjectMark = "new" | "learned" | "faded";

interface Props {
  objects: SceneWord[];
  art: ArtStyle;
  marks: Record<string, ObjectMark>;
  /** Đang làm nhiệm vụ: ẩn nhãn chữ Hán và tên đọc cho trình đọc màn hình (không lộ đáp án). */
  hideLabels: boolean;
  highlightId: string | null;
  shakeId: string | null;
  onTap: (o: SceneWord) => void;
}

/** Khung cảnh 4:3: nền + các vật đặt theo % (giữa-đáy), mỗi vật là một nút thật (vùng bấm theo kích thước vật, tối thiểu 44 px). Vật xa hơn (y nhỏ) vẽ trước; vật đặt trên đồ khác (`above`) vẽ sau cùng. */
export function SceneCanvas({ objects, art, marks, hideLabels, highlightId, shakeId, onTap }: Props) {
  const ordered = [...objects].sort((a, b) => Number(!!a.above) - Number(!!b.above) || a.y - b.y);
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border-2 border-ink shadow-[0_4px_0_var(--shadow-ink)]" style={{ aspectRatio: "4 / 3" }}>
      <SceneBackdrop style={art} />
      {ordered.map((o, i) => {
        const resolved = resolveArt(o.id, art);
        if (!resolved) return null;
        const scale = resolved.kind === "img" ? resolved.ai.scale : 1;
        const mark = marks[o.id] ?? "new";
        const hit = highlightId === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onTap(o)}
            aria-label={hideLabels ? "Vật trong phòng" : `${o.term}, ${o.gloss}`}
            className={`group absolute min-h-11 min-w-11 cursor-pointer rounded-lg outline-offset-2 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-primary ${shakeId === o.id ? "anim-note-shake" : ""} ${hit ? "anim-note-pop" : ""}`}
            style={{ left: `${o.x}%`, top: `${o.y}%`, width: `${o.w * scale}%`, transform: "translate(-50%, -100%)", zIndex: 10 + i }}
          >
            <span className={`block transition-all ${mark === "faded" ? "opacity-60 saturate-50" : ""} ${mark === "new" && !hideLabels ? "drop-shadow-[0_0_6px_rgba(255,200,60,0.95)]" : ""} ${hit ? "drop-shadow-[0_0_10px_rgba(60,200,90,1)]" : ""}`}>
              <ArtSprite art={resolved} />
            </span>
            {!hideLabels && mark !== "new" && (
              <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-ink bg-surface-container-lowest px-2 text-label-md font-extrabold leading-5 text-on-surface">
                {o.term}{mark === "faded" && <span className="ml-1 text-primary">↻</span>}
              </span>
            )}
            {!hideLabels && mark === "new" && <span aria-hidden="true" className="pointer-events-none absolute -right-1 -top-2 animate-pulse text-base">✨</span>}
          </button>
        );
      })}
    </div>
  );
}
