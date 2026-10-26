import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const turtle = buildInterview({
  prefix: "turtle", speaker: "turtle",
  gate: { all: ["met:pig", "clue:closing_sign", "clue:shop_tapes"] },
  greeting: { zh: "你好,年轻人。欢迎来吃火锅。", vi: "Chào chàng trai. Mời đến ăn lẩu." },
  question: { zh: "昨天下午六点你看见什么了?", vi: "Sáu giờ chiều hôm qua ông đã thấy gì?" },
  chatter: [
    { ask: { zh: "你的火锅辣不辣?", vi: "Lẩu của ông có cay không?" }, reply: { zh: "有辣的,也有不辣的。", vi: "Có loại cay, cũng có loại không cay." } },
  ],
  answer: { zh: "昨天下午六点,我在火锅店看见一头猪。他手里有一个包裹。", vi: "Sáu giờ chiều hôm qua, tôi thấy một con heo trong quán lẩu. Trong tay nó có một bưu kiện." },
  check: { vi: "Ông Rùa đã nhìn thấy con vật nào?", right: { zh: "猪", vi: "Con heo" }, wrong: [{ zh: "猫", vi: "Con mèo" }, { zh: "狐狸", vi: "Con cáo" }], rightAt: 2 },
  clue: "witness", metFlag: "met:turtle",
  closing: { zh: "他走得很快,还买了一瓶啤酒。", vi: "Nó đi rất nhanh, còn mua một chai bia." },
  after: { zh: "我老了,但是我记得很清楚。", vi: "Tôi già rồi, nhưng tôi nhớ rất rõ." },
});

/** Quán lẩu: Ông Rùa là nhân chứng, chỉ chịu nói khi bạn đã biết chuyện ở cửa hàng điện thoại (chưa đủ thì ông ngủ gật). */
export const HOTPOT_STORY: StorySceneDef = {
  sceneId: "hotpot",
  sceneNpcEntries: [...turtle.entries, { node: "turtle_idle" }],
  dialogues: {
    ...turtle.nodes,
    turtle_idle: { id: "turtle_idle", speaker: "turtle", zh: "Zzz……", vi: "(Ông Rùa đang ngủ gật. Có lẽ bạn nên tìm hiểu thêm ở cửa hàng điện thoại rồi hãy quay lại.)", next: null },
  },
};
