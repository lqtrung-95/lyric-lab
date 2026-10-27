import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const cat = buildInterview({
  prefix: "cat", speaker: "cat",
  greeting: { zh: "你好!要买花吗?", vi: "Chào bạn! Bạn muốn mua hoa à?" },
  question: { zh: "昨天下午三点到四点你在哪儿?", vi: "Chiều qua từ 3 đến 4 giờ cô ở đâu?" },
  chatter: [
    { ask: { zh: "玫瑰花怎么卖?", vi: "Hoa hồng bán thế nào?" }, reply: { zh: "十块钱一朵。", vi: "Mười tệ một bông." } },
    { ask: { zh: "你的店几点关门?", vi: "Tiệm cô mấy giờ đóng cửa?" }, reply: { zh: "晚上七点关门。", vi: "Bảy giờ tối đóng cửa." } },
  ],
  answer: { zh: "昨天下午三点到四点,我一直在花店里。", vi: "Chiều qua từ 3 đến 4 giờ, tôi ở trong tiệm hoa suốt." },
  check: { vi: "Cô Mèo nói chiều qua từ 3 đến 4 giờ cô ở đâu?", right: { zh: "在花店里", vi: "Trong tiệm hoa" }, wrong: [{ zh: "在动物园", vi: "Ở sở thú" }, { zh: "在火锅店", vi: "Ở quán lẩu" }], rightAt: 0 },
  clue: "cat_alibi", metFlag: "met:cat",
  closing: { zh: "签收单在柜台上。", vi: "Phiếu ký nhận ở trên quầy." },
  after: { zh: "还想买花吗?", vi: "Bạn còn muốn mua hoa không?" },
});

/** Tiệm hoa: phiếu ký nhận bốn lần, cách nhau 15 phút nên Mèo không kịp đi về (cần ít nhất 20 phút). */
export const FLOWERSHOP_STORY: StorySceneDef = {
  sceneId: "flowershop",
  sceneNpcEntries: cat.entries,
  spots: [
    { id: "flower_orders", clue: "flower_orders", label: "Phiếu ký nhận", sprite: "note", x: 14, y: 86, w: 5, when: { all: ["met:cat"] }, stand: { x: 20, y: 92 } },
  ],
  dialogues: cat.nodes,
};
