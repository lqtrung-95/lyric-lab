import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const turtle = buildInterview({
  prefix: "turtle", speaker: "turtle",
  gate: { all: ["met:fox", "clue:feed_log", "clue:petals"] },
  greeting: { zh: "你好,年轻人。欢迎来吃火锅。", vi: "Chào chàng trai. Mời đến ăn lẩu." },
  question: { zh: "昨天下午三点你看见什么了?", vi: "Ba giờ chiều hôm qua ông đã thấy gì?" },
  chatter: [
    { ask: { zh: "你的店几点关门?", vi: "Quán ông mấy giờ đóng cửa?" }, reply: { zh: "十点关门。", vi: "Mười giờ đóng cửa." } },
  ],
  answer: { zh: "昨天下午三点,我在火锅店看见一只狐狸。她手里有一束花。", vi: "Ba giờ chiều hôm qua, tôi thấy một con cáo trong quán lẩu. Trong tay cô ấy có một bó hoa." },
  check: { vi: "Ông Rùa đã nhìn thấy con vật nào?", right: { zh: "狐狸", vi: "Con cáo" }, wrong: [{ zh: "兔子", vi: "Con thỏ" }, { zh: "老虎", vi: "Con hổ" }], rightAt: 0 },
  clue: "witness", metFlag: "met:turtle",
  closing: { zh: "她走得很快,也没有吃火锅。", vi: "Cô ấy đi rất nhanh, cũng chẳng ăn lẩu." },
  after: { zh: "我老了,但是我记得很清楚。", vi: "Tôi già rồi, nhưng tôi nhớ rất rõ." },
});

/** Quán lẩu: Ông Rùa là nhân chứng, chỉ chịu nói khi bạn đã biết chuyện ở sở thú (chưa đủ thì ông ngủ gật). */
export const HOTPOT_STORY: StorySceneDef = {
  sceneId: "hotpot",
  sceneNpcEntries: [...turtle.entries, { node: "turtle_idle" }],
  dialogues: {
    ...turtle.nodes,
    turtle_idle: { id: "turtle_idle", speaker: "turtle", zh: "Zzz……", vi: "(Ông Rùa đang ngủ gật. Có lẽ bạn nên tìm hiểu thêm ở sở thú rồi hãy quay lại.)", next: null },
  },
};
