import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const dog = buildInterview({
  prefix: "dog", speaker: "dog",
  greeting: { zh: "欢迎!想买什么?", vi: "Chào mừng! Bạn muốn mua gì?" },
  question: { zh: "昨天中午十二点你在哪儿?", vi: "Mười hai giờ trưa qua bạn ở đâu?" },
  chatter: [
    { ask: { zh: "这件衣服多少钱?", vi: "Cái áo này bao nhiêu tiền?" }, reply: { zh: "一百块。", vi: "Một trăm tệ." } },
    { ask: { zh: "你喜欢什么颜色?", vi: "Ông thích màu gì?" }, reply: { zh: "我喜欢蓝色。", vi: "Tôi thích màu xanh." } },
  ],
  answer: { zh: "昨天中午十二点,我在店里卖衣服。", vi: "Trưa qua mười hai giờ, tôi bán quần áo ở cửa hàng." },
  check: { vi: "Chú Chó nói trưa qua 12 giờ ông ở đâu?", right: { zh: "在店里", vi: "Ở cửa hàng" }, wrong: [{ zh: "在海边", vi: "Ở bãi biển" }, { zh: "在公园", vi: "Ở công viên" }], rightAt: 0 },
  clue: "dog_alibi", metFlag: "met:dog",
  closing: { zh: "我的脚印在门口,你可以看看。", vi: "Dấu chân của tôi ở cửa, bạn có thể xem." },
  after: { zh: "你还想买什么?", vi: "Bạn còn muốn mua gì nữa?" },
});

/** Cửa hàng quần áo: dấu chân Chó có vết móng dài nên không khớp dấu trên cát (loại trừ). */
export const CLOTHING_STORE_STORY: StorySceneDef = {
  sceneId: "clothing-store",
  sceneNpcEntries: dog.entries,
  spots: [
    { id: "dog_print", clue: "dog_print", label: "Dấu chân ở cửa", sprite: "note", x: 40, y: 76, w: 4, when: { all: ["met:dog"] } },
  ],
  dialogues: dog.nodes,
};
