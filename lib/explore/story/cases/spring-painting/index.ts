import type { StoryDef } from "../../story-types";
import { BAKERY_STORY } from "./scene-bakery";
import { KITCHEN_STORY } from "./scene-kitchen";
import { MUSEUM_STORY } from "./scene-museum";
import { STADIUM_STORY } from "./scene-stadium";
import { STATION_STORY } from "./scene-station";
import { CLUES, OBJECTIVES, SPEAKERS, SUSPECTS } from "./meta";

/**
 * Vụ án 6: "Bức tranh Mùa Xuân" (mức Khó). Tranh bị lấy khỏi bảo tàng lúc 9 giờ - 9 giờ 30 sáng qua. Thủ phạm: Cô Mèo thợ bánh. Thỏ nói dối đổ lỗi cho Gấu để che cho Mèo (bạn anh).
 * Vết kem chỉ về cả Gấu và Mèo; phải loại Gấu (sổ bếp), vạch trần Thỏ (bảng đóng cửa sổ và sổ bếp), thấy tiệm bánh đóng cửa đúng lúc đó, và nối tạp dề hồng với người Chó thấy
 * (Chó chỉ kể khi đã vạch trần lời Thỏ). Cần 4 trong 5 manh mối then chốt.
 */
export const SPRING_PAINTING_CASE: StoryDef = {
  id: "spring-painting",
  title: "Vụ án bức tranh Mùa Xuân",
  difficulty: "hard",
  blurb: "Tranh quý biến mất khỏi bảo tàng, và có người nói dối để che cho bạn mình.",
  intro: "Bức tranh \"Mùa Xuân\" nổi tiếng biến mất khỏi bảo tàng sáng qua, chỉ để lại một vệt kem trên tường. Bốn người bị nghi, và có người không nói dối vì bản thân mà vì muốn che cho người khác. Hãy kiểm tra từng lời khai bằng sổ sách và đừng tin lời ai trước khi có chứng cứ.",
  speakers: SPEAKERS,
  clues: CLUES,
  suspects: SUSPECTS,
  objectives: OBJECTIVES,
  scenes: { museum: MUSEUM_STORY, kitchen: KITCHEN_STORY, station: STATION_STORY, bakery: BAKERY_STORY, stadium: STADIUM_STORY },
  solution: { suspectId: "cat", keyClues: ["kitchen_log", "rabbit_slip", "bakery_sign", "apron_color", "dog_sighting", "attendance", "window_closed"], needed: 4 },
  solvedFlag: "case:solved",
  accuseWhen: { all: ["met:chef", "met:rabbit", "met:cat", "met:dog", "clue:dog_sighting"] },
  startScene: "museum",
  accuseScene: "museum",
  epilogueNode: "m_epi1",
};
