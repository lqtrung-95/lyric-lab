import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const duck = buildInterview({
  prefix: "duck", speaker: "duck",
  greeting: { zh: "欢迎入住!", vi: "Chào mừng quý khách!" },
  question: { zh: "昨天下午你去买东西了吗?", vi: "Chiều qua bạn có đi mua đồ không?" },
  chatter: [
    { ask: { zh: "你买了什么?", vi: "Bạn mua gì thế?" }, reply: { zh: "你自己看看我的购物袋吧。", vi: "Bạn tự xem túi đồ của tôi đi." } },
  ],
  answer: { zh: "昨天下午我去买东西了。", vi: "Chiều qua tôi đi mua đồ." },
  check: { vi: "Chú Vịt nói chiều qua mình đã làm gì?", right: { zh: "去买东西", vi: "Đi mua đồ" }, wrong: [{ zh: "去看电影", vi: "Đi xem phim" }, { zh: "去修车", vi: "Đi sửa xe" }], rightAt: 0 },
  clue: "duck_talk", metFlag: "met:duck",
  closing: { zh: "购物袋在桌上。", vi: "Túi đồ ở trên bàn." },
  after: { zh: "还想看什么?", vi: "Bạn còn muốn xem gì không?" },
});

/** Khách sạn: túi đồ của Vịt (hai con cá chứ không phải một). */
export const HOTEL_STORY: StorySceneDef = {
  sceneId: "hotel",
  sceneNpcEntries: [
    ...duck.entries,
  ],
  spots: [
    { id: "bag_duck", clue: "bag_duck", label: "Túi đồ của Vịt", sprite: "bag", x: 14, y: 86, w: 5, when: { all: ["met:duck"] }, stand: { x: 20, y: 92 } },
  ],
  dialogues: {
    ...duck.nodes,
  },
};
