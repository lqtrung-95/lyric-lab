import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const dog = buildInterview({
  prefix: "dog", speaker: "dog",
  greeting: { zh: "你好!我是警察,也是丢金表的人。", vi: "Chào bạn! Tôi là cảnh sát, cũng là người mất đồng hồ vàng." },
  question: { zh: "你的帐篷是怎么样的?", vi: "Lều của chú thế nào?" },
  chatter: [
    { ask: { zh: "金表是什么样的?", vi: "Đồng hồ vàng trông thế nào?" }, reply: { zh: "是黄色的,很贵。", vi: "Màu vàng, rất đắt." } },
    { ask: { zh: "你住在哪个帐篷?", vi: "Chú ở lều nào?" }, reply: { zh: "我住在营地里,你要自己想一想。", vi: "Tôi ở trong khu trại, bạn tự nghĩ nhé." } },
  ],
  answer: { zh: "我的帐篷挨着小猪的帐篷。", vi: "Lều của tôi nằm cạnh lều của Heo." },
  check: { vi: "Chú Chó nói lều của chú thế nào?", right: { zh: "挨着小猪的帐篷", vi: "Cạnh lều của Heo" }, wrong: [{ zh: "挨着猫头鹰的帐篷", vi: "Cạnh lều của Cú" }, { zh: "在最左边", vi: "Ở ngoài cùng bên trái" }], rightAt: 0 },
  clue: "dog_tent", metFlag: "met:dog",
  closing: { zh: "桌子上有警察的记录,你可以看看。", vi: "Trên bàn có ghi chép của cảnh sát, bạn có thể xem." },
  after: { zh: "记录在桌子上。你还有事吗?", vi: "Ghi chép ở trên bàn. Bạn còn việc gì không?" },
});

/** Đồn cảnh sát: Chó (chủ lều bị mất đồ) khai lều của chú cạnh lều Heo; ghi chép của cảnh sát nói lều kẻ trộm nằm bên trái lều bị mất đồ. */
export const POLICE_STORY: StorySceneDef = {
  sceneId: "police",
  sceneNpcEntries: dog.entries,
  spots: [
    { id: "police_report", clue: "police_report", label: "Ghi chép của cảnh sát", sprite: "note", x: 14, y: 86, w: 5, when: { all: ["met:dog"] }, stand: { x: 20, y: 92 } },
  ],
  dialogues: dog.nodes,
};
