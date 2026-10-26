import type { StoryDef } from "../../story-types";
import { HOSPITAL_STORY } from "./scene-hospital";
import { MARKET_STORY } from "./scene-market";
import { PARK_STORY } from "./scene-park";
import { STATION_STORY } from "./scene-station";
import { ROOM_STORY } from "./scene-room";
import { RESTAURANT_STORY } from "./scene-restaurant";
import { CLUES, OBJECTIVES, SPEAKERS, SUSPECTS } from "./meta";

/**
 * Vụ án 1: "Chiếc hộp gỗ biến mất". Cú Thầy mất hộp gỗ (đựng thư của ông nội) lúc ba giờ chiều hôm qua. Bốn người bạn đến nhà hôm đó đều khai mình ở chỗ khác;
 * người chơi đi từng nơi, hỏi bằng tiếng Trung, đọc manh mối, rồi chỉ ra ai nói dối. Thủ phạm: Bác sĩ Cáo (nói ốm ngủ ở bệnh viện nhưng đã rời đó từ hai giờ, dùng bút xanh
 * giống cây bút rơi ở nhà Cú Thầy, và Ông Rùa thấy một con cáo mặc áo trắng cầm hộp gỗ).
 */
export const HOP_GO_CASE: StoryDef = {
  id: "wooden-box",
  title: "Vụ án chiếc hộp gỗ biến mất",
  difficulty: "easy",
  blurb: "Cú Thầy mất chiếc hộp gỗ đựng thư của ông nội. Ai trong bốn người bạn đang nói dối?",
  intro: "Cú Thầy nhờ bạn, thám tử Gấu Trúc, tìm chiếc hộp gỗ đựng thư của ông nội đã biến mất lúc ba giờ chiều hôm qua. Bốn người bạn của Cú đều có mặt hôm đó. Ai đã nói dối?",
  speakers: SPEAKERS,
  clues: CLUES,
  suspects: SUSPECTS,
  objectives: OBJECTIVES,
  scenes: {
    room: ROOM_STORY, restaurant: RESTAURANT_STORY, market: MARKET_STORY, station: STATION_STORY, hospital: HOSPITAL_STORY, park: PARK_STORY,
  },
  solution: { suspectId: "fox", keyClues: ["pen", "pens_jar", "sign_sheet", "witness"], needed: 3 },
  solvedFlag: "case:solved",
  accuseWhen: { all: ["met:chef", "met:cat", "met:rabbit", "met:fox", "clue:witness"] },
  startScene: "room",
  accuseScene: "room",
  epilogueNode: "o_epi1",
};
