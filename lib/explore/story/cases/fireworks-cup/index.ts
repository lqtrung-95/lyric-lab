import type { StoryDef } from "../../story-types";
import { FUNFAIR_STORY } from "./scene-funfair";
import { ZOO_STORY } from "./scene-zoo";
import { TOYSHOP_STORY } from "./scene-toyshop";
import { GARAGE_STORY } from "./scene-garage";
import { LAUNDRY_STORY } from "./scene-laundry";
import { FARM_STORY } from "./scene-farm";
import { CLUES, OBJECTIVES, SPEAKERS, SUSPECTS } from "./meta";

/**
 * Vụ án khó: "Cúp vàng đêm pháo hoa". Cúp biến mất trong khoảng 7:30-7:50. Sổ cổng chỉ ghi Cáo, Cú, Hổ vào công viên và cổng sau luôn khóa, nhưng phải tính giờ mới loại được từng người:
 * Cáo ở trong lều (không ai ra), Cú đã rời đi trước 7:25 (hóa đơn 7:50 + 25 phút), Hổ lên vòng quay 7:45 mà đi tới gian hàng mất 10 phút, Vịt ở tiệm giặt lúc 7:35 và cách 40 phút.
 * Thủ phạm Chim: sổ cho gà cho thấy lời khai sai, hàng rào có lỗ đi tắt 10 phút (đường lớn 30 phút), miệng lỗ có mảnh vàng. Mồi nhử: cúp đồ chơi, vệt sơn vàng. Cần 3 trong 4 manh mối then chốt.
 */
export const FIREWORKS_CUP_CASE: StoryDef = {
  id: "fireworks-cup",
  title: "Vụ án chiếc cúp vàng đêm pháo hoa",
  difficulty: "hard",
  blurb: "Cúp vàng biến mất đúng lúc pháo hoa sắp bắn. Sổ cổng chỉ có ba người, nhưng đáp án không đơn giản như vậy.",
  intro: "Chú Chó bán vé nhờ bạn, thám tử Gấu Trúc, tìm chiếc cúp vàng đã biến mất lúc 7 giờ 50 tối qua. Có năm người bị nghi, nhiều bằng chứng nghe rất hợp lý nhưng có thứ lại chỉ đúng khi bạn tự tính giờ và quãng đường. Đừng tin điều gì trước khi đối chiếu.",
  speakers: SPEAKERS,
  clues: CLUES,
  suspects: SUSPECTS,
  objectives: OBJECTIVES,
  scenes: { funfair: FUNFAIR_STORY, zoo: ZOO_STORY, toyshop: TOYSHOP_STORY, garage: GARAGE_STORY, laundry: LAUNDRY_STORY, farm: FARM_STORY },
  solution: { suspectId: "bird", keyClues: ["feed_log", "fence_hole", "gold_flake", "farm_road", "gate_log", "show_sign", "ferris_log", "toy_receipt", "road_toy", "laundry_receipt", "road_laundry"], needed: 3 },
  solvedFlag: "case:solved",
  accuseWhen: { all: ["met:fox", "met:owl", "met:tiger", "met:duck", "met:bird", "clue:farm_road"] },
  startScene: "funfair",
  accuseScene: "funfair",
  epilogueNode: "o_epi1",
};
