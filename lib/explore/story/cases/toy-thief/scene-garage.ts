import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const tiger = buildInterview({
  prefix: "tiger", speaker: "tiger",
  greeting: { zh: "你好!你的车坏了吗?", vi: "Chào bạn! Xe bạn hỏng à?" },
  question: { zh: "昨天晚上八点你在哪儿?", vi: "Tám giờ tối qua bạn ở đâu?" },
  chatter: [
    { ask: { zh: "你认识那个小偷吗?", vi: "Bạn có biết tên trộm không?" }, reply: { zh: "我不认识。", vi: "Tôi không biết." } },
    { ask: { zh: "你喜欢玩具吗?", vi: "Bạn có thích đồ chơi không?" }, reply: { zh: "喜欢,但是我很少买。", vi: "Thích, nhưng tôi ít khi mua." } },
  ],
  answer: { zh: "昨天晚上八点,我不在玩具店,我在修车店。", vi: "Tám giờ tối qua, tôi không ở cửa hàng đồ chơi, tôi ở tiệm sửa xe." },
  check: { vi: "Hổ nói tám giờ tối qua mình ở đâu?", right: { zh: "在修车店", vi: "Ở tiệm sửa xe" }, wrong: [{ zh: "在玩具店", vi: "Ở cửa hàng đồ chơi" }, { zh: "在农场", vi: "Ở nông trại" }], rightAt: 0 },
  clue: "tiger_alibi", metFlag: "met:tiger",
  closing: { zh: "你可以看看我的东西。", vi: "Bạn có thể xem đồ của tôi." },
  after: { zh: "我已经说完了。你还有事吗?", vi: "Tôi nói xong rồi. Bạn còn việc gì không?" },
});

/** Cảnh của Hổ: khai không ở cửa hàng đồ chơi lúc tám giờ (không ai kiểm chứng được); ba đồ vật cho biết áo khoác, tay thuận và cỡ giày để đối chiếu với dấu vết tên trộm. */
export const GARAGE_STORY: StorySceneDef = {
  sceneId: "garage",
  sceneNpcEntries: tiger.entries,
  spots: [
    { id: "tiger_coat", clue: "tiger_coat", label: "Áo khoác của Hổ", sprite: "coat", x: 14, y: 86, w: 6, when: { all: ["met:tiger"] }, stand: { x: 20, y: 92 } },
    { id: "tiger_hand", clue: "tiger_hand", label: "Sổ ghi của Hổ", sprite: "note", x: 68, y: 92, w: 5, when: { all: ["met:tiger"] }, stand: { x: 68, y: 95 } },
    { id: "tiger_shoe", clue: "tiger_shoe", label: "Giày của Hổ", sprite: "slippers", x: 24, y: 80, w: 5, when: { all: ["met:tiger"] }, stand: { x: 24, y: 90 } },
  ],
  dialogues: tiger.nodes,
};
