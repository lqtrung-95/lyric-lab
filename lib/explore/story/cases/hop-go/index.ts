import type { StoryDef } from "../../story-types";
import { BENH_VIEN_STORY } from "./scene-benh-vien";
import { CHO_STORY } from "./scene-cho";
import { CONG_VIEN_STORY } from "./scene-cong-vien";
import { NHA_GA_STORY } from "./scene-nha-ga";
import { PHONG_STORY } from "./scene-phong";
import { QUAN_AN_STORY } from "./scene-quan-an";
import { CLUES, OBJECTIVES, SPEAKERS, SUSPECTS } from "./meta";

/**
 * Vụ án 1: "Chiếc hộp gỗ biến mất". Cú Thầy mất hộp gỗ (đựng thư của ông nội) lúc ba giờ chiều hôm qua. Bốn người bạn đến nhà hôm đó đều khai mình ở chỗ khác;
 * người chơi đi từng nơi, hỏi bằng tiếng Trung, đọc manh mối, rồi chỉ ra ai nói dối. Thủ phạm: Bác sĩ Cáo (nói ốm ngủ ở bệnh viện nhưng đã rời đó từ hai giờ, dùng bút xanh
 * giống cây bút rơi ở nhà Cú Thầy, và Ông Rùa thấy một con cáo mặc áo trắng cầm hộp gỗ).
 */
export const HOP_GO_CASE: StoryDef = {
  id: "hop-go",
  title: "Vụ án chiếc hộp gỗ biến mất",
  difficulty: "easy",
  intro: "Cú Thầy nhờ bạn, thám tử Gấu Trúc, tìm chiếc hộp gỗ đựng thư của ông nội đã biến mất lúc ba giờ chiều hôm qua. Bốn người bạn của Cú đều có mặt hôm đó. Ai đã nói dối?",
  speakers: SPEAKERS,
  clues: CLUES,
  suspects: SUSPECTS,
  objectives: OBJECTIVES,
  scenes: {
    phong: PHONG_STORY, "quan-an": QUAN_AN_STORY, cho: CHO_STORY, "nha-ga": NHA_GA_STORY, "benh-vien": BENH_VIEN_STORY, "cong-vien": CONG_VIEN_STORY,
  },
  solution: { suspectId: "fox", keyClues: ["pen", "pens_jar", "sign_sheet", "witness"], needed: 3 },
  solvedFlag: "case:solved",
  accuseWhen: { all: ["met:chef", "met:cat", "met:rabbit", "met:fox", "clue:witness"] },
  startScene: "phong",
  accuseScene: "phong",
  epilogueNode: "o_epi1",
};
