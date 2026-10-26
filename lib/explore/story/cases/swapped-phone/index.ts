import type { StoryDef } from "../../story-types";
import { HOTPOT_STORY } from "./scene-hotpot";
import { PHARMACY_STORY } from "./scene-pharmacy";
import { PHONESHOP_STORY } from "./scene-phoneshop";
import { POSTOFFICE_STORY } from "./scene-postoffice";
import { SALON_STORY } from "./scene-salon";
import { CLUES, OBJECTIVES, SPEAKERS, SUSPECTS } from "./meta";

/**
 * Vụ án khó: "Chiếc điện thoại bị tráo" (có bước ngoặt: manh mối bị gài). Heo báo điện thoại mới bị tráo thành đồ giả ở quán lẩu lúc bảy giờ tối.
 * Nhãn hiệu thuốc trên điện thoại giả chỉ vào Cáo, nhưng hóa đơn chứng tỏ Cáo ở hiệu thuốc suốt; nhãn nằm trong hộp ngoài cửa ai cũng lấy được và Thỏ đã đến đó lúc sáu giờ.
 * Mèo nhìn đáng ngờ vì không ai ở cùng (hàng xóm nghe tiếng ti vi). Thủ phạm: Thỏ (bưu điện đóng cửa từ 6 giờ rưỡi, túi đầy nhãn thuốc, Ông Rùa thấy Thỏ tráo điện thoại); cần 3 trong 4 manh mối then chốt.
 */
export const SWAPPED_PHONE_CASE: StoryDef = {
  id: "swapped-phone",
  title: "Vụ án chiếc điện thoại bị tráo",
  difficulty: "hard",
  blurb: "Điện thoại mới của Anh Heo bị tráo thành đồ giả, và manh mối đầu tiên chỉ thẳng vào một người. Nhưng liệu nó có thật?",
  intro: "Anh Heo nhờ bạn, thám tử Gấu Trúc, tìm ra ai đã tráo chiếc điện thoại mới của anh ở quán lẩu. Có một manh mối chỉ thẳng vào một người, nhưng hãy kiểm tra thật kỹ: không phải thứ gì tìm thấy cũng là thật.",
  speakers: SPEAKERS,
  clues: CLUES,
  suspects: SUSPECTS,
  objectives: OBJECTIVES,
  scenes: { phoneshop: PHONESHOP_STORY, pharmacy: PHARMACY_STORY, salon: SALON_STORY, postoffice: POSTOFFICE_STORY, hotpot: HOTPOT_STORY },
  solution: { suspectId: "rabbit", keyClues: ["label_box", "post_log", "rabbit_bag", "witness"], needed: 3 },
  solvedFlag: "case:solved",
  accuseWhen: { all: ["met:fox", "met:cat", "met:rabbit", "clue:witness"] },
  startScene: "phoneshop",
  accuseScene: "phoneshop",
  epilogueNode: "o_epi1",
};
