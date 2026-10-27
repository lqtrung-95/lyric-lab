import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const turtle = buildInterview({
  prefix: "turtle", speaker: "turtle",
  greeting: { zh: "你好,年轻人。欢迎来吃火锅。", vi: "Chào chàng trai. Mời đến ăn lẩu." },
  question: { zh: "昨天下午三点到四点你在哪儿?", vi: "Chiều qua từ 3 đến 4 giờ ông ở đâu?" },
  chatter: [
    { ask: { zh: "你的店几点关门?", vi: "Quán ông mấy giờ đóng cửa?" }, reply: { zh: "十点关门。", vi: "Mười giờ đóng cửa." } },
    { ask: { zh: "你走路快吗?", vi: "Ông đi bộ có nhanh không?" }, reply: { zh: "我是乌龟,走得很慢。", vi: "Tôi là rùa, đi rất chậm." } },
  ],
  answer: { zh: "昨天下午三点到四点,我一直在火锅店里忙。", vi: "Chiều qua từ 3 đến 4 giờ, tôi bận ở quán lẩu suốt." },
  check: { vi: "Ông Rùa nói chiều qua từ 3 đến 4 giờ ông ở đâu?", right: { zh: "在火锅店里", vi: "Trong quán lẩu" }, wrong: [{ zh: "在修车店", vi: "Ở tiệm sửa xe" }, { zh: "在花店里", vi: "Trong tiệm hoa" }], rightAt: 0 },
  clue: "turtle_alibi", metFlag: "met:turtle",
  closing: { zh: "订单本在柜台上。", vi: "Sổ đơn ở trên quầy." },
  after: { zh: "再来一碗汤吗?", vi: "Bạn dùng thêm một bát canh nhé?" },
});

/** Quán lẩu: hai lần bưng món cách nhau 20 phút, ít hơn 40 phút khứ hồi nên Rùa không kịp. */
export const HOTPOT_STORY: StorySceneDef = {
  sceneId: "hotpot",
  sceneNpcEntries: turtle.entries,
  spots: [
    { id: "hotpot_log", clue: "hotpot_log", label: "Sổ đơn quán lẩu", sprite: "clipboard", x: 14, y: 86, w: 5, when: { all: ["met:turtle"] }, stand: { x: 20, y: 92 } },
  ],
  dialogues: turtle.nodes,
};
