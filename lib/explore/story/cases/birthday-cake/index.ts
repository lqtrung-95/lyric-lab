import type { StoryDef } from "../../story-types";
import { BAKERY_STORY } from "./scene-bakery";
import { GYM_STORY } from "./scene-gym";
import { SCHOOL_STORY } from "./scene-school";
import { GARAGE_STORY } from "./scene-garage";
import { PARK_STORY } from "./scene-park";
import { CLUES, OBJECTIVES, SPEAKERS, SUSPECTS } from "./meta";

/**
 * Vụ án khó (không có thủ phạm): chiếc bánh sinh nhật của Mèo không bị trộm. Chó (nói dối là ở phòng gym) đã đặt bánh bí mật và đến lấy lúc 3:45 để tạo bất ngờ; Rùa thấy Chó ôm hộp bánh.
 * Chó chỉ đổi lời khi người chơi đưa đúng sổ đơn của tiệm bánh (đưa nhầm thì chối). Đáp án đúng là "Không ai cả"; buộc tội Chó là sai. Tự do điều tra, các suy luận phải tự nối. Cần 4 trong 5 manh mối then chốt.
 */
export const BIRTHDAY_CAKE_CASE: StoryDef = {
  id: "birthday-cake",
  title: "Vụ án chiếc bánh sinh nhật biến mất",
  difficulty: "hard",
  blurb: "Bánh sinh nhật của Cô Mèo biến mất ngay hôm sinh nhật. Có kẻ nói dối, nhưng có chắc là có kẻ trộm?",
  intro: "Cô Mèo chủ tiệm bánh nhờ bạn, thám tử Gấu Trúc, tìm chiếc bánh sinh nhật biến mất chiều nay. Ba người bạn bị nghi, và một người đã nói dối. Hãy tự do điều tra, nối manh mối lại: có khi câu trả lời không phải là một cái tên.",
  speakers: SPEAKERS,
  clues: CLUES,
  suspects: SUSPECTS,
  objectives: OBJECTIVES,
  scenes: { bakery: BAKERY_STORY, gym: GYM_STORY, school: SCHOOL_STORY, garage: GARAGE_STORY, park: PARK_STORY },
  solution: { suspectId: "nobody", keyClues: ["d_order", "d_dog", "d_bird", "d_tiger", "dog_slip"], needed: 4 },
  freeRoam: true,
  questions: ["Chiếc bánh có thật sự bị trộm không?", "Ai đã nói dối, và vì sao?", "Người ôm hộp bánh là ai, đến lấy lúc nào?"],
  solvedFlag: "case:solved",
  accuseWhen: { all: ["met:dog", "met:bird", "met:tiger", "clue:witness_turtle", "clue:dog_slip"] },
  startScene: "bakery",
  accuseScene: "bakery",
  epilogueNode: "o_epi1",
};
