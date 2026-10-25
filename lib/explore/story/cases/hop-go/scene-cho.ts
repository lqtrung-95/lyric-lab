import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const cat = buildInterview({
  prefix: "cat", speaker: "cat",
  greeting: { zh: "你好!要买水果吗?", vi: "Chào bạn! Bạn muốn mua trái cây không?" },
  question: { zh: "昨天下午三点你在哪儿?", vi: "Ba giờ chiều hôm qua cô ở đâu?" },
  chatter: [
    { ask: { zh: "这个多少钱?", vi: "Cái này bao nhiêu tiền?" }, reply: { zh: "五块钱。", vi: "Năm tệ." } },
    { ask: { zh: "你的水果新鲜吗?", vi: "Trái cây của cô tươi không?" }, reply: { zh: "很新鲜!今天早上买的。", vi: "Rất tươi! Mua sáng nay." } },
  ],
  answer: { zh: "昨天下午三点,我在市场卖水果。", vi: "Ba giờ chiều hôm qua, tôi đang bán trái cây ở chợ." },
  check: { vi: "Cô Mèo nói ba giờ chiều hôm qua cô đang làm gì?", right: { zh: "在卖水果", vi: "Đang bán trái cây" }, wrong: [{ zh: "在睡觉", vi: "Đang ngủ" }, { zh: "在做饭", vi: "Đang nấu cơm" }], rightAt: 2 },
  clue: "cat_alibi", metFlag: "met:cat",
  closing: { zh: "我的摊子上有一张纸,你看看吧。", vi: "Trên sạp của tôi có một tờ giấy, bạn xem thử nhé." },
  after: { zh: "纸在摊子上。还要买水果吗?", vi: "Tờ giấy ở trên sạp. Bạn còn muốn mua trái cây không?" },
});

/** Chợ: Cô Mèo khai bán trái cây; tờ giấy ghi giá cho thấy nhiều người nhìn thấy cô ở sạp lúc ba giờ. */
export const CHO_STORY: StorySceneDef = {
  sceneId: "cho",
  sceneNpcEntries: cat.entries,
  spots: [{ id: "price_note", clue: "price_note", label: "Tờ giấy ghi giá", sprite: "note", x: 14, y: 29, w: 5, when: { all: ["met:cat"] }, stand: { x: 14, y: 42 } }],
  dialogues: cat.nodes,
};
