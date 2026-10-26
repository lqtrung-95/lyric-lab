import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const fox = buildInterview({
  prefix: "fox", speaker: "fox",
  greeting: { zh: "你好!欢迎来动物园。", vi: "Chào bạn! Chào mừng đến sở thú." },
  question: { zh: "昨天晚上七点半你在哪儿?", vi: "Bảy giờ rưỡi tối qua cô ở đâu?" },
  chatter: [
    { ask: { zh: "你昨天去游乐场了吗?", vi: "Hôm qua cô có đến công viên giải trí không?" }, reply: { zh: "去了,我七点就到了。", vi: "Có, tôi đến lúc bảy giờ." } },
    { ask: { zh: "你最喜欢哪个动物?", vi: "Cô thích con vật nào nhất?" }, reply: { zh: "我最喜欢熊猫。", vi: "Tôi thích nhất gấu trúc." } },
  ],
  answer: { zh: "昨天晚上七点半,我在帐篷里看小丑表演。", vi: "Bảy giờ rưỡi tối qua, tôi đang xem chú hề biểu diễn trong lều." },
  check: { vi: "Cô Cáo nói bảy giờ rưỡi tối qua cô ở đâu?", right: { zh: "在帐篷里", vi: "Trong lều" }, wrong: [{ zh: "在农场里", vi: "Ở nông trại" }, { zh: "在摩天轮上", vi: "Trên vòng quay" }], rightAt: 0 },
  clue: "fox_alibi", metFlag: "met:fox",
  closing: { zh: "表演很好看,你可以问问别人。", vi: "Buổi diễn rất hay, bạn có thể hỏi người khác." },
  after: { zh: "我说的都是真的。你还有事吗?", vi: "Tôi nói toàn sự thật. Bạn còn việc gì không?" },
});

/** Sở thú: Cáo khai đang xem hề trong lều; bảng chương trình ở công viên cho thấy không ai ra khỏi lều từ 7 giờ rưỡi đến 8 giờ nên cô vô can (phải đối chiếu hai nơi). */
export const ZOO_STORY: StorySceneDef = {
  sceneId: "zoo",
  sceneNpcEntries: fox.entries,
  spots: [

  ],
  dialogues: fox.nodes,
};
