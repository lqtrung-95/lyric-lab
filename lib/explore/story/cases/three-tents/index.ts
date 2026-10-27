import type { StoryDef } from "../../story-types";
import { CAMPING_STORY } from "./scene-camping";
import { POLICE_STORY } from "./scene-police";
import { LAB_STORY } from "./scene-lab";
import { SUBWAY_STORY } from "./scene-subway";
import { CLUES, OBJECTIVES, SPEAKERS, SUSPECTS } from "./meta";

/**
 * Vụ án khó: "Ba chiếc lều đêm trăng" (đố vị trí). Ba lều (đỏ, xanh dương, xanh lá) xếp một hàng; chủ lều là Cú, Chó, Heo.
 * Các câu: đỏ ở bên trái xanh dương; xanh lá không ở ngoài cùng bên phải; Heo lều xanh dương; Chó lều cạnh Heo; Cú lều không phải màu đỏ; mất đồ ở lều chính giữa; kẻ trộm ở bên trái lều bị mất đồ.
 * Suy ra: xanh lá (Cú) – đỏ (Chó) – xanh dương (Heo); lều giữa là của Chó; bên trái là Cú => thủ phạm Cú. Mồi nhử: bản đồ cũ, dấu chân, thông báo mưa. Cần 6 trong 7 manh mối then chốt.
 */
export const THREE_TENTS_CASE: StoryDef = {
  id: "three-tents",
  title: "Vụ án ba chiếc lều đêm trăng",
  difficulty: "hard",
  blurb: "Ba chiếc lều xếp một hàng, một chiếc bị mất đồng hồ vàng. Không ai nói thẳng ai là thủ phạm, bạn phải tự xếp thứ tự các lều.",
  intro: "Cô Cáo kiểm lâm nhờ bạn, thám tử Gấu Trúc, tìm kẻ lấy chiếc đồng hồ vàng từ một trong ba chiếc lều trong khu cắm trại. Không có nhân chứng, chỉ có những câu mô tả: bên trái, bên phải, cạnh nhau, màu gì. Hãy ghép chúng lại để biết ba lều xếp thế nào và ai là chủ của từng lều. Cẩn thận với những tờ giấy đã cũ.",
  speakers: SPEAKERS,
  clues: CLUES,
  suspects: SUSPECTS,
  objectives: OBJECTIVES,
  scenes: { camping: CAMPING_STORY, police: POLICE_STORY, lab: LAB_STORY, subway: SUBWAY_STORY },
  solution: { suspectId: "owl", keyClues: ["letter", "tent_notice", "green_note", "dog_tent", "police_report", "owl_tent", "pig_tent"], needed: 6 },
  solvedFlag: "case:solved",
  accuseWhen: { all: ["met:dog", "met:owl", "met:pig", "clue:police_report"] },
  startScene: "camping",
  accuseScene: "camping",
  epilogueNode: "o_epi1",
};
