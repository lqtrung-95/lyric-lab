"use client";

import type { Ref } from "react";
import { ArtSprite } from "./art/art-sprite";
import { FLAT_SPRITES } from "./art/flat/flat-sprites";

export type AvatarFx = "hop" | "oops" | null;

/** Chiều rộng nhân vật, % khung cảnh. */
const AVATAR_WIDTH = 8.5;

/**
 * Nhân vật người chơi (Gấu Trúc). Vị trí do `usePlayerMovement` ghi thẳng vào phần tử qua `elRef` (không đặt left/top ở đây để React không ghi đè);
 * quay mặt bằng lật ngang, nhún khi đi, nhảy khi trả lời đúng, lắc khi sai.
 */
export function PlayerAvatar({ elRef, walking, facing, fx, carrying }: { elRef: Ref<HTMLDivElement>; walking: boolean; facing: 1 | -1; fx: AvatarFx; /** Vật đang cầm (hiện nhỏ trên đầu), null nếu tay không. */ carrying: string | null }) {
  return (
    <div ref={elRef} aria-hidden="true" data-testid="player-avatar" className="pointer-events-none absolute" style={{ width: `${AVATAR_WIDTH}%`, transform: "translate(-50%, -100%)" }}>
      <span className="pointer-events-none absolute -bottom-[5%] left-[4%] right-[4%] h-[12%] rounded-[50%] bg-[rgba(74,46,27,0.25)]" style={{ zIndex: -1 }} />
      {carrying && FLAT_SPRITES[carrying] && (
        <div className="pointer-events-none absolute -top-[42%] left-1/2 w-[62%] -translate-x-1/2" style={{ zIndex: 2 }}>
          <ArtSprite sprite={FLAT_SPRITES[carrying]} />
        </div>
      )}
      <div className={fx === "hop" ? "anim-avatar-hop" : fx === "oops" ? "anim-note-shake" : walking ? "anim-walk-bob" : ""}>
        <div style={{ transform: `scaleX(${facing})` }}>
          <ArtSprite sprite={FLAT_SPRITES.guide} />
        </div>
      </div>
    </div>
  );
}
