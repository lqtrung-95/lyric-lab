import type { StoryDef } from "../../story-types";
import { POSTOFFICE_STORY } from "./scene-postoffice";
import { SALON_STORY } from "./scene-salon";
import { GYM_STORY } from "./scene-gym";
import { LAUNDRY_STORY } from "./scene-laundry";
import { PHONESHOP_STORY } from "./scene-phoneshop";
import { CLUES, OBJECTIVES, SPEAKERS, SUSPECTS } from "./meta";

/**
 * Vụ án khó (đọc hiểu tiếng Trung): kẻ trộm để lại hai mảnh giấy, một nói nhà ở phía đông bưu điện, một nói cách chưa tới 200 mét. Biển địa chỉ nhà bốn nghi phạm đều chỉ có chữ Hán (không bản dịch): Mèo ở phía tây, Heo ở phía bắc, Vịt phía đông nhưng 300 mét, chỉ Chó thỏa cả hai.
 * Người chơi phải đọc hướng và số đo (東/西/南/北, 百, 米). Chó chỉ đổi lời khi được đưa đúng biển địa chỉ nhà ông. Cần 5 trong 6 manh mối then chốt.
 */
export const NOTE_DIRECTIONS_CASE: StoryDef = {
  id: "note-directions",
  title: "Vụ án hai mảnh giấy chỉ đường",
  difficulty: "hard",
  blurb: "Kẻ trộm để lại hai mảnh giấy tả nhà mình bằng tiếng Trung, không dịch. Hãy đọc hướng và khoảng cách để tìm ra nhà của hắn.",
  intro: "Bác Thỏ ở bưu điện mất một bưu kiện đựng bộ ấm trà. Kẻ trộm để lại hai mảnh giấy tả nhà mình, nhưng chữ chỉ có tiếng Trung và không có bản dịch. Hãy tự đọc hướng đông tây nam bắc và khoảng cách, rồi so với biển địa chỉ của từng người.",
  speakers: SPEAKERS,
  clues: CLUES,
  suspects: SUSPECTS,
  objectives: OBJECTIVES,
  scenes: { postoffice: POSTOFFICE_STORY, salon: SALON_STORY, gym: GYM_STORY, laundry: LAUNDRY_STORY, phoneshop: PHONESHOP_STORY },
  solution: { suspectId: "dog", keyClues: ["d_cat", "d_pig", "d_duck", "d_dog_east", "d_dog_near", "dog_slip"], needed: 5 },
  freeRoam: true,
  questions: ["Nhà của kẻ trộm ở hướng nào so với bưu điện?", "Nhà đó cách bưu điện bao xa?", "Ai sống ở đúng chỗ đó?"],
  solvedFlag: "case:solved",
  accuseWhen: { all: ["met:cat", "met:dog", "met:duck", "met:pig", "clue:dog_slip"] },
  startScene: "postoffice",
  accuseScene: "postoffice",
  epilogueNode: "o_epi1",
};
