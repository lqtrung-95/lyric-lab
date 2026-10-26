import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const dog = buildInterview({
  prefix: "dog", speaker: "dog",
  greeting: { zh: "你好!欢迎来游乐场。", vi: "Chào bạn! Chào mừng đến công viên giải trí." },
  question: { zh: "昨天晚上八点你在哪儿?", vi: "Tám giờ tối qua bạn ở đâu?" },
  chatter: [
    { ask: { zh: "你认识那个小偷吗?", vi: "Bạn có biết tên trộm không?" }, reply: { zh: "我不认识。", vi: "Tôi không biết." } },
    { ask: { zh: "你喜欢玩具吗?", vi: "Bạn có thích đồ chơi không?" }, reply: { zh: "喜欢,但是我很少买。", vi: "Thích, nhưng tôi ít khi mua." } },
  ],
  answer: { zh: "昨天晚上八点,我不在玩具店,我在游乐场。", vi: "Tám giờ tối qua, tôi không ở cửa hàng đồ chơi, tôi ở công viên giải trí." },
  check: { vi: "Chó nói tám giờ tối qua mình ở đâu?", right: { zh: "在游乐场", vi: "Ở công viên giải trí" }, wrong: [{ zh: "在玩具店", vi: "Ở cửa hàng đồ chơi" }, { zh: "在洗衣店", vi: "Ở tiệm giặt" }], rightAt: 0 },
  clue: "dog_alibi", metFlag: "met:dog",
  closing: { zh: "你可以看看我的东西。", vi: "Bạn có thể xem đồ của tôi." },
  after: { zh: "我已经说完了。你还有事吗?", vi: "Tôi nói xong rồi. Bạn còn việc gì không?" },
});

/** Cảnh của Chó: khai không ở cửa hàng đồ chơi lúc tám giờ (không ai kiểm chứng được); ba đồ vật cho biết áo khoác, tay thuận và cỡ giày để đối chiếu với dấu vết tên trộm. */
export const FUNFAIR_STORY: StorySceneDef = {
  sceneId: "funfair",
  sceneNpcEntries: dog.entries,
  spots: [
    { id: "dog_coat", clue: "dog_coat", label: "Áo khoác của Chó", sprite: "coat", x: 14, y: 86, w: 6, when: { all: ["met:dog"] }, stand: { x: 20, y: 92 } },
    { id: "dog_hand", clue: "dog_hand", label: "Sổ ghi của Chó", sprite: "note", x: 68, y: 92, w: 5, when: { all: ["met:dog"] }, stand: { x: 68, y: 95 } },
    { id: "dog_shoe", clue: "dog_shoe", label: "Giày của Chó", sprite: "slippers", x: 24, y: 80, w: 5, when: { all: ["met:dog"] }, stand: { x: 24, y: 90 } },
  ],
  dialogues: dog.nodes,
};
