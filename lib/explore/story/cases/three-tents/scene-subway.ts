import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const pig = buildInterview({
  prefix: "pig", speaker: "pig",
  greeting: { zh: "你好!请出示你的交通卡。", vi: "Chào bạn! Xin xuất trình thẻ đi lại." },
  question: { zh: "你的帐篷是什么颜色的?", vi: "Lều của anh màu gì?" },
  chatter: [
    { ask: { zh: "你每天坐地铁吗?", vi: "Hằng ngày anh đi tàu điện ngầm à?" }, reply: { zh: "对,我在这里工作。", vi: "Đúng, tôi làm việc ở đây." } },
    { ask: { zh: "你喜欢露营吗?", vi: "Anh có thích cắm trại không?" }, reply: { zh: "喜欢,但是我怕黑。", vi: "Thích, nhưng tôi sợ tối." } },
  ],
  answer: { zh: "我的帐篷是蓝色的。", vi: "Lều của tôi màu xanh dương." },
  check: { vi: "Anh Heo nói lều của anh màu gì?", right: { zh: "蓝色", vi: "Xanh dương" }, wrong: [{ zh: "红色", vi: "Đỏ" }, { zh: "绿色", vi: "Xanh lá" }], rightAt: 0 },
  clue: "pig_tent", metFlag: "met:pig",
  closing: { zh: "墙上有一块通知,你可以看看。", vi: "Trên tường có một tấm thông báo, bạn có thể xem." },
  after: { zh: "我说的都是真的。你还有事吗?", vi: "Tôi nói đều là thật. Bạn còn việc gì không?" },
});

/** Ga tàu điện ngầm: Heo khai lều màu xanh dương; thông báo mưa là chi tiết thừa. */
export const SUBWAY_STORY: StorySceneDef = {
  sceneId: "subway",
  sceneNpcEntries: pig.entries,
  spots: [
    { id: "rain_notice", clue: "rain_notice", label: "Thông báo của ga", sprite: "note", x: 14, y: 86, w: 5, when: { all: ["met:pig"] }, stand: { x: 20, y: 92 } },
  ],
  dialogues: pig.nodes,
};
