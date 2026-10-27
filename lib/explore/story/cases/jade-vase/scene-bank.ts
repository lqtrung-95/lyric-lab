import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const fox = buildInterview({
  prefix: "fox", speaker: "fox",
  greeting: { zh: "你好!请问办什么业务?", vi: "Chào bạn! Bạn cần làm giao dịch gì?" },
  question: { zh: "今天下午三点到三点半你在哪儿?", vi: "Chiều nay từ 3 đến 3 rưỡi cô ở đâu?" },
  chatter: [
    { ask: { zh: "银行几点关门?", vi: "Ngân hàng mấy giờ đóng cửa?" }, reply: { zh: "下午五点关门。", vi: "Năm giờ chiều đóng cửa." } },
    { ask: { zh: "你每天都很忙吗?", vi: "Cô ngày nào cũng bận à?" }, reply: { zh: "是的,客人很多。", vi: "Ừ, khách rất đông." } },
  ],
  answer: { zh: "三点到三点半,我在银行上班。", vi: "Từ 3 đến 3 rưỡi, tôi làm việc ở ngân hàng." },
  check: { vi: "Cô Cáo nói lúc 3 giờ cô ở đâu?", right: { zh: "在银行", vi: "Ở ngân hàng" }, wrong: [{ zh: "在电影院", vi: "Ở rạp phim" }, { zh: "在洗衣店", vi: "Ở tiệm giặt" }], rightAt: 0 },
  clue: "fox_alibi", metFlag: "met:fox",
  closing: { zh: "交易记录在桌上。", vi: "Sổ giao dịch ở trên bàn." },
  after: { zh: "还需要办理什么吗?", vi: "Bạn còn cần làm gì nữa không?" },
});

/** Ngân hàng: sổ giao dịch có chữ ký của mười khách nên Cáo có chứng cứ ngoại phạm thật. */
export const BANK_STORY: StorySceneDef = {
  sceneId: "bank",
  sceneNpcEntries: [
    ...fox.entries,
  ],
  spots: [
    { id: "bank_log", clue: "bank_log", label: "Sổ giao dịch", sprite: "clipboard", x: 14, y: 86, w: 5, when: { all: ["met:fox"] }, stand: { x: 20, y: 92 } },
  ],
  dialogues: {
    ...fox.nodes,
  },
};
