"use client";

import type { StoryPayload } from "@/lib/explore/story/load-story";
import { CoopChat } from "./coop-chat";
import { CoopStrip } from "./coop-strip";
import type { useStoryController } from "./use-story-controller";

type Coop = NonNullable<ReturnType<typeof useStoryController>["coop"]>;

/**
 * Chơi chung: một thanh nhỏ phía trên cảnh (ai, phòng nào, đồng đội online, cảnh của ai) và bong bóng chat nổi ở góc dưới bên phải
 * (hộp thư, tin nhắn, soạn câu tiếng Trung). Manh mối bạn tìm được là riêng của bạn: phải báo cho đồng đội trong Sổ vụ án thì họ mới có.
 */
export function CoopBar({ coop, payload, sceneId, hasClue, onOpenCase }: { coop: Coop; payload: StoryPayload; sceneId: string; hasClue: (id: string) => boolean; onOpenCase: () => void }) {
  return (
    <>
      <CoopStrip coop={coop} sceneId={sceneId} onOpenCase={onOpenCase} />
      <CoopChat coop={coop} payload={payload} hasClue={hasClue} onOpenCase={onOpenCase} />
    </>
  );
}
