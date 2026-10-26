import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const tiger = buildInterview({
  prefix: "tiger", speaker: "tiger",
  greeting: { zh: "你好!你的车坏了吗?", vi: "Chào bạn! Xe bạn hỏng à?" },
  question: { zh: "昨天晚上七点四十你在哪儿?", vi: "Bảy giờ bốn mươi tối qua chú ở đâu?" },
  chatter: [
    { ask: { zh: "你的头盔上为什么有金色的油漆?", vi: "Sao mũ bảo hiểm của chú có sơn vàng?" }, reply: { zh: "那是我给一辆金色的车喷漆的时候弄的。", vi: "Là lúc tôi sơn một chiếc xe màu vàng nên dính vào." } },
    { ask: { zh: "你昨天玩得开心吗?", vi: "Hôm qua chú chơi có vui không?" }, reply: { zh: "很开心,摩天轮很好玩。", vi: "Rất vui, vòng quay rất thú vị." } },
  ],
  answer: { zh: "昨天晚上七点四十,我到了游乐场,然后就去坐摩天轮。", vi: "Bảy giờ bốn mươi tối qua, tôi đến công viên rồi đi thẳng lên vòng quay." },
  check: { vi: "Chú Hổ nói bảy giờ bốn mươi chú làm gì?", right: { zh: "坐摩天轮", vi: "Lên vòng quay" }, wrong: [{ zh: "看小丑", vi: "Xem chú hề" }, { zh: "喂鸡", vi: "Cho gà ăn" }], rightAt: 0 },
  clue: "tiger_alibi", metFlag: "met:tiger",
  closing: { zh: "我的头盔在桌子上,你可以看看。", vi: "Mũ bảo hiểm của tôi ở trên bàn, bạn có thể xem." },
  after: { zh: "我没有什么要藏的。你还有事吗?", vi: "Tôi không có gì phải giấu. Bạn còn việc gì không?" },
});

/** Tiệm sửa xe: Hổ khai vào công viên lúc 7 giờ 40 rồi lên vòng quay; sổ vòng quay (ở công viên) cho thấy ông lên lúc 7 giờ 45 và cổng tới gian hàng mất 10 phút nên không kịp lấy cúp. Vệt sơn vàng là mồi nhử. */
export const GARAGE_STORY: StorySceneDef = {
  sceneId: "garage",
  sceneNpcEntries: tiger.entries,
  spots: [
    { id: "tiger_paint", clue: "tiger_paint", label: "Mũ bảo hiểm của Hổ", sprite: "helmet", x: 14, y: 86, w: 6, when: { all: ["met:tiger"] }, stand: { x: 20, y: 92 } },
  ],
  dialogues: tiger.nodes,
};
