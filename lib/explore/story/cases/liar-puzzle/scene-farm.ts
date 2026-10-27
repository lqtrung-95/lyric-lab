import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const bird = buildInterview({
  prefix: "bird", speaker: "bird",
  greeting: { zh: "你好!欢迎来农场。", vi: "Chào bạn! Chào mừng đến nông trại." },
  question: { zh: "你知道是谁偷了金奖章吗?", vi: "Bạn có biết ai đã lấy huy chương vàng không?" },
  chatter: [
    { ask: { zh: "你昨晚在哪儿?", vi: "Tối qua cô ở đâu?" }, reply: { zh: "我在农场喂鸡。", vi: "Tôi cho gà ăn ở nông trại." } },
    { ask: { zh: "农场忙吗?", vi: "Nông trại có bận không?" }, reply: { zh: "很忙。", vi: "Rất bận." } },
  ],
  answer: { zh: "不是我干的。", vi: "Không phải tôi làm." },
  check: { vi: "Cô Chim nói gì?", right: { zh: "不是我干的", vi: "Không phải tôi làm" }, wrong: [{ zh: "是我干的", vi: "Là tôi làm" }, { zh: "不是狐狸干的", vi: "Không phải Cáo làm" }], rightAt: 0 },
  clue: "bird_say", metFlag: "met:bird",
  closing: { zh: "我说的是真话。", vi: "Tôi nói thật đấy." },
  after: { zh: "我说的就是这些。你还有事吗?", vi: "Tôi chỉ nói bằng này thôi. Bạn còn việc gì không?" },
});

/** Nông trại: Chim khai không phải mình. */
export const FARM_STORY: StorySceneDef = {
  sceneId: "farm",
  sceneNpcEntries: bird.entries,
  spots: [

  ],
  dialogues: bird.nodes,
};
