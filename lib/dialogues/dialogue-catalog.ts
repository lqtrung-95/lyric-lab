import { SCENE_CONVERSATIONS } from "@/lib/explore/scenes/scene-conversations";
import { SCENES } from "@/lib/explore/scenes";
import { DAILY_DIALOGUES } from "./authored-dialogues-daily";
import { TRIP_DIALOGUES } from "./authored-dialogues-trips";
import { SCENE_DIALOGUES_A } from "./scene-dialogues-a";
import { SCENE_DIALOGUES_B } from "./scene-dialogues-b";
import { SCENE_DIALOGUES_C } from "./scene-dialogues-c";
import { SCENE_DIALOGUES_D } from "./scene-dialogues-d";
import { SCENE_DIALOGUES_E } from "./scene-dialogues-e";
import { SCENE_DIALOGUES_F } from "./scene-dialogues-f";
import type { DialogueDef } from "./dialogue-types";

const SCENE_DIALOGUES = [...SCENE_DIALOGUES_A, ...SCENE_DIALOGUES_B, ...SCENE_DIALOGUES_C, ...SCENE_DIALOGUES_D, ...SCENE_DIALOGUES_E, ...SCENE_DIALOGUES_F];
const WRITTEN_SCENES = new Set(SCENE_DIALOGUES.map((d) => d.sceneId));

/** Cảnh chưa có bài dài thì dùng tạm hội thoại ngắn của chính cảnh đó (đổi sang dạng chung, tiêu đề lấy theo tên cảnh). */
function fallbackSceneDialogues(): DialogueDef[] {
  return Object.values(SCENES).filter((scene) => !WRITTEN_SCENES.has(scene.id)).flatMap((scene) => {
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

/** Mọi hội thoại: bài đời sống tự viết trước, rồi bài dài của từng cảnh (cảnh nào chưa có thì dùng hội thoại ngắn của cảnh). */
export const ALL_DIALOGUES: DialogueDef[] = [...DAILY_DIALOGUES, ...TRIP_DIALOGUES, ...SCENE_DIALOGUES, ...fallbackSceneDialogues()];

const BY_ID = new Map(ALL_DIALOGUES.map((d) => [d.id, d]));
export const findDialogue = (id: string): DialogueDef | undefined => BY_ID.get(id);
