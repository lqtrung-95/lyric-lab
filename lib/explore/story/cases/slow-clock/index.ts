import type { StoryDef } from "../../story-types";
import { BUBBLETEA_STORY } from "./scene-bubbletea";
import { FLOWERSHOP_STORY } from "./scene-flowershop";
import { GARAGE_STORY } from "./scene-garage";
import { HOTPOT_STORY } from "./scene-hotpot";
import { ZOO_STORY } from "./scene-zoo";
import { CLUES, OBJECTIVES, SPEAKERS, SUSPECTS } from "./meta";

/**
 * Vụ án khó: "Chiếc đồng hồ chạy chậm" (bước ngoặt: giờ báo án sai). Mèo báo bó hoa biến mất lúc năm giờ, nhưng đồng hồ của tiệm chạy chậm hai tiếng, giờ thật là ba giờ.
 * Mồi nhử: đóa hồng trong hộp dụng cụ của Hổ (mua tối qua tặng vợ). Thủ phạm: Cáo (sổ cho ăn ghi ba giờ không ai cho thú ăn, cánh hoa hồng cạnh lồng, Rùa thấy cáo cầm hoa); cần 3 trong 4 manh mối then chốt.
 */
export const SLOW_CLOCK_CASE: StoryDef = {
  id: "slow-clock",
  title: "Vụ án chiếc đồng hồ chạy chậm",
  difficulty: "hard",
  blurb: "Bó hoa lớn của Cô Mèo biến mất lúc năm giờ chiều. Nhưng liệu bây giờ có thật là năm giờ?",
  intro: "Cô Mèo nhờ bạn, thám tử Gấu Trúc, tìm bó hoa lớn đã biến mất lúc năm giờ chiều hôm qua. Ba người bạn đều có lý do để ở gần tiệm. Hãy kiểm tra thật kỹ mọi chi tiết, kể cả cái đồng hồ trên tường: không phải thứ gì cũng chính xác.",
  speakers: SPEAKERS,
  clues: CLUES,
  suspects: SUSPECTS,
  objectives: OBJECTIVES,
  scenes: { flowershop: FLOWERSHOP_STORY, garage: GARAGE_STORY, bubbletea: BUBBLETEA_STORY, zoo: ZOO_STORY, hotpot: HOTPOT_STORY },
  solution: { suspectId: "fox", keyClues: ["slow_clock", "feed_log", "petals", "witness", "repair_sheet", "order_sheet"], needed: 3 },
  solvedFlag: "case:solved",
  accuseWhen: { all: ["met:tiger", "met:rabbit", "met:fox", "clue:witness"] },
  startScene: "flowershop",
  accuseScene: "flowershop",
  epilogueNode: "o_epi1",
};
