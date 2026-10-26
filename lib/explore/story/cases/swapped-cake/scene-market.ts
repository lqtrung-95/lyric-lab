import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const cat = buildInterview({
  prefix: "cat", speaker: "cat",
  greeting: { zh: "你好!要买水果吗?", vi: "Chào bạn! Bạn muốn mua trái cây không?" },
  question: { zh: "昨天下午两点到两点半你在哪儿?", vi: "Hai giờ đến hai giờ rưỡi chiều qua cô ở đâu?" },
  chatter: [
    { ask: { zh: "这个多少钱?", vi: "Cái này bao nhiêu tiền?" }, reply: { zh: "五块钱。", vi: "Năm tệ." } },
    { ask: { zh: "你卖盐吗?", vi: "Cô có bán muối không?" }, reply: { zh: "卖,一块钱一袋。", vi: "Có, một tệ một túi." } },
  ],
  answer: { zh: "昨天下午两点到两点半,我在市场卖水果。", vi: "Chiều qua từ hai giờ đến hai giờ rưỡi, tôi bán trái cây ở chợ." },
  check: { vi: "Cô Mèo nói chiều qua lúc 2 giờ đến 2 giờ rưỡi cô ở đâu?", right: { zh: "在市场", vi: "Ở chợ" }, wrong: [{ zh: "在厨房", vi: "Ở nhà bếp" }, { zh: "在学校", vi: "Ở trường" }], rightAt: 0 },
  clue: "cat_alibi", metFlag: "met:cat",
  closing: { zh: "我的本子都在墙上,你可以看看。", vi: "Các sổ của tôi ở trên tường, bạn có thể xem." },
  after: { zh: "本子在墙上。还要买水果吗?", vi: "Các sổ ở trên tường. Bạn còn muốn mua trái cây không?" },
});

/** Chợ: sổ bán hàng xác nhận Mèo ở sạp (loại trừ), sổ bán muối cho thấy người mua dùng phiếu giảm giá vé tàu. */
export const MARKET_STORY: StorySceneDef = {
  sceneId: "market",
  sceneNpcEntries: cat.entries,
  spots: [
    { id: "price_note", clue: "price_note", label: "Sổ bán hàng", sprite: "note", x: 14, y: 31, w: 4.5, when: { all: ["met:cat"] }, stand: { x: 14, y: 46 } },
    { id: "salt_buyer", clue: "salt_buyer", label: "Sổ bán muối", sprite: "clipboard", x: 50, y: 31, w: 5, when: { all: ["met:cat"] }, stand: { x: 50, y: 46 } },
  ],
  dialogues: cat.nodes,
};
