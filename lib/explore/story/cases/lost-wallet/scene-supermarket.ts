import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const pig = buildInterview({
  prefix: "pig", speaker: "pig",
  greeting: { zh: "你好!欢迎光临!", vi: "Chào bạn! Hoan nghênh quý khách!" },
  question: { zh: "昨天下午两点到两点二十你在哪儿?", vi: "Chiều qua từ 2 giờ đến 2 giờ 20 cô ở đâu?" },
  chatter: [
    { ask: { zh: "这个多少钱?", vi: "Cái này bao nhiêu tiền?" }, reply: { zh: "十块钱。", vi: "Mười tệ." } },
    { ask: { zh: "可以刷卡吗?", vi: "Có thể quẹt thẻ không?" }, reply: { zh: "可以。", vi: "Được." } },
  ],
  answer: { zh: "昨天下午两点到两点二十,我在超市收钱。", vi: "Chiều qua từ 2 giờ đến 2 giờ 20, tôi thu tiền ở siêu thị." },
  check: { vi: "Cô Heo nói chiều qua lúc 2 giờ cô ở đâu?", right: { zh: "在超市", vi: "Ở siêu thị" }, wrong: [{ zh: "在理发店", vi: "Ở hiệu tóc" }, { zh: "在银行", vi: "Ở ngân hàng" }], rightAt: 2 },
  clue: "pig_alibi", metFlag: "met:pig",
  closing: { zh: "我的小票在地上。", vi: "Hóa đơn của tôi ở dưới sàn." },
  after: { zh: "还要买东西吗?", vi: "Bạn còn muốn mua gì không?" },
});

/** Siêu thị: hóa đơn xác nhận Heo ở quầy thu ngân lúc 2 giờ 10 (loại trừ). */
export const SUPERMARKET_STORY: StorySceneDef = {
  sceneId: "supermarket",
  sceneNpcEntries: pig.entries,
  spots: [
    { id: "pig_receipt", clue: "pig_receipt", label: "Hóa đơn dưới sàn", sprite: "note", x: 60, y: 88, w: 4.5, when: { all: ["met:pig"] }, stand: { x: 60, y: 95 } },
  ],
  dialogues: pig.nodes,
};
