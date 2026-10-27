import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const duck = buildInterview({
  prefix: "duck", speaker: "duck",
  greeting: { zh: "你好!你要洗衣服吗?", vi: "Chào bạn! Bạn muốn giặt đồ à?" },
  question: { zh: "你知道是谁偷了金奖章吗?", vi: "Bạn có biết ai đã lấy huy chương vàng không?" },
  chatter: [
    { ask: { zh: "你昨晚在哪儿?", vi: "Tối qua chú ở đâu?" }, reply: { zh: "我在洗衣店。", vi: "Tôi ở tiệm giặt." } },
    { ask: { zh: "你认识猫头鹰吗?", vi: "Chú có biết Cú không?" }, reply: { zh: "认识,他常来洗白大褂。", vi: "Biết, ông ấy hay đến giặt áo choàng trắng." } },
  ],
  answer: { zh: "不是我,也不是猫头鹰。", vi: "Không phải tôi, cũng không phải Cú." },
  check: { vi: "Chú Vịt nói gì?", right: { zh: "不是我,也不是猫头鹰", vi: "Không phải tôi, cũng không phải Cú" }, wrong: [{ zh: "是我和猫头鹰", vi: "Là tôi và Cú" }, { zh: "不是我,是猫头鹰", vi: "Không phải tôi, là Cú" }], rightAt: 0 },
  clue: "duck_say", metFlag: "met:duck",
  closing: { zh: "柜台上有一张单子。", vi: "Trên quầy có một tờ phiếu." },
  after: { zh: "我说的就是这些。你还有事吗?", vi: "Tôi chỉ nói bằng này thôi. Bạn còn việc gì không?" },
});

/** Tiệm giặt là: Vịt khai không phải mình và cũng không phải Cú. */
export const LAUNDRY_STORY: StorySceneDef = {
  sceneId: "laundry",
  sceneNpcEntries: duck.entries,
  spots: [
    { id: "laundry_note", clue: "laundry_note", label: "Phiếu của tiệm giặt", sprite: "note", x: 14, y: 86, w: 5, when: { all: ["met:duck"] }, stand: { x: 20, y: 92 } },
  ],
  dialogues: duck.nodes,
};
