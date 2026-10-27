import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const owl = buildInterview({
  prefix: "owl", speaker: "owl",
  greeting: { zh: "你好!我在做实验,请别吵。", vi: "Chào bạn! Tôi đang làm thí nghiệm, xin đừng làm ồn." },
  question: { zh: "你知道是谁偷了金奖章吗?", vi: "Bạn có biết ai đã lấy huy chương vàng không?" },
  chatter: [
    { ask: { zh: "你昨晚在哪儿?", vi: "Tối qua cụ ở đâu?" }, reply: { zh: "我在实验室。", vi: "Tôi ở trong phòng thí nghiệm." } },
    { ask: { zh: "你和小猪是朋友吗?", vi: "Cụ với Heo có là bạn không?" }, reply: { zh: "是的,我们认识很久了。", vi: "Phải, chúng tôi quen nhau lâu rồi." } },
  ],
  answer: { zh: "不是小猪干的。", vi: "Không phải Heo làm." },
  check: { vi: "Cụ Cú nói gì về chuyện này?", right: { zh: "不是小猪干的", vi: "Không phải Heo làm" }, wrong: [{ zh: "是小猪干的", vi: "Là Heo làm" }, { zh: "不是我干的", vi: "Không phải tôi làm" }], rightAt: 0 },
  clue: "owl_say", metFlag: "met:owl",
  closing: { zh: "桌子上有一个指纹,你可以看看。", vi: "Trên bàn có một dấu vân tay, bạn có thể xem." },
  after: { zh: "我说的就是这些。你还有事吗?", vi: "Tôi chỉ nói bằng này thôi. Bạn còn việc gì không?" },
});

/** Phòng thí nghiệm: Cú khai không phải Heo; dấu vân tay mờ là chi tiết thừa. */
export const LAB_STORY: StorySceneDef = {
  sceneId: "lab",
  sceneNpcEntries: owl.entries,
  spots: [
    { id: "smudge", clue: "smudge", label: "Dấu vân tay trên bàn", sprite: "fingerprint", x: 14, y: 86, w: 4.5, when: { all: ["met:owl"] }, stand: { x: 20, y: 92 } },
  ],
  dialogues: owl.nodes,
};
