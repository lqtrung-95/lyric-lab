import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const turtle = buildInterview({
  prefix: "turtle", speaker: "turtle",
  greeting: { zh: "你好,年轻人。欢迎来吃火锅。", vi: "Chào chàng trai. Mời đến ăn lẩu." },
  question: { zh: "昨天下午六点你在哪儿?", vi: "Sáu giờ chiều hôm qua ông ở đâu?" },
  chatter: [
    { ask: { zh: "你的店几点关门?", vi: "Quán ông mấy giờ đóng cửa?" }, reply: { zh: "十点关门。", vi: "Mười giờ đóng cửa." } },
    { ask: { zh: "什么汤最好喝?", vi: "Nước lẩu nào ngon nhất?" }, reply: { zh: "番茄汤最受欢迎。", vi: "Nước lẩu cà chua được ưa chuộng nhất." } },
  ],
  answer: { zh: "昨天下午六点,我在火锅店里招待客人。", vi: "Sáu giờ chiều hôm qua, tôi đang tiếp khách ở quán lẩu." },
  check: { vi: "Ông Rùa nói sáu giờ chiều hôm qua ông đang làm gì?", right: { zh: "招待客人", vi: "Tiếp khách" }, wrong: [{ zh: "卖手机", vi: "Bán điện thoại" }, { zh: "睡觉", vi: "Ngủ" }], rightAt: 0 },
  clue: "turtle_alibi", metFlag: "met:turtle",
  closing: { zh: "订单本在墙上。", vi: "Sổ đơn ở trên tường." },
  after: { zh: "再来一碗汤吗?", vi: "Bạn dùng thêm một bát canh nhé?" },
});

/** Quán lẩu: sổ đơn cho thấy Rùa tiếp khách kín hai tiếng nên cũng có chứng cứ ngoại phạm thật. */
export const HOTPOT_STORY: StorySceneDef = {
  sceneId: "hotpot",
  sceneNpcEntries: turtle.entries,
  spots: [
    { id: "kitchen_log", clue: "kitchen_log", label: "Sổ đơn của quán", sprite: "clipboard", x: 14, y: 86, w: 5, when: { all: ["met:turtle"] }, stand: { x: 20, y: 92 } },
  ],
  dialogues: turtle.nodes,
};
