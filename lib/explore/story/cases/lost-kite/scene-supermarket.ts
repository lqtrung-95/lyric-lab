import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const pig = buildInterview({
  prefix: "pig", speaker: "pig",
  greeting: { zh: "你好!欢迎光临!", vi: "Chào bạn! Hoan nghênh quý khách!" },
  question: { zh: "昨天中午十二点你在哪儿?", vi: "Mười hai giờ trưa qua bạn ở đâu?" },
  chatter: [
    { ask: { zh: "这个多少钱?", vi: "Cái này bao nhiêu tiền?" }, reply: { zh: "五块钱。", vi: "Năm tệ." } },
    { ask: { zh: "可以用手机付钱吗?", vi: "Có thể trả bằng điện thoại không?" }, reply: { zh: "可以。", vi: "Được." } },
  ],
  answer: { zh: "昨天中午十二点,我在超市收钱。", vi: "Trưa qua mười hai giờ, tôi thu tiền ở siêu thị." },
  check: { vi: "Cô Heo nói trưa qua 12 giờ cô ở đâu?", right: { zh: "在超市", vi: "Ở siêu thị" }, wrong: [{ zh: "在学校", vi: "Ở trường" }, { zh: "在市场", vi: "Ở chợ" }], rightAt: 1 },
  clue: "pig_alibi", metFlag: "met:pig",
  closing: { zh: "我的脚印在地上,你可以看看。", vi: "Dấu chân của tôi ở trên sàn, bạn có thể xem." },
  after: { zh: "还要买东西吗?", vi: "Bạn còn muốn mua gì không?" },
});

/** Siêu thị: dấu chân Heo chỉ có hai ngón nên không khớp (loại trừ). */
export const SUPERMARKET_STORY: StorySceneDef = {
  sceneId: "supermarket",
  sceneNpcEntries: pig.entries,
  spots: [
    { id: "pig_print", clue: "pig_print", label: "Dấu chân trên sàn", sprite: "note", x: 60, y: 88, w: 4, when: { all: ["met:pig"] }, stand: { x: 60, y: 95 } },
  ],
  dialogues: pig.nodes,
};
