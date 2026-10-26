import type { StoryDef } from "../../story-types";
import { HOTPOT_STORY } from "./scene-hotpot";
import { PHARMACY_STORY } from "./scene-pharmacy";
import { PHONESHOP_STORY } from "./scene-phoneshop";
import { POSTOFFICE_STORY } from "./scene-postoffice";
import { SALON_STORY } from "./scene-salon";
import { CLUES, OBJECTIVES, SPEAKERS, SUSPECTS } from "./meta";

/**
 * Vụ án dễ: "Bưu kiện biến mất". Bác Thỏ mất bưu kiện (có chiếc đồng hồ mới) lúc sáu giờ chiều hôm qua. Ba người bạn ghé qua đều khai mình ở chỗ khác;
 * Anh Heo bán máy nói đang ở cửa hàng nhưng bảng cho thấy tiệm đóng cửa từ 5 giờ rưỡi, băng keo trong tiệm có chữ “机” giống cuộn ở bưu điện,
 * và Ông Rùa thấy một con heo cầm bưu kiện ở quán lẩu.
 */
export const LOST_PARCEL_CASE: StoryDef = {
  id: "lost-parcel",
  title: "Vụ án bưu kiện biến mất",
  difficulty: "easy",
  blurb: "Bác Thỏ ở bưu điện mất một bưu kiện đựng đồng hồ mới. Ai trong ba người bạn đang nói dối?",
  intro: "Bác Thỏ nhờ bạn, thám tử Gấu Trúc, tìm bưu kiện đựng chiếc đồng hồ mới đã biến mất lúc sáu giờ chiều hôm qua. Ba người bạn đều đã ghé qua bưu điện. Ai đã nói dối?",
  speakers: SPEAKERS,
  clues: CLUES,
  suspects: SUSPECTS,
  objectives: OBJECTIVES,
  scenes: { postoffice: POSTOFFICE_STORY, salon: SALON_STORY, pharmacy: PHARMACY_STORY, phoneshop: PHONESHOP_STORY, hotpot: HOTPOT_STORY },
  solution: { suspectId: "pig", keyClues: ["tape", "closing_sign", "shop_tapes", "witness"], needed: 3 },
  solvedFlag: "case:solved",
  accuseWhen: { all: ["met:cat", "met:fox", "met:pig", "clue:witness"] },
  startScene: "postoffice",
  accuseScene: "postoffice",
  epilogueNode: "o_epi1",
};
