import type { StoryDef } from "../../story-types";
import { BEACH_STORY } from "./scene-beach";
import { CLOTHING_STORE_STORY } from "./scene-clothing-store";
import { MARKET_STORY } from "./scene-market";
import { PARK_STORY } from "./scene-park";
import { SCHOOL_STORY } from "./scene-school";
import { SUPERMARKET_STORY } from "./scene-supermarket";
import { CLUES, OBJECTIVES, SPEAKERS, SUSPECTS } from "./meta";

/**
 * Vụ án 5: "Con diều đỏ biến mất" (mức Vừa). Diều của Chú Vịt mất ở bãi biển trưa qua. Bốn người bị nghi, mỗi người có dấu chân khác nhau
 * (chó có móng, heo hai ngón, chim ba ngón, mèo bốn ngón không móng); phải xem dấu chân từng người mới thấy chỉ có Mèo khớp dấu trên cát.
 * Thủ phạm: Cô Mèo: nói ở chợ nhưng bảng ghi chợ nghỉ trưa, hỏi lại cô đổi lời, Ông Rùa thấy mèo cầm diều đỏ chạy về chợ.
 */
export const LOST_KITE_CASE: StoryDef = {
  id: "lost-kite",
  title: "Vụ án con diều đỏ biến mất",
  difficulty: "medium",
  intro: "Con diều đỏ của Chú Vịt cứu hộ biến mất khỏi bãi biển lúc mười hai giờ trưa qua, chỉ để lại đoạn dây và vài dấu chân. Bốn người bị nghi. Hãy so dấu chân của từng người với dấu trên cát và đừng bỏ sót người nào.",
  speakers: SPEAKERS,
  clues: CLUES,
  suspects: SUSPECTS,
  objectives: OBJECTIVES,
  scenes: { beach: BEACH_STORY, "clothing-store": CLOTHING_STORE_STORY, supermarket: SUPERMARKET_STORY, school: SCHOOL_STORY, market: MARKET_STORY, park: PARK_STORY },
  solution: { suspectId: "cat", keyClues: ["paw_print", "cat_print", "market_sign", "cat_slip", "witness_turtle"], needed: 4 },
  solvedFlag: "case:solved",
  accuseWhen: { all: ["met:dog", "met:pig", "met:bird", "met:cat", "clue:witness_turtle"] },
  startScene: "beach",
  accuseScene: "beach",
  epilogueNode: "b_epi1",
};
