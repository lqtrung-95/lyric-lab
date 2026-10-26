import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const duck = buildInterview({
  prefix: "duck", speaker: "duck",
  greeting: { zh: "你好!你要洗衣服吗?", vi: "Chào bạn! Bạn muốn giặt đồ à?" },
  question: { zh: "昨天晚上八点你在哪儿?", vi: "Tám giờ tối qua bạn ở đâu?" },
  chatter: [
    { ask: { zh: "你认识那个小偷吗?", vi: "Bạn có biết tên trộm không?" }, reply: { zh: "我不认识。", vi: "Tôi không biết." } },
    { ask: { zh: "你喜欢玩具吗?", vi: "Bạn có thích đồ chơi không?" }, reply: { zh: "喜欢,但是我很少买。", vi: "Thích, nhưng tôi ít khi mua." } },
  ],
  answer: { zh: "昨天晚上八点,我不在玩具店,我在洗衣店。", vi: "Tám giờ tối qua, tôi không ở cửa hàng đồ chơi, tôi ở tiệm giặt." },
  check: { vi: "Vịt nói tám giờ tối qua mình ở đâu?", right: { zh: "在洗衣店", vi: "Ở tiệm giặt" }, wrong: [{ zh: "在玩具店", vi: "Ở cửa hàng đồ chơi" }, { zh: "在帐篷里", vi: "Trong lều" }], rightAt: 0 },
  clue: "duck_alibi", metFlag: "met:duck",
  closing: { zh: "你可以看看我的东西。", vi: "Bạn có thể xem đồ của tôi." },
  after: { zh: "我已经说完了。你还有事吗?", vi: "Tôi nói xong rồi. Bạn còn việc gì không?" },
});

/** Cảnh của Vịt: khai không ở cửa hàng đồ chơi lúc tám giờ (không ai kiểm chứng được); ba đồ vật cho biết áo khoác, tay thuận và cỡ giày để đối chiếu với dấu vết tên trộm. */
export const LAUNDRY_STORY: StorySceneDef = {
  sceneId: "laundry",
  sceneNpcEntries: duck.entries,
  spots: [
    { id: "duck_coat", clue: "duck_coat", label: "Áo khoác của Vịt", sprite: "coat", x: 14, y: 86, w: 6, when: { all: ["met:duck"] }, stand: { x: 20, y: 92 } },
    { id: "duck_hand", clue: "duck_hand", label: "Sổ ghi của Vịt", sprite: "note", x: 68, y: 92, w: 5, when: { all: ["met:duck"] }, stand: { x: 68, y: 95 } },
    { id: "duck_shoe", clue: "duck_shoe", label: "Giày của Vịt", sprite: "slippers", x: 24, y: 80, w: 5, when: { all: ["met:duck"] }, stand: { x: 24, y: 90 } },
  ],
  dialogues: duck.nodes,
};
