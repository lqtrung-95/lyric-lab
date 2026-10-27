import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const cat = buildInterview({
  prefix: "cat", speaker: "cat",
  greeting: { zh: "你好!要买水果吗?", vi: "Chào bạn! Bạn muốn mua trái cây à?" },
  question: { zh: "昨天下午你去买东西了吗?", vi: "Chiều qua bạn có đi mua đồ không?" },
  chatter: [
    { ask: { zh: "你买了什么?", vi: "Bạn mua gì thế?" }, reply: { zh: "你自己看看我的购物袋吧。", vi: "Bạn tự xem túi đồ của tôi đi." } },
  ],
  answer: { zh: "昨天下午我去买东西了。", vi: "Chiều qua tôi đi mua đồ." },
  check: { vi: "Cô Mèo nói chiều qua mình đã làm gì?", right: { zh: "去买东西", vi: "Đi mua đồ" }, wrong: [{ zh: "去看电影", vi: "Đi xem phim" }, { zh: "去修车", vi: "Đi sửa xe" }], rightAt: 0 },
  clue: "cat_talk", metFlag: "met:cat",
  closing: { zh: "购物袋在桌上。", vi: "Túi đồ ở trên bàn." },
  after: { zh: "还想看什么?", vi: "Bạn còn muốn xem gì không?" },
});

/** Chợ: túi đồ của Mèo (nước ép chứ không phải sữa). */
export const MARKET_STORY: StorySceneDef = {
  sceneId: "market",
  sceneNpcEntries: [
    ...cat.entries,
  ],
  spots: [
    { id: "bag_cat", clue: "bag_cat", label: "Túi đồ của Mèo", sprite: "bag", x: 14, y: 86, w: 5, when: { all: ["met:cat"] }, stand: { x: 20, y: 92 } },
  ],
  dialogues: {
    ...cat.nodes,
  },
};
