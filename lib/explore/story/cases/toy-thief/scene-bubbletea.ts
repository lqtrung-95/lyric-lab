import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const rabbit = buildInterview({
  prefix: "rabbit", speaker: "rabbit",
  greeting: { zh: "你好!你想喝点什么?", vi: "Chào bạn! Bạn muốn uống gì?" },
  question: { zh: "昨天晚上八点你在哪儿?", vi: "Tám giờ tối qua bạn ở đâu?" },
  chatter: [
    { ask: { zh: "你认识那个小偷吗?", vi: "Bạn có biết tên trộm không?" }, reply: { zh: "我不认识。", vi: "Tôi không biết." } },
    { ask: { zh: "你喜欢玩具吗?", vi: "Bạn có thích đồ chơi không?" }, reply: { zh: "喜欢,但是我很少买。", vi: "Thích, nhưng tôi ít khi mua." } },
  ],
  answer: { zh: "昨天晚上八点,我不在玩具店,我在家。", vi: "Tám giờ tối qua, tôi không ở cửa hàng đồ chơi, tôi ở nhà." },
  check: { vi: "Thỏ nói tám giờ tối qua mình ở đâu?", right: { zh: "在家", vi: "Ở nhà" }, wrong: [{ zh: "在玩具店", vi: "Ở cửa hàng đồ chơi" }, { zh: "在洗衣店", vi: "Ở tiệm giặt" }], rightAt: 0 },
  clue: "rabbit_alibi", metFlag: "met:rabbit",
  closing: { zh: "你可以看看我的东西。", vi: "Bạn có thể xem đồ của tôi." },
  after: { zh: "我已经说完了。你还有事吗?", vi: "Tôi nói xong rồi. Bạn còn việc gì không?" },
});

/** Cảnh của Thỏ: khai không ở cửa hàng đồ chơi lúc tám giờ (không ai kiểm chứng được); ba đồ vật cho biết áo khoác, tay thuận và cỡ giày để đối chiếu với dấu vết tên trộm. */
export const BUBBLETEA_STORY: StorySceneDef = {
  sceneId: "bubbletea",
  sceneNpcEntries: rabbit.entries,
  spots: [
    { id: "rabbit_coat", clue: "rabbit_coat", label: "Áo khoác của Thỏ", sprite: "coat", x: 14, y: 86, w: 6, when: { all: ["met:rabbit"] }, stand: { x: 20, y: 92 } },
    { id: "rabbit_hand", clue: "rabbit_hand", label: "Sổ ghi của Thỏ", sprite: "note", x: 68, y: 92, w: 5, when: { all: ["met:rabbit"] }, stand: { x: 68, y: 95 } },
    { id: "rabbit_shoe", clue: "rabbit_shoe", label: "Giày của Thỏ", sprite: "slippers", x: 24, y: 80, w: 5, when: { all: ["met:rabbit"] }, stand: { x: 24, y: 90 } },
  ],
  dialogues: rabbit.nodes,
};
