"use client";

import { Button3d } from "@/components/ui/button-3d";
import type { SceneNpc } from "@/lib/explore/explore-types";
import { ArtSprite } from "./art/art-sprite";
import { FLAT_SPRITES } from "./art/flat/flat-sprites";

interface Props {
  npc: SceneNpc;
  learned: number;
  total: number;
  canQuest: boolean;
  onStart: () => void;
  onClose: () => void;
}

/** Lời của NPC khi người chơi nói chuyện: nếu đã học đủ từ thì có nút nhận nhiệm vụ, chưa đủ thì nhắc đi học thêm. */
export function NpcCard({ npc, learned, total, canQuest, onStart, onClose }: Props) {
  return (
    <section aria-label={npc.name} className="card-ink p-space-md">
      <div className="flex items-start gap-space-sm">
        <div className="w-14 shrink-0"><ArtSprite sprite={FLAT_SPRITES[npc.id]} /></div>
        <div className="min-w-0 flex-1">
          <p className="text-label-md font-extrabold text-primary">{npc.name}</p>
          <p className="text-body-md font-bold">{canQuest ? `Bạn đã học ${learned}/${total} từ. Sẵn sàng làm nhiệm vụ chưa?` : learned === 0 ? npc.greeting : npc.notReady}</p>
        </div>
      </div>
      <div className="mt-space-sm flex flex-wrap items-center gap-2">
        {canQuest && <Button3d variant="secondary" onClick={onStart}>Nhận nhiệm vụ</Button3d>}
        <button type="button" onClick={onClose} className="min-h-11 px-2 text-label-md font-extrabold text-primary hover:underline">Đóng</button>
      </div>
    </section>
  );
}
