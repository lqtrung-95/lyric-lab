import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const fox = buildInterview({
  prefix: "fox", speaker: "fox",
  greeting: { zh: "你好!欢迎来动物园。", vi: "Chào bạn! Chào mừng đến sở thú." },
  question: { zh: "昨天下午四点你在哪儿?", vi: "Bốn giờ chiều hôm qua cô ở đâu?" },
  chatter: [
    { ask: { zh: "你最喜欢哪个动物?", vi: "Cô thích con vật nào nhất?" }, reply: { zh: "我最喜欢熊猫。", vi: "Tôi thích nhất gấu trúc." } },
    { ask: { zh: "动物们吃什么?", vi: "Các con vật ăn gì?" }, reply: { zh: "有的吃肉,有的吃草。", vi: "Con ăn thịt, con ăn cỏ." } },
  ],
  answer: { zh: "昨天下午四点,我在动物园喂动物。", vi: "Bốn giờ chiều hôm qua, tôi đang cho động vật ăn ở sở thú." },
  check: { vi: "Cô Cáo nói bốn giờ chiều hôm qua cô làm gì?", right: { zh: "喂动物", vi: "Cho động vật ăn" }, wrong: [{ zh: "包花", vi: "Gói hoa" }, { zh: "做奶茶", vi: "Pha trà sữa" }], rightAt: 0 },
  clue: "fox_alibi", metFlag: "met:fox",
  closing: { zh: "门口有一本记录,你可以看看。", vi: "Ở cửa có một cuốn sổ ghi, bạn có thể xem." },
  after: { zh: "记录在门口。你还有事吗?", vi: "Sổ ghi ở cửa. Bạn còn việc gì không?" },
});

/** Cảnh zoo của vụ án lost-toolbox (xem chú thích ở index.ts của vụ án). */
export const ZOO_STORY: StorySceneDef = {
  sceneId: "zoo",
  sceneNpcEntries: fox.entries,
  spots: [
    { id: "feed_log", clue: "feed_log", label: "Sổ cho ăn ở cửa", sprite: "note", x: 14, y: 86, w: 5, when: { all: ["met:fox"] }, stand: { x: 20, y: 92 } },
  ],
  dialogues: fox.nodes,
};
