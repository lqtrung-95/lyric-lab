import type { StoryDef } from "../../story-types";
import { POSTOFFICE_STORY } from "./scene-postoffice";
import { SALON_STORY } from "./scene-salon";
import { PHARMACY_STORY } from "./scene-pharmacy";
import { HOTPOT_STORY } from "./scene-hotpot";
import { PHONESHOP_STORY } from "./scene-phoneshop";
import { CLUES, OBJECTIVES, SPEAKERS, SUSPECTS } from "./meta";

/**
 * Vụ án khó: "Bưu kiện biến mất". Mảnh giấy của kẻ trộm nhắc “hộp đỏ”, nhưng hộp được bọc giấy nâu nên chỉ ba người từng thấy: Heo, Cáo, Rùa.
 * Mèo nói dối (sổ hẹn cho thấy cô đóng cửa lúc 5 giờ 40, đi mua quà sinh nhật) nhưng không biết hộp đỏ nên không phải thủ phạm; Cáo và Rùa có chứng cứ ngoại phạm thật.
 * Chỉ còn Heo: cửa hàng đã đóng cửa từ 5 rưỡi. Cần 5 trong 6 manh mối then chốt.
 */
export const LOST_PARCEL_CASE: StoryDef = {
  id: "lost-parcel",
  title: "Vụ án bưu kiện biến mất",
  difficulty: "hard",
  blurb: "Mảnh giấy của kẻ trộm nhắc đến một chiếc hộp đỏ. Ai từng thấy chiếc hộp đó, và ai chỉ đang nói dối vì chuyện khác?",
  intro: "Bác Thỏ nhờ bạn, thám tử Gấu Trúc, tìm bưu kiện đựng chiếc đồng hồ mới đã biến mất lúc sáu giờ chiều hôm qua. Kẻ trộm để lại một mảnh giấy. Có người nói dối nhưng chưa chắc là kẻ trộm: hãy hỏi xem ai mới biết được điều viết trên mảnh giấy.",
  speakers: SPEAKERS,
  clues: CLUES,
  suspects: SUSPECTS,
  objectives: OBJECTIVES,
  scenes: { postoffice: POSTOFFICE_STORY, salon: SALON_STORY, pharmacy: PHARMACY_STORY, hotpot: HOTPOT_STORY, phoneshop: PHONESHOP_STORY },
  solution: { suspectId: "pig", keyClues: ["d_fox", "d_turtle", "d_pig", "thief_note", "pig_slip"], needed: 4 },
  freeRoam: true,
  questions: ["Kẻ trộm biết điều gì mà không phải ai cũng biết?", "Ai thật sự từng thấy chiếc hộp đỏ?", "Trong số đó, ai không có chứng cứ ngoại phạm lúc sáu giờ?"],
  solvedFlag: "case:solved",
  accuseWhen: { all: ["met:cat", "met:fox", "met:turtle", "met:pig", "clue:pig_slip"] },
  startScene: "postoffice",
  accuseScene: "postoffice",
  epilogueNode: "o_epi1",
};
