import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const duck = buildInterview({
  prefix: "duck", speaker: "duck",
  greeting: { zh: "你好!要洗衣服吗?", vi: "Chào bạn! Bạn muốn giặt đồ à?" },
  question: { zh: "昨天下午你在哪儿?", vi: "Chiều qua bạn ở đâu?" },
  chatter: [
    { ask: { zh: "你住在哪儿?", vi: "Bạn sống ở đâu?" }, reply: { zh: "你去看看我家门口的牌子吧。", vi: "Bạn hãy xem tấm biển trước cửa nhà tôi nhé." } },
  ],
  answer: { zh: "昨天下午我在家里休息。", vi: "Chiều qua tôi nghỉ ở nhà." },
  check: { vi: "Chiều qua Chú Vịt nói mình ở đâu?", right: { zh: "在家里", vi: "Ở nhà" }, wrong: [{ zh: "在邮局", vi: "Ở bưu điện" }, { zh: "在公园", vi: "Ở công viên" }], rightAt: 0 },
  clue: "duck_home_talk", metFlag: "met:duck",
  closing: { zh: "牌子在门口。", vi: "Tấm biển ở ngay cửa." },
  after: { zh: "还有事吗?", vi: "Còn việc gì không?" },
});

/** Tiệm giặt: biển địa chỉ nhà Vịt (phía đông nhưng 300 mét). */
export const LAUNDRY_STORY: StorySceneDef = {
  sceneId: "laundry",
  sceneNpcEntries: [
    ...duck.entries,
  ],
  spots: [
    { id: "home_duck", clue: "home_duck", label: "Biển địa chỉ", sprite: "note", x: 14, y: 86, w: 5, when: { all: ["met:duck"] }, stand: { x: 20, y: 92 } },
  ],
  dialogues: {
    ...duck.nodes,
  },
};
