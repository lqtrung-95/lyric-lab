import type { StoryDef } from "../../story-types";
import { POLICE_STORY } from "./scene-police";
import { LAB_STORY } from "./scene-lab";
import { SUBWAY_STORY } from "./scene-subway";
import { CAMPING_STORY } from "./scene-camping";
import { FARM_STORY } from "./scene-farm";
import { LAUNDRY_STORY } from "./scene-laundry";
import { CLUES, OBJECTIVES, SPEAKERS, SUSPECTS } from "./meta";

/**
 * Vụ án khó: "Lời khai mâu thuẫn" (đố nói thật nói dối). Quy tắc: chỉ kẻ trộm nói dối, người khác đều nói thật.
 * Cú: "không phải Heo"; Heo: "là Cáo"; Cáo: "Heo nói dối"; Chim: "không phải tôi"; Vịt: "không phải tôi, cũng không phải Cú".
 * Chỉ khi thủ phạm là Cáo thì lời của Cáo sai và bốn lời còn lại đều đúng (thử giả sử từng người khác đều mâu thuẫn). Cần 5 trong 6 manh mối then chốt.
 */
export const LIAR_PUZZLE_CASE: StoryDef = {
  id: "liar-puzzle",
  title: "Vụ án lời khai mâu thuẫn",
  difficulty: "hard",
  blurb: "Năm người, năm câu nói, chỉ một người nói dối. Không ai bị bắt quả tang, bạn phải tự suy luận ai nói dối.",
  intro: "Chú Chó cảnh sát nhờ bạn, thám tử Gấu Trúc, tìm kẻ lấy huy chương vàng của đồn. Camera đã hỏng, không có dấu vết gì rõ ràng. Có năm người bị nghi, mỗi người nói một câu. Quy tắc duy nhất: chỉ kẻ trộm mới nói dối. Hãy đọc thật kỹ từng câu, thử từng giả thuyết, và chọn đúng người.",
  speakers: SPEAKERS,
  clues: CLUES,
  suspects: SUSPECTS,
  objectives: OBJECTIVES,
  scenes: { police: POLICE_STORY, lab: LAB_STORY, subway: SUBWAY_STORY, camping: CAMPING_STORY, farm: FARM_STORY, laundry: LAUNDRY_STORY },
  solution: { suspectId: "fox", keyClues: ["rule", "owl_say", "pig_say", "fox_say", "bird_say", "duck_say"], needed: 5 },
  solvedFlag: "case:solved",
  accuseWhen: { all: ["met:owl", "met:pig", "met:fox", "met:bird", "met:duck", "clue:laundry_note"] },
  startScene: "police",
  accuseScene: "police",
  epilogueNode: "o_epi1",
};
