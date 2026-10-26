import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const pig = buildInterview({
  prefix: "pig", speaker: "pig",
  greeting: { zh: "你好!欢迎光临!", vi: "Chào bạn! Hoan nghênh quý khách!" },
  question: { zh: "昨天下午三点你在哪儿?", vi: "Ba giờ chiều qua cô ở đâu?" },
  chatter: [
    { ask: { zh: "这个多少钱?", vi: "Cái này bao nhiêu tiền?" }, reply: { zh: "十块钱。", vi: "Mười tệ." } },
    { ask: { zh: "牛奶新鲜吗?", vi: "Sữa có tươi không?" }, reply: { zh: "很新鲜!", vi: "Rất tươi!" } },
  ],
  answer: { zh: "昨天下午三点,我在超市收钱。", vi: "Ba giờ chiều qua, tôi thu tiền ở siêu thị." },
  check: { vi: "Cô Heo nói ba giờ chiều qua cô ở đâu?", right: { zh: "在超市", vi: "Ở siêu thị" }, wrong: [{ zh: "在海边", vi: "Ở bãi biển" }, { zh: "在图书馆", vi: "Ở thư viện" }], rightAt: 2 },
  clue: "pig_alibi", metFlag: "met:pig",
  closing: { zh: "我的发票在墙上。", vi: "Hóa đơn của tôi ở trên tường." },
  after: { zh: "发票在墙上。还要买东西吗?", vi: "Hóa đơn ở trên tường. Bạn còn muốn mua gì không?" },
});

/** Siêu thị: hóa đơn xác nhận Heo ở quầy thu ngân lúc ba giờ. */
export const SUPERMARKET_STORY: StorySceneDef = {
  sceneId: "supermarket",
  sceneNpcEntries: pig.entries,
  spots: [{ id: "receipt", clue: "receipt", label: "Hóa đơn siêu thị", sprite: "note", x: 60, y: 88, w: 4.5, when: { all: ["met:pig"] }, stand: { x: 60, y: 95 } }],
  dialogues: pig.nodes,
};
