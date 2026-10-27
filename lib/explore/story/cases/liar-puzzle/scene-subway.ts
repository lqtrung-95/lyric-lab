import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const pig = buildInterview({
  prefix: "pig", speaker: "pig",
  greeting: { zh: "你好!请出示你的交通卡。", vi: "Chào bạn! Xin xuất trình thẻ đi lại." },
  question: { zh: "你知道是谁偷了金奖章吗?", vi: "Bạn có biết ai đã lấy huy chương vàng không?" },
  chatter: [
    { ask: { zh: "你昨晚在哪儿?", vi: "Tối qua anh ở đâu?" }, reply: { zh: "我在地铁站工作。", vi: "Tôi làm việc ở ga tàu điện ngầm." } },
    { ask: { zh: "你和狐狸熟吗?", vi: "Anh có thân với Cáo không?" }, reply: { zh: "不太熟。", vi: "Không thân lắm." } },
  ],
  answer: { zh: "是狐狸干的。", vi: "Là Cáo làm." },
  check: { vi: "Anh Heo nói gì về chuyện này?", right: { zh: "是狐狸干的", vi: "Là Cáo làm" }, wrong: [{ zh: "是猫头鹰干的", vi: "Là Cú làm" }, { zh: "不是狐狸干的", vi: "Không phải Cáo làm" }], rightAt: 0 },
  clue: "pig_say", metFlag: "met:pig",
  closing: { zh: "我只知道这些。", vi: "Tôi chỉ biết có bấy nhiêu." },
  after: { zh: "我说的就是这些。你还有事吗?", vi: "Tôi chỉ nói bằng này thôi. Bạn còn việc gì không?" },
});

/** Ga tàu điện ngầm: Heo khai là Cáo làm. */
export const SUBWAY_STORY: StorySceneDef = {
  sceneId: "subway",
  sceneNpcEntries: pig.entries,
  spots: [

  ],
  dialogues: pig.nodes,
};
