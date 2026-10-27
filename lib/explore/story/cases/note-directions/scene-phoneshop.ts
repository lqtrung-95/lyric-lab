import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const pig = buildInterview({
  prefix: "pig", speaker: "pig",
  greeting: { zh: "你好!要买手机吗?", vi: "Chào bạn! Bạn muốn mua điện thoại à?" },
  question: { zh: "昨天下午你在哪儿?", vi: "Chiều qua bạn ở đâu?" },
  chatter: [
    { ask: { zh: "你住在哪儿?", vi: "Bạn sống ở đâu?" }, reply: { zh: "你去看看我家门口的牌子吧。", vi: "Bạn hãy xem tấm biển trước cửa nhà tôi nhé." } },
  ],
  answer: { zh: "昨天下午我在家里休息。", vi: "Chiều qua tôi nghỉ ở nhà." },
  check: { vi: "Chiều qua Anh Heo nói mình ở đâu?", right: { zh: "在家里", vi: "Ở nhà" }, wrong: [{ zh: "在邮局", vi: "Ở bưu điện" }, { zh: "在公园", vi: "Ở công viên" }], rightAt: 0 },
  clue: "pig_home_talk", metFlag: "met:pig",
  closing: { zh: "牌子在门口。", vi: "Tấm biển ở ngay cửa." },
  after: { zh: "还有事吗?", vi: "Còn việc gì không?" },
});

/** Cửa hàng điện thoại: biển địa chỉ nhà Heo (phía bắc). */
export const PHONESHOP_STORY: StorySceneDef = {
  sceneId: "phoneshop",
  sceneNpcEntries: [
    ...pig.entries,
  ],
  spots: [
    { id: "home_pig", clue: "home_pig", label: "Biển địa chỉ", sprite: "note", x: 14, y: 86, w: 5, when: { all: ["met:pig"] }, stand: { x: 20, y: 92 } },
  ],
  dialogues: {
    ...pig.nodes,
  },
};
