import type { StoryDef } from "../../story-types";
import { BEACH_STORY } from "./scene-beach";
import { LIBRARY_STORY } from "./scene-library";
import { OFFICE_STORY } from "./scene-office";
import { SUPERMARKET_STORY } from "./scene-supermarket";
import { CLUES, OBJECTIVES, SPEAKERS, SUSPECTS } from "./meta";

/**
 * Vụ án 4: "Chiếc bút máy của Cô Cú" (mức Dễ). Bút vàng của Cô Cú thủ thư mất lúc ba giờ chiều. Ba người bị nghi. Thủ phạm: Chú Vịt cứu hộ, nói ở bãi biển
 * nhưng sổ trực cho thấy đã rời lúc hai giờ rưỡi; nắp bút ở cửa thư viện dính cát (chỉ có ở bãi biển) và Chó thấy một con vịt chân dính cát đi qua văn phòng.
 */
export const FOUNTAIN_PEN_CASE: StoryDef = {
  id: "fountain-pen",
  title: "Vụ án chiếc bút máy của Cô Cú",
  difficulty: "easy",
  blurb: "Bút máy vàng của cô thủ thư biến mất lúc ba giờ chiều. Ba người bị nghi.",
  intro: "Cô Cú thủ thư mất chiếc bút máy vàng quý lúc ba giờ chiều qua. Có ba người bị nghi. Hãy xem kỹ những thứ bị bỏ lại ở thư viện, rồi so lời khai với sổ sách.",
  speakers: SPEAKERS,
  clues: CLUES,
  suspects: SUSPECTS,
  objectives: OBJECTIVES,
  scenes: { library: LIBRARY_STORY, office: OFFICE_STORY, supermarket: SUPERMARKET_STORY, beach: BEACH_STORY },
  solution: { suspectId: "duck", keyClues: ["ink_trail", "pen_cap", "dog_alibi", "beach_log"], needed: 3 },
  solvedFlag: "case:solved",
  accuseWhen: { all: ["met:dog", "met:pig", "met:duck", "clue:beach_log"] },
  startScene: "library",
  accuseScene: "library",
  epilogueNode: "l_epi1",
};
