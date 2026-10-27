import type { StoryDef } from "../../story-types";
import { MUSEUM_STORY } from "./scene-museum";
import { CINEMA_STORY } from "./scene-cinema";
import { LAUNDRY_STORY } from "./scene-laundry";
import { BANK_STORY } from "./scene-bank";
import { AIRPORT_STORY } from "./scene-airport";
import { CLUES, OBJECTIVES, SPEAKERS, SUSPECTS } from "./meta";

/**
 * Vụ án khó (đồng phạm): bình ngọc mất trong 30 phút, sàn có hai loại dấu chân. Thỏ và Vịt làm chứng cho nhau nhưng cả hai đều sai (suất chiếu bị hủy, tiệm giặt đóng cửa); Cáo và Heo có ngoại phạm thật.
 * Phải chọn đúng cả hai người mới phá án (solution.partnerId). Mồi nhử: bột giặt trắng ở bậu cửa chỉ riêng về Vịt. Thỏ chỉ đổi lời khi được đưa đúng sổ rạp phim. Cần 5 trong 7 manh mối then chốt.
 */
export const JADE_VASE_CASE: StoryDef = {
  id: "jade-vase",
  title: "Vụ án bình ngọc ở bảo tàng",
  difficulty: "hard",
  blurb: "Bình ngọc biến mất trong 30 phút. Hai người làm chứng cho nhau, nhưng cả hai đều nói sai.",
  intro: "Cụ Cú nhờ bạn, thám tử Gấu Trúc, tìm bình ngọc đã biến mất trong nửa tiếng chiều nay. Có bốn người bị nghi. Lần này kẻ gian có thể không đi một mình: hãy tự do điều tra, nối manh mối lại, và chọn đúng tất cả những người liên quan.",
  speakers: SPEAKERS,
  clues: CLUES,
  suspects: SUSPECTS,
  objectives: OBJECTIVES,
  scenes: { museum: MUSEUM_STORY, cinema: CINEMA_STORY, laundry: LAUNDRY_STORY, bank: BANK_STORY, airport: AIRPORT_STORY },
  solution: { suspectId: "rabbit", partnerId: "duck", keyClues: ["d_film", "d_ticket", "d_ring", "d_two", "d_fox", "d_pig", "d_fox_ok", "d_pig_ok", "cinema_log", "laundry_log", "footprints", "museum_time", "bank_log", "flight_log", "rabbit_slip"], needed: 5 },
  freeRoam: true,
  questions: ["Có mấy người đã ra tay?", "Lời khai nào của ai là giả?", "Ai thật sự có chứng cứ ngoại phạm?"],
  solvedFlag: "case:solved",
  accuseWhen: { all: ["met:rabbit", "met:duck", "met:fox", "met:pig", "clue:rabbit_slip"] },
  startScene: "museum",
  accuseScene: "museum",
  epilogueNode: "o_epi1",
};
