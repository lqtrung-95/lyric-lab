import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const bird = buildInterview({
  prefix: "bird", speaker: "bird",
  greeting: { zh: "你好!欢迎来农场。", vi: "Chào bạn! Chào mừng đến nông trại." },
  question: { zh: "昨天晚上八点你在哪儿?", vi: "Tám giờ tối qua bạn ở đâu?" },
  chatter: [
    { ask: { zh: "你认识那个小偷吗?", vi: "Bạn có biết tên trộm không?" }, reply: { zh: "我不认识。", vi: "Tôi không biết." } },
    { ask: { zh: "你喜欢玩具吗?", vi: "Bạn có thích đồ chơi không?" }, reply: { zh: "喜欢,但是我很少买。", vi: "Thích, nhưng tôi ít khi mua." } },
  ],
  answer: { zh: "昨天晚上八点,我不在玩具店,我在农场。", vi: "Tám giờ tối qua, tôi không ở cửa hàng đồ chơi, tôi ở nông trại." },
  check: { vi: "Chim nói tám giờ tối qua mình ở đâu?", right: { zh: "在农场", vi: "Ở nông trại" }, wrong: [{ zh: "在玩具店", vi: "Ở cửa hàng đồ chơi" }, { zh: "在摩天轮上", vi: "Trên vòng quay" }], rightAt: 0 },
  clue: "bird_alibi", metFlag: "met:bird",
  closing: { zh: "你可以看看我的东西。", vi: "Bạn có thể xem đồ của tôi." },
  after: { zh: "我已经说完了。你还有事吗?", vi: "Tôi nói xong rồi. Bạn còn việc gì không?" },
});

/** Cảnh của Chim: khai không ở cửa hàng đồ chơi lúc tám giờ (không ai kiểm chứng được); ba đồ vật cho biết áo khoác, tay thuận và cỡ giày để đối chiếu với dấu vết tên trộm. */
export const FARM_STORY: StorySceneDef = {
  sceneId: "farm",
  sceneNpcEntries: bird.entries,
  spots: [
    { id: "bird_coat", clue: "bird_coat", label: "Áo khoác của Chim", sprite: "coat", x: 14, y: 86, w: 6, when: { all: ["met:bird"] }, stand: { x: 20, y: 92 } },
    { id: "bird_hand", clue: "bird_hand", label: "Sổ ghi của Chim", sprite: "note", x: 68, y: 92, w: 5, when: { all: ["met:bird"] }, stand: { x: 68, y: 95 } },
    { id: "bird_shoe", clue: "bird_shoe", label: "Giày của Chim", sprite: "slippers", x: 24, y: 80, w: 5, when: { all: ["met:bird"] }, stand: { x: 24, y: 90 } },
  ],
  dialogues: bird.nodes,
};
