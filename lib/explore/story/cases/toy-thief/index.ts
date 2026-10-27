import type { StoryDef } from "../../story-types";
import { TOYSHOP_STORY } from "./scene-toyshop";
import { BUBBLETEA_STORY } from "./scene-bubbletea";
import { FARM_STORY } from "./scene-farm";
import { LAUNDRY_STORY } from "./scene-laundry";
import { GARAGE_STORY } from "./scene-garage";
import { FUNFAIR_STORY } from "./scene-funfair";
import { CLUES, OBJECTIVES, SPEAKERS, SUSPECTS } from "./meta";

/**
 * Vụ án khó: "Tên trộm ở cửa hàng đồ chơi". Không có nhân chứng; dấu vết tên trộm: áo khoác xanh dương (sợi chỉ), tay trái (chữ viết trên tờ ghi chú), giày cỡ 45 (dấu chân).
 * Thỏ: xanh dương, tay phải, 45; Chim: đỏ, tay trái, 45; Vịt: xanh dương, tay trái, 38; Hổ: xanh dương, tay trái, 45 (khớp cả ba, thủ phạm); Chó: xanh lá, tay phải, 45.
 * Cần 5 trong 6 manh mối then chốt: ba dấu vết ở cửa hàng và ba đặc điểm của Hổ.
 */
export const TOY_THIEF_CASE: StoryDef = {
  id: "toy-thief",
  title: "Vụ án tên trộm ở cửa hàng đồ chơi",
  difficulty: "hard",
  blurb: "Tên trộm không ai nhìn thấy, chỉ để lại ba dấu vết. Năm nghi phạm, ai cũng khớp một vài dấu vết.",
  intro: "Cụ Cú nhờ bạn, thám tử Gấu Trúc, tìm kẻ lấy chiếc xe điều khiển từ xa lúc tám giờ tối qua. Không có nhân chứng, chỉ có ba dấu vết hắn để lại. Mỗi nghi phạm đều khớp một vài dấu vết: hãy ghi nhớ, đối chiếu từng chi tiết (màu áo, tay thuận, cỡ giày) và đừng buộc tội khi mới khớp hai trên ba.",
  speakers: SPEAKERS,
  clues: CLUES,
  suspects: SUSPECTS,
  objectives: OBJECTIVES,
  scenes: { toyshop: TOYSHOP_STORY, bubbletea: BUBBLETEA_STORY, farm: FARM_STORY, laundry: LAUNDRY_STORY, garage: GARAGE_STORY, funfair: FUNFAIR_STORY },
  solution: { suspectId: "tiger", keyClues: ["toy_thread", "toy_hand", "toy_foot", "tiger_coat", "tiger_hand", "tiger_shoe"], needed: 5 },
  solvedFlag: "case:solved",
  accuseWhen: { all: ["met:rabbit", "met:bird", "met:duck", "met:tiger", "met:dog", "clue:dog_shoe"] },
  startScene: "toyshop",
  accuseScene: "toyshop",
  epilogueNode: "o_epi1",
};
