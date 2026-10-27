import type { StoryDef } from "../../story-types";
import { BANK_STORY } from "./scene-bank";
import { CINEMA_STORY } from "./scene-cinema";
import { GYM_STORY } from "./scene-gym";
import { MUSEUM_STORY } from "./scene-museum";
import { SALON_STORY } from "./scene-salon";
import { CLUES, OBJECTIVES, SPEAKERS, SUSPECTS } from "./meta";

/**
 * Vụ án 8: "Chiếc cúp biến mất" (mức Khó, có bước ngoặt). Chó báo cúp vàng bị trộm chiều qua, nhưng chính Chó mới là người nói sai: cúp đã được chính ông cho bảo tàng mượn từ tuần trước.
 * Phải nghi ngờ cả người báo án: lớp bụi dày chứng tỏ cúp đã mất từ lâu, Cáo chỉ kể chuyện tuần trước khi đã thấy lớp bụi, đơn mượn của bảo tàng ghi tên Chó, và hỏi lại Chó cần đủ ba thứ.
 * Mồi nhử: thùng bắp vàng của Thỏ, nhũ vàng của Mèo. Năm nghi phạm (gồm cả người báo án); cần 3 trong 4 manh mối then chốt.
 */
export const TROPHY_LOAN_CASE: StoryDef = {
  id: "trophy-loan",
  title: "Vụ án chiếc cúp biến mất",
  difficulty: "hard",
  blurb: "Cúp vàng của phòng gym bị báo mất. Nhưng liệu có ai bị mất đồ thật không?",
  intro: "Chú Chó PT báo chiếc cúp vàng của phòng gym bị trộm chiều qua. Có bốn người bị nghi, kèm vài thứ lấp lánh làm bạn phân tâm. Hãy kiểm tra thật kỹ mọi chi tiết, kể cả lời của người báo án: không phải vụ án nào cũng có kẻ trộm.",
  speakers: SPEAKERS,
  clues: CLUES,
  suspects: SUSPECTS,
  objectives: OBJECTIVES,
  scenes: { gym: GYM_STORY, bank: BANK_STORY, cinema: CINEMA_STORY, salon: SALON_STORY, museum: MUSEUM_STORY },
  solution: { suspectId: "dog", keyClues: ["dust_shelf", "witness_fox", "loan_form", "dog_slip", "sales_log", "appointment"], needed: 3 },
  solvedFlag: "case:solved",
  accuseWhen: { all: ["met:fox", "met:rabbit", "met:cat", "met:owl", "clue:dog_slip"] },
  startScene: "gym",
  accuseScene: "gym",
  epilogueNode: "g_epi1",
};
