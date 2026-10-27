import type { StoryDef } from "../../story-types";
import { AIRPORT_STORY } from "./scene-airport";
import { CLOTHING_STORE_STORY } from "./scene-clothing-store";
import { HOTEL_STORY } from "./scene-hotel";
import { PARK_STORY } from "./scene-park";
import { SCHOOL_STORY } from "./scene-school";
import { STATION_STORY } from "./scene-station";
import { CLUES, OBJECTIVES, SPEAKERS, SUSPECTS } from "./meta";

/**
 * Vụ án 2: "Chiếc chìa khóa vàng". Chìa khóa két sắt của khách sạn mất khoảng 8 giờ tối. Bốn người bị nghi, lời khai có chỗ không khớp.
 * Thủ phạm: Cô Chim (giáo viên): nói ở trường nhưng sổ ra vào cho thấy đã rời lúc 7 giờ 30; chiếc ô đỏ trong sảnh có chữ "校" (ô ở cửa hàng của Chó thì không có chữ);
 * Heo thấy một người cầm ô đỏ vào khách sạn lúc 8 giờ 15 và Ông Rùa thấy cô giáo cầm ô đỏ đi về phía đó lúc 7 giờ 45. Mồi nhử: Chó (ô ở cửa hàng cũng đỏ, lại giấu quà) và chính chiếc ô “校” (hòm đồ thất lạc ở ga có nhiều ô giống hệt nên ô không chứng minh chủ nhân); phải dựa vào sổ ra vào, bảng ca của Heo và hai nhân chứng.
 * Mức Vừa: 4 nghi phạm, chứng cứ gián tiếp phải ghép, một người làm chứng chỉ khai khi đã có manh mối chiếc ô.
 */
export const GOLDEN_KEY_CASE: StoryDef = {
  id: "golden-key",
  title: "Vụ án chiếc chìa khóa vàng",
  difficulty: "medium",
  blurb: "Chìa khóa két sắt của khách sạn biến mất. Những chi tiết giống nhau sẽ đánh lừa bạn.",
  intro: "Chú Vịt lễ tân nhờ bạn, thám tử Gấu Trúc, tìm chiếc chìa khóa vàng của két sắt khách sạn, mất khoảng tám giờ tối qua. Có bốn người bị nghi và không phải ai cũng nói thật. Hãy so sánh lời khai với chứng cứ, và nhớ: có những chi tiết trông giống nhau nhưng khác nhau.",
  speakers: SPEAKERS,
  clues: CLUES,
  suspects: SUSPECTS,
  objectives: OBJECTIVES,
  scenes: { hotel: HOTEL_STORY, "clothing-store": CLOTHING_STORE_STORY, school: SCHOOL_STORY, station: STATION_STORY, airport: AIRPORT_STORY, park: PARK_STORY },
  solution: { suspectId: "bird", keyClues: ["sign_sheet", "pig_shift", "witness_pig", "witness_turtle", "bird_slip", "dog_receipt", "shop_umbrellas", "rabbit_log"], needed: 4 },
  solvedFlag: "case:solved",
  accuseWhen: { all: ["met:dog", "met:bird", "met:rabbit", "met:pig", "clue:witness_turtle"] },
  startScene: "hotel",
  accuseScene: "hotel",
  epilogueNode: "d_epi1",
};
