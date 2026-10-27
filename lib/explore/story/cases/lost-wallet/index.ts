import type { StoryDef } from "../../story-types";
import { BANK_STORY } from "./scene-bank";
import { CINEMA_STORY } from "./scene-cinema";
import { GYM_STORY } from "./scene-gym";
import { SALON_STORY } from "./scene-salon";
import { SUPERMARKET_STORY } from "./scene-supermarket";
import { CLUES, OBJECTIVES, SPEAKERS, SUSPECTS } from "./meta";

/**
 * Vụ án 7: "Chiếc ví bị mất" (mức Vừa). Ví của Cô Cáo mất ở ngân hàng lúc 2 giờ - 2 giờ 20 chiều qua. Ba người bị nghi được loại bằng sổ sách (Thỏ, Mèo, Heo);
 * thủ phạm: Chú Chó: nói ở phòng gym nhưng sổ ký tên cho thấy đã rời lúc 1 giờ 50, người mua vé suất 2 giờ 30 mặc đồ thể thao, và khi bị hỏi lại ông đổi lời.
 * Kẹp tóc hồng chỉ là mồi nhử. Cần 3 trong 4 manh mối then chốt.
 */
export const LOST_WALLET_CASE: StoryDef = {
  id: "lost-wallet",
  title: "Vụ án chiếc ví bị mất",
  difficulty: "medium",
  blurb: "Ví của nhân viên ngân hàng biến mất, chỉ còn cuống vé xem phim và một chiếc kẹp tóc.",
  intro: "Chiếc ví của Cô Cáo biến mất ở ngân hàng chiều qua. Trên sàn chỉ còn một cuống vé xem phim và một chiếc kẹp tóc hồng. Bốn người bị nghi; hãy kiểm tra từng lời khai bằng sổ sách, loại trừ dần, rồi hỏi lại người đáng ngờ nhất.",
  speakers: SPEAKERS,
  clues: CLUES,
  suspects: SUSPECTS,
  objectives: OBJECTIVES,
  scenes: { bank: BANK_STORY, cinema: CINEMA_STORY, salon: SALON_STORY, supermarket: SUPERMARKET_STORY, gym: GYM_STORY },
  solution: { suspectId: "dog", keyClues: ["stub", "buyer_note", "gym_signout", "dog_slip", "sales_log", "appointment", "pig_receipt"], needed: 3 },
  solvedFlag: "case:solved",
  accuseWhen: { all: ["met:rabbit", "met:cat", "met:pig", "met:dog", "clue:dog_slip"] },
  startScene: "bank",
  accuseScene: "bank",
  epilogueNode: "f_epi1",
};
