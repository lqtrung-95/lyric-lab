import { dlg } from "./authored-dialogues-daily";
import type { DialogueDef, DialogueTopic } from "./dialogue-types";

/**
 * Hội thoại dài của một cảnh Khám phá: id là `scene-<id cảnh>`, gắn với cảnh để mời người học sang học từ ở đó.
 * Thay cho hội thoại ngắn 4 câu của cảnh (`SCENE_CONVERSATIONS`) trong kho hội thoại.
 */
export function sd(sceneId: string, topic: DialogueTopic, title: [string, string], speakers: [string, string], lines: [number, string, string][]): DialogueDef {
  return { ...dlg(`scene-${sceneId}`, title, topic, speakers, lines), sceneId };
}
