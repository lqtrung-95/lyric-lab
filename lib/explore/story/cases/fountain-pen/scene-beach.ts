import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const duck = buildInterview({
  prefix: "duck", speaker: "duck",
  greeting: { zh: "你好!今天海边很热!", vi: "Chào bạn! Hôm nay biển rất nóng!" },
  question: { zh: "昨天下午三点你在哪儿?", vi: "Ba giờ chiều qua anh ở đâu?" },
  chatter: [
    { ask: { zh: "你会游泳吗?", vi: "Anh biết bơi không?" }, reply: { zh: "当然会,我是鸭子!", vi: "Dĩ nhiên, tôi là vịt mà!" } },
    { ask: { zh: "海水凉吗?", vi: "Nước biển có mát không?" }, reply: { zh: "不凉,很暖。", vi: "Không, rất ấm." } },
  ],
  answer: { zh: "昨天下午三点,我在海边工作。", vi: "Ba giờ chiều qua, tôi làm việc ở bãi biển." },
  check: { vi: "Chú Vịt nói ba giờ chiều qua anh ở đâu?", right: { zh: "在海边", vi: "Ở bãi biển" }, wrong: [{ zh: "在办公室", vi: "Ở văn phòng" }, { zh: "在超市", vi: "Ở siêu thị" }], rightAt: 1 },
  clue: "duck_alibi", metFlag: "met:duck",
  closing: { zh: "我的值班本在沙滩上。", vi: "Sổ trực của tôi ở trên bãi cát." },
  after: { zh: "值班本在沙滩上。你还要去哪儿?", vi: "Sổ trực ở trên bãi cát. Bạn còn muốn đi đâu?" },
});

/** Bãi biển: sổ trực cho thấy Vịt rời bãi biển lúc hai giờ rưỡi (trái lời khai, nhưng chưa phải bằng chứng lấy bút); cát ở đây là cát vàng thô. */
export const BEACH_STORY: StorySceneDef = {
  sceneId: "beach",
  sceneNpcEntries: duck.entries,
  spots: [
    { id: "beach_log", clue: "beach_log", label: "Sổ trực của bãi biển", sprite: "clipboard", x: 48, y: 92, w: 5, when: { all: ["met:duck"] } },
    { id: "beach_sand", clue: "beach_sand", label: "Nắm cát trên bãi", sprite: "bag", x: 20, y: 90, w: 4, when: { all: ["met:duck"] } },
  ],
  dialogues: duck.nodes,
};
