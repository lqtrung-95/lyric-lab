import type { StoryDef } from "../../story-types";
import { BEACH_STORY } from "./scene-beach";
import { LIBRARY_STORY } from "./scene-library";
import { OFFICE_STORY } from "./scene-office";
import { SUPERMARKET_STORY } from "./scene-supermarket";
import { CLUES, OBJECTIVES, SPEAKERS, SUSPECTS } from "./meta";

/**
 * Vụ án vừa: "Chiếc bút máy của Cô Cú". Bút vàng mất lúc ba giờ chiều. Vịt nói dối (rời bãi biển lúc 2:30) và Chó chỉ vào Vịt, nhưng Vịt chỉ ghé thư viện mượn sách và rời lúc 2:50 khi bút vẫn còn.
 * Nắp bút dính cát trắng mịn, trùng khay cát trên bàn Chó, không phải cát vàng thô ở biển; họp bắt đầu lúc 3:20 nên Chó không có ngoại phạm. Mồi nhử: lời khai sai của Vịt. Cần 5 trong 6 manh mối then chốt.
 */
export const FOUNTAIN_PEN_CASE: StoryDef = {
  id: "fountain-pen",
  title: "Vụ án chiếc bút máy của Cô Cú",
  difficulty: "medium",
  blurb: "Bút máy vàng của cô thủ thư biến mất lúc ba giờ chiều. Có người nói dối và có người bị đổ oan.",
  intro: "Cô Cú thủ thư mất chiếc bút máy vàng quý lúc ba giờ chiều qua. Có ba người bị nghi. Người nói dối chưa chắc là kẻ lấy bút, và thứ bị bỏ lại ở hiện trường có thể do người khác đặt vào. Hãy so cát, mốc giờ và lời khai.",
  speakers: SPEAKERS,
  clues: CLUES,
  suspects: SUSPECTS,
  objectives: OBJECTIVES,
  scenes: { library: LIBRARY_STORY, office: OFFICE_STORY, supermarket: SUPERMARKET_STORY, beach: BEACH_STORY },
  solution: { suspectId: "dog", keyClues: ["d_sand", "d_notbeach", "d_duck", "d_dog", "pen_cap", "office_sand", "beach_sand", "library_card", "meeting_note", "dog_slip"], needed: 4 },
  freeRoam: true,
  questions: ["Cát trên nắp bút từ đâu ra?", "Chú Vịt có thật sự lấy bút không?", "Ai không có chứng cứ ngoại phạm lúc ba giờ?"],
  solvedFlag: "case:solved",
  accuseWhen: { all: ["met:dog", "met:pig", "met:duck", "clue:dog_slip"] },
  startScene: "library",
  accuseScene: "library",
  epilogueNode: "l_epi1",
};
