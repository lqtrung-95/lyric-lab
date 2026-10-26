import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const bird = buildInterview({
  prefix: "bird", speaker: "bird",
  greeting: { zh: "你好!有事吗?", vi: "Chào bạn! Có việc gì không?" },
  question: { zh: "昨天中午十二点你在哪儿?", vi: "Mười hai giờ trưa qua bạn ở đâu?" },
  chatter: [
    { ask: { zh: "您教什么?", vi: "Cô dạy môn gì?" }, reply: { zh: "我教汉语。", vi: "Tôi dạy tiếng Trung." } },
    { ask: { zh: "学生多不多?", vi: "Có nhiều học sinh không?" }, reply: { zh: "不多,二十个。", vi: "Không nhiều, hai mươi em." } },
  ],
  answer: { zh: "昨天中午十二点,我在学校吃饭。", vi: "Trưa qua mười hai giờ, tôi ăn cơm ở trường." },
  check: { vi: "Cô Chim nói trưa qua 12 giờ cô làm gì?", right: { zh: "在学校吃饭", vi: "Ăn cơm ở trường" }, wrong: [{ zh: "在海边玩", vi: "Chơi ở bãi biển" }, { zh: "在医院工作", vi: "Làm việc ở bệnh viện" }], rightAt: 2 },
  clue: "bird_alibi", metFlag: "met:bird",
  closing: { zh: "我的脚印在门口。", vi: "Dấu chân của tôi ở cửa." },
  after: { zh: "还有事吗?", vi: "Còn việc gì không?" },
});

/** Trường học: dấu chân Chim có ba ngón nên không khớp (loại trừ). */
export const SCHOOL_STORY: StorySceneDef = {
  sceneId: "school",
  sceneNpcEntries: bird.entries,
  spots: [
    { id: "bird_print", clue: "bird_print", label: "Dấu chân ở cửa lớp", sprite: "note", x: 30, y: 90, w: 4, when: { all: ["met:bird"] } },
  ],
  dialogues: bird.nodes,
};
