import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const fox = buildInterview({
  prefix: "fox", speaker: "fox",
  greeting: { zh: "你好!欢迎来动物园。", vi: "Chào bạn! Chào mừng đến sở thú." },
  question: { zh: "昨天下午三点你在哪儿?", vi: "Ba giờ chiều hôm qua cô ở đâu?" },
  chatter: [
    { ask: { zh: "你最喜欢哪个动物?", vi: "Cô thích con vật nào nhất?" }, reply: { zh: "我最喜欢熊猫。", vi: "Tôi thích nhất gấu trúc." } },
    { ask: { zh: "动物们吃什么?", vi: "Các con vật ăn gì?" }, reply: { zh: "有的吃肉,有的吃草。", vi: "Con ăn thịt, con ăn cỏ." } },
  ],
  answer: { zh: "昨天下午三点,我在动物园喂动物。", vi: "Ba giờ chiều hôm qua, tôi đang cho động vật ăn ở sở thú." },
  check: { vi: "Cô Cáo nói ba giờ chiều hôm qua cô làm gì?", right: { zh: "喂动物", vi: "Cho động vật ăn" }, wrong: [{ zh: "包花", vi: "Gói hoa" }, { zh: "做奶茶", vi: "Pha trà sữa" }], rightAt: 0 },
  clue: "fox_alibi", metFlag: "met:fox",
  closing: { zh: "门口有一本记录,笼子旁边也有东西,你可以看看。", vi: "Ở cửa có một cuốn sổ ghi, cạnh lồng cũng có thứ gì đó, bạn có thể xem." },
  after: { zh: "你看到什么了?还有事吗?", vi: "Bạn thấy gì rồi? Còn việc gì không?" },
});

/** Sở thú: Cáo khai đang cho thú ăn, nhưng sổ cho ăn ghi ba giờ không ai cho ăn; cánh hoa hồng rơi cạnh lồng. */
export const ZOO_STORY: StorySceneDef = {
  sceneId: "zoo",
  sceneNpcEntries: fox.entries,
  spots: [
    { id: "feed_log", clue: "feed_log", label: "Sổ cho ăn ở cửa", sprite: "note", x: 14, y: 86, w: 5, when: { all: ["met:fox"] }, stand: { x: 20, y: 92 } },
    { id: "petals", clue: "petals", label: "Cánh hoa cạnh lồng", sprite: "rose", x: 68, y: 92, w: 4, when: { all: ["met:fox", "clue:feed_log"] }, stand: { x: 68, y: 95 } },
  ],
  dialogues: fox.nodes,
};
