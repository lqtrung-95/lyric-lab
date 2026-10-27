import { SCENE_CONVERSATIONS } from "@/lib/explore/scenes/scene-conversations";
import { SCENES } from "@/lib/explore/scenes";
import { DAILY_DIALOGUES } from "./authored-dialogues-daily";
import { TRIP_DIALOGUES } from "./authored-dialogues-trips";
import type { DialogueDef } from "./dialogue-types";

/** Hội thoại ngắn của từng cảnh Khám phá, đổi sang dạng chung (tiêu đề lấy theo tên cảnh). */
function sceneDialogues(): DialogueDef[] {
  return Object.values(SCENES).flatMap((scene) => {
    const conv = SCENE_CONVERSATIONS[scene.id];
    if (!conv || conv.speakers.length < 2) return [];
    return [{
      id: `scene-${scene.id}`,
      title: { zh: "", vi: scene.title },
      topic: "scene" as const,
      speakers: [conv.speakers[0], conv.speakers[1]] as [string, string],
      lines: conv.lines,
      sceneId: scene.id,
    }];
  });
}

/** Mọi hội thoại: bài tự viết dài hơn trước, rồi hội thoại ngắn lấy từ các cảnh. */
export const ALL_DIALOGUES: DialogueDef[] = [...DAILY_DIALOGUES, ...TRIP_DIALOGUES, ...sceneDialogues()];

const BY_ID = new Map(ALL_DIALOGUES.map((d) => [d.id, d]));
export const findDialogue = (id: string): DialogueDef | undefined => BY_ID.get(id);
