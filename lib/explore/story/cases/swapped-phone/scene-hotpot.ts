import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const turtle = buildInterview({
  prefix: "turtle", speaker: "turtle",
  gate: { all: ["met:rabbit", "clue:post_log", "clue:rabbit_bag"] },
  greeting: { zh: "你好,年轻人。欢迎来吃火锅。", vi: "Chào chàng trai. Mời đến ăn lẩu." },
  question: { zh: "昨天晚上七点你看见什么了?", vi: "Bảy giờ tối hôm qua ông đã thấy gì?" },
  chatter: [
    { ask: { zh: "你的店几点关门?", vi: "Quán ông mấy giờ đóng cửa?" }, reply: { zh: "十点关门。", vi: "Mười giờ đóng cửa." } },
  ],
  answer: { zh: "昨天晚上七点,我在火锅店看见一只兔子。他在桌子旁边换了一个手机。", vi: "Bảy giờ tối hôm qua, tôi thấy một con thỏ trong quán lẩu. Nó tráo một chiếc điện thoại cạnh cái bàn." },
  check: { vi: "Ông Rùa đã nhìn thấy con vật nào?", right: { zh: "兔子", vi: "Con thỏ" }, wrong: [{ zh: "狐狸", vi: "Con cáo" }, { zh: "小猫", vi: "Con mèo" }], rightAt: 0 },
  clue: "witness", metFlag: "met:turtle",
  closing: { zh: "他很快就走了,没有吃火锅。", vi: "Nó đi rất nhanh, chẳng ăn lẩu gì cả." },
  after: { zh: "我老了,但是我记得很清楚。", vi: "Tôi già rồi, nhưng tôi nhớ rất rõ." },
});

/** Quán lẩu: Ông Rùa là nhân chứng, chỉ chịu nói khi bạn đã biết chuyện ở bưu điện (chưa đủ thì ông ngủ gật). */
export const HOTPOT_STORY: StorySceneDef = {
  sceneId: "hotpot",
  sceneNpcEntries: [...turtle.entries, { node: "turtle_idle" }],
  dialogues: {
    ...turtle.nodes,
    turtle_idle: { id: "turtle_idle", speaker: "turtle", zh: "Zzz……", vi: "(Ông Rùa đang ngủ gật. Có lẽ bạn nên tìm hiểu thêm ở bưu điện rồi hãy quay lại.)", next: null },
  },
};
