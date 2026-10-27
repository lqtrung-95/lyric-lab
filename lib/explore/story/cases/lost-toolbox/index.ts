import type { StoryDef } from "../../story-types";
import { GARAGE_STORY } from "./scene-garage";
import { FLOWERSHOP_STORY } from "./scene-flowershop";
import { ZOO_STORY } from "./scene-zoo";
import { HOTPOT_STORY } from "./scene-hotpot";
import { BUBBLETEA_STORY } from "./scene-bubbletea";
import { CLUES, OBJECTIVES, SPEAKERS, SUSPECTS } from "./meta";

/**
 * Vụ án khó (tính giờ): hộp biến mất trong khoảng 3:15–3:45; đường đi một chiều tới tiệm sửa xe: quán trà sữa 5, tiệm hoa 10, quán lẩu 20, sở thú 25 phút.
 * Mèo ký nhận các mốc cách nhau 15 phút (< 20), Cáo chỉ có hai mốc cách nhau 40 phút (< 50), Rùa bưng món lúc 3:20 và 3:40 (< 40): không ai kịp đi về.
 * Thỏ có khoảng trống 45 phút nên là người duy nhất kịp. Không có chứng cứ nào chỉ thẳng: phải tự tính. Cần 6 trong 7 manh mối then chốt.
 */
export const LOST_TOOLBOX_CASE: StoryDef = {
  id: "lost-toolbox",
  title: "Vụ án hộp dụng cụ biến mất",
  difficulty: "hard",
  blurb: "Hộp dụng cụ biến mất trong 30 phút. Không ai bị bảng giờ vạch trần ngay, chỉ có phép tính giờ đi lại mới loại được từng người.",
  intro: "Chú Hổ nhờ bạn, thám tử Gấu Trúc, tìm hộp dụng cụ đã biến mất chiều hôm qua. Bốn người bạn đều khai mình ở chỗ khác suốt cả tiếng. Không ai bị mâu thuẫn ngay: hãy xác định hộp mất lúc nào, mỗi người cách tiệm sửa xe bao xa, rồi tính xem ai kịp đi về.",
  speakers: SPEAKERS,
  clues: CLUES,
  suspects: SUSPECTS,
  objectives: OBJECTIVES,
  scenes: { garage: GARAGE_STORY, flowershop: FLOWERSHOP_STORY, zoo: ZOO_STORY, hotpot: HOTPOT_STORY, bubbletea: BUBBLETEA_STORY },
  solution: { suspectId: "rabbit", keyClues: ["d_cat", "d_fox", "d_turtle", "d_rabbit", "rabbit_slip"], needed: 4 },
  freeRoam: true,
  questions: ["Hộp dụng cụ biến mất trong khoảng thời gian nào?", "Ai kịp đến tiệm sửa xe và quay về trước khi bị phát hiện vắng mặt?", "Ai có khoảng trống đủ dài mà không ai thấy?"],
  solvedFlag: "case:solved",
  accuseWhen: { all: ["met:cat", "met:fox", "met:turtle", "met:rabbit", "clue:rabbit_slip"] },
  startScene: "garage",
  accuseScene: "garage",
  epilogueNode: "o_epi1",
};
