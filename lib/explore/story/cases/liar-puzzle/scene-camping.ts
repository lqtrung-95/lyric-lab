import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const fox = buildInterview({
  prefix: "fox", speaker: "fox",
  greeting: { zh: "你好!欢迎来营地。", vi: "Chào bạn! Chào mừng đến khu trại." },
  question: { zh: "你知道是谁偷了金奖章吗?", vi: "Bạn có biết ai đã lấy huy chương vàng không?" },
  chatter: [
    { ask: { zh: "你昨晚在哪儿?", vi: "Tối qua cô ở đâu?" }, reply: { zh: "我在营地巡逻。", vi: "Tôi đi tuần ở khu trại." } },
    { ask: { zh: "你相信小猪吗?", vi: "Cô có tin Heo không?" }, reply: { zh: "我不知道。", vi: "Tôi không biết." } },
  ],
  answer: { zh: "小猪在说谎。", vi: "Heo đang nói dối." },
  check: { vi: "Cô Cáo nói gì về Heo?", right: { zh: "小猪在说谎", vi: "Heo đang nói dối" }, wrong: [{ zh: "小猪说真话", vi: "Heo nói thật" }, { zh: "小猪不在这儿", vi: "Heo không ở đây" }], rightAt: 0 },
  clue: "fox_say", metFlag: "met:fox",
  closing: { zh: "你自己想一想吧。", vi: "Bạn tự nghĩ thử nhé." },
  after: { zh: "我说的就是这些。你还有事吗?", vi: "Tôi chỉ nói bằng này thôi. Bạn còn việc gì không?" },
});

/** Khu cắm trại: Cáo khai Heo nói dối. */
export const CAMPING_STORY: StorySceneDef = {
  sceneId: "camping",
  sceneNpcEntries: fox.entries,
  spots: [

  ],
  dialogues: fox.nodes,
};
