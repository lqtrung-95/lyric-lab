import type { StoryDef } from "../../story-types";
import { BUBBLETEA_STORY } from "./scene-bubbletea";
import { FLOWERSHOP_STORY } from "./scene-flowershop";
import { GARAGE_STORY } from "./scene-garage";
import { HOTPOT_STORY } from "./scene-hotpot";
import { ZOO_STORY } from "./scene-zoo";
import { CLUES, OBJECTIVES, SPEAKERS, SUSPECTS } from "./meta";

/**
 * Vụ án dễ: "Hộp dụng cụ biến mất". Chú Hổ mất hộp dụng cụ (có cái cờ lê mới) lúc bốn giờ chiều hôm qua. Ba người bạn đều khai mình ở chỗ khác;
 * Bé Thỏ nói đang pha trà sữa nhưng quán đóng cửa từ 3 rưỡi, có giọt trà sữa hồng trên sàn tiệm sửa xe, hộp dụng cụ đỏ nằm sau quầy và Ông Rùa thấy một con thỏ cầm hộp.
 */
export const LOST_TOOLBOX_CASE: StoryDef = {
  id: "lost-toolbox",
  title: "Vụ án hộp dụng cụ biến mất",
  difficulty: "easy",
  blurb: "Chú Hổ thợ máy mất hộp dụng cụ có cờ lê mới. Ai trong ba người bạn đang nói dối?",
  intro: "Chú Hổ nhờ bạn, thám tử Gấu Trúc, tìm hộp dụng cụ đã biến mất lúc bốn giờ chiều hôm qua. Ba người bạn đều đã ghé qua tiệm. Ai đã nói dối?",
  speakers: SPEAKERS,
  clues: CLUES,
  suspects: SUSPECTS,
  objectives: OBJECTIVES,
  scenes: { garage: GARAGE_STORY, flowershop: FLOWERSHOP_STORY, zoo: ZOO_STORY, bubbletea: BUBBLETEA_STORY, hotpot: HOTPOT_STORY },
  solution: { suspectId: "rabbit", keyClues: ["milk_drop", "closed_sign", "red_box", "witness"], needed: 3 },
  solvedFlag: "case:solved",
  accuseWhen: { all: ["met:cat", "met:fox", "met:rabbit", "clue:witness"] },
  startScene: "garage",
  accuseScene: "garage",
  epilogueNode: "o_epi1",
};
