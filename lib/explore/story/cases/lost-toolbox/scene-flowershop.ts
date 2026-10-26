import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const cat = buildInterview({
  prefix: "cat", speaker: "cat",
  greeting: { zh: "你好!欢迎光临。", vi: "Chào bạn! Hoan nghênh quý khách." },
  question: { zh: "昨天下午四点你在哪儿?", vi: "Bốn giờ chiều hôm qua cô ở đâu?" },
  chatter: [
    { ask: { zh: "你的店卖什么花?", vi: "Tiệm cô bán hoa gì?" }, reply: { zh: "玫瑰、百合,还有向日葵。", vi: "Hoa hồng, hoa bách hợp và cả hoa hướng dương." } },
    { ask: { zh: "你每天几点开门?", vi: "Hằng ngày cô mở cửa lúc mấy giờ?" }, reply: { zh: "早上九点。", vi: "Chín giờ sáng." } },
  ],
  answer: { zh: "昨天下午四点,我在店里包花。", vi: "Bốn giờ chiều hôm qua, tôi đang gói hoa trong tiệm." },
  check: { vi: "Cô Mèo nói bốn giờ chiều hôm qua cô làm gì?", right: { zh: "包花", vi: "Gói hoa" }, wrong: [{ zh: "修车", vi: "Sửa xe" }, { zh: "喂动物", vi: "Cho động vật ăn" }] },
  clue: "cat_alibi", metFlag: "met:cat",
  closing: { zh: "桌子上有一张单子,你可以看看。", vi: "Trên bàn có một tờ đơn, bạn có thể xem." },
  after: { zh: "单子在桌子上。你还有事吗?", vi: "Tờ đơn ở trên bàn. Bạn còn việc gì không?" },
});

/** Cảnh flowershop của vụ án lost-toolbox (xem chú thích ở index.ts của vụ án). */
export const FLOWERSHOP_STORY: StorySceneDef = {
  sceneId: "flowershop",
  sceneNpcEntries: cat.entries,
  spots: [
    { id: "flower_order", clue: "flower_order", label: "Đơn đặt hoa trên bàn", sprite: "note", x: 14, y: 86, w: 5, when: { all: ["met:cat"] }, stand: { x: 20, y: 92 } },
  ],
  dialogues: cat.nodes,
};
