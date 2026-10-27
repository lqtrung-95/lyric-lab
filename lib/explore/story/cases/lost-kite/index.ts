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
 * (chó bốn ngón có móng, heo hai ngón, chim ba ngón, mèo bốn ngón không móng). Cát ướt nên không biết có móng hay không: Chó và Mèo đều khớp dấu, phải dùng sổ thu ngân loại Chó rồi bảng nghỉ trưa vạch lời khai của Mèo.
 * Thủ phạm: Cô Mèo: nói ở chợ nhưng bảng ghi chợ nghỉ trưa, hỏi lại cô đổi lời, Ông Rùa thấy mèo cầm diều đỏ chạy về chợ.
 */
export const LOST_KITE_CASE: StoryDef = {
  id: "lost-kite",
  title: "Vụ án con diều đỏ biến mất",
  difficulty: "medium",
  blurb: "Diều đỏ biến mất khỏi bãi biển, chỉ còn vài dấu chân. Cát ướt làm dấu chân mờ đi, nên dấu chân chưa đủ để kết luận.",
  intro: "Con diều đỏ của Chú Vịt cứu hộ biến mất khỏi bãi biển lúc mười hai giờ trưa qua, chỉ để lại đoạn dây và vài dấu chân. Bốn người bị nghi. Cát ướt làm dấu chân mờ đi: có hai người khớp dấu, hãy tìm thêm bằng chứng để loại bớt.",
  speakers: SPEAKERS,
  clues: CLUES,
  suspects: SUSPECTS,
  objectives: OBJECTIVES,
  scenes: { beach: BEACH_STORY, "clothing-store": CLOTHING_STORE_STORY, supermarket: SUPERMARKET_STORY, school: SCHOOL_STORY, market: MARKET_STORY, park: PARK_STORY },
  solution: { suspectId: "cat", keyClues: ["paw_print", "cat_print", "dog_log", "market_sign", "cat_slip", "witness_turtle", "pig_print", "bird_print"], needed: 5 },
  solvedFlag: "case:solved",
  accuseWhen: { all: ["met:dog", "met:pig", "met:bird", "met:cat", "clue:witness_turtle"] },
  startScene: "beach",
  accuseScene: "beach",
  epilogueNode: "b_epi1",
};
