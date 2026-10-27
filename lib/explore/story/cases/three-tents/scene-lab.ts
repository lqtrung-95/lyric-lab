import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const owl = buildInterview({
  prefix: "owl", speaker: "owl",
  greeting: { zh: "你好!小心,别碰桌子上的试管。", vi: "Chào bạn! Cẩn thận, đừng đụng vào ống nghiệm trên bàn." },
  question: { zh: "你的帐篷是什么颜色的?", vi: "Lều của cụ màu gì?" },
  chatter: [
    { ask: { zh: "你昨天晚上在做什么?", vi: "Tối qua cụ làm gì?" }, reply: { zh: "我在帐篷里看书。", vi: "Tôi đọc sách trong lều." } },
    { ask: { zh: "你喜欢露营吗?", vi: "Cụ có thích cắm trại không?" }, reply: { zh: "喜欢,可以看星星。", vi: "Thích, được ngắm sao." } },
  ],
  answer: { zh: "我的帐篷不是红色的。", vi: "Lều của tôi không phải màu đỏ." },
  check: { vi: "Cụ Cú nói lều của cụ thế nào?", right: { zh: "不是红色的", vi: "Không phải màu đỏ" }, wrong: [{ zh: "是红色的", vi: "Màu đỏ" }, { zh: "是蓝色的", vi: "Màu xanh dương" }], rightAt: 0 },
  clue: "owl_tent", metFlag: "met:owl",
  closing: { zh: "帐篷旁边的地上有一个脚印,你可以看看。", vi: "Dưới đất cạnh lều có một dấu chân, bạn có thể xem." },
  after: { zh: "我说的都是真的。你还有事吗?", vi: "Tôi nói đều là thật. Bạn còn việc gì không?" },
});

/** Phòng thí nghiệm: Cú khai lều không phải màu đỏ; dấu chân cỡ 42 là mồi nhử (ai cũng có thể giẫm lên). */
export const LAB_STORY: StorySceneDef = {
  sceneId: "lab",
  sceneNpcEntries: owl.entries,
  spots: [
    { id: "footprint", clue: "footprint", label: "Dấu chân cạnh lều", sprite: "note", x: 14, y: 86, w: 5, when: { all: ["met:owl"] }, stand: { x: 20, y: 92 } },
  ],
  dialogues: owl.nodes,
};
