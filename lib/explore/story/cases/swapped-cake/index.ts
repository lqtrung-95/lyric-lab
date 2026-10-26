import type { StoryDef } from "../../story-types";
import { HOSPITAL_STORY } from "./scene-hospital";
import { MARKET_STORY } from "./scene-market";
import { PARK_STORY } from "./scene-park";
import { RESTAURANT_STORY } from "./scene-restaurant";
import { SCHOOL_STORY } from "./scene-school";
import { STATION_STORY } from "./scene-station";
import { CLUES, OBJECTIVES, SPEAKERS, SUSPECTS } from "./meta";

/**
 * Vụ án 3: "Chiếc bánh kem bị đánh tráo". Bánh dự thi của Bếp trưởng Gấu bị đổi thành bánh mặn khi ông ra chợ (2 giờ - 2 giờ 30). Năm người bị nghi.
 * Thủ phạm: Trưởng ga Thỏ, người cũng là kẻ đổ lỗi cho Bác sĩ Cáo. Muốn kết luận phải ghép: người mua muối dùng phiếu vé tàu (chỉ tới ga), sổ phẫu thuật (Cáo không thể ở quán ăn nên Thỏ nói dối),
 * bảng đóng cửa sổ bán vé (Thỏ không bán vé lúc đó), Thỏ đổi lời khi bị hỏi lại, và Ông Rùa thấy thỏ cầm hộp chạy về ga (chỉ kể khi đã có manh mối người mua muối).
 * Mồi nhử: túi muối có dấu chợ (chỉ về Mèo), bột mì dính áo Cô Chim.
 * Mức Khó: 5 nghi phạm, người làm chứng nói dối, ba chỗ phải có chứng cứ trong tay mới hỏi tiếp được.
 */
export const SWAPPED_CAKE_CASE: StoryDef = {
  id: "swapped-cake",
  title: "Vụ án chiếc bánh kem bị đánh tráo",
  difficulty: "hard",
  blurb: "Bánh dự thi bị đánh tráo, và có người còn đổ lỗi cho người khác.",
  intro: "Bánh dự thi của Bếp trưởng Gấu bị đánh tráo thành bánh mặn trong lúc ông ra chợ. Năm người bị nghi, và có người không chỉ nói dối về mình mà còn đổ lỗi cho người khác. Hãy kiểm tra từng lời khai bằng sổ sách, đừng tin ngay những thứ trông có vẻ rõ ràng.",
  speakers: SPEAKERS,
  clues: CLUES,
  suspects: SUSPECTS,
  objectives: OBJECTIVES,
  scenes: { restaurant: RESTAURANT_STORY, market: MARKET_STORY, hospital: HOSPITAL_STORY, school: SCHOOL_STORY, station: STATION_STORY, park: PARK_STORY },
  solution: { suspectId: "rabbit", keyClues: ["sign_sheet", "salt_buyer", "ticket_closed", "rabbit_slip", "turtle_sighting"], needed: 4 },
  solvedFlag: "case:solved",
  accuseWhen: { all: ["met:cat", "met:fox", "met:bird", "met:rabbit", "met:turtle", "clue:turtle_sighting"] },
  startScene: "restaurant",
  accuseScene: "restaurant",
  epilogueNode: "c_epi1",
};
