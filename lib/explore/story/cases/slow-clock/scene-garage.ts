import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const tiger = buildInterview({
  prefix: "tiger", speaker: "tiger",
  greeting: { zh: "你好!你的车坏了吗?", vi: "Chào bạn! Xe bạn hỏng à?" },
  question: { zh: "昨天下午三点你在哪儿?", vi: "Ba giờ chiều hôm qua chú ở đâu?" },
  chatter: [
    { ask: { zh: "你的工具箱里为什么有一朵玫瑰?", vi: "Sao trong hộp dụng cụ của chú lại có một đóa hồng?" }, reply: { zh: "那是我昨天晚上买的,送给我太太。", vi: "Là tối qua tôi mua để tặng vợ tôi." } },
    { ask: { zh: "你每天都很忙吗?", vi: "Ngày nào chú cũng bận à?" }, reply: { zh: "对,修车的人很多。", vi: "Đúng, người đến sửa xe rất đông." } },
  ],
  answer: { zh: "昨天下午三点,我在店里修车。", vi: "Ba giờ chiều hôm qua, tôi đang sửa xe trong tiệm." },
  check: { vi: "Chú Hổ nói ba giờ chiều hôm qua chú làm gì?", right: { zh: "修车", vi: "Sửa xe" }, wrong: [{ zh: "做奶茶", vi: "Pha trà sữa" }, { zh: "喂动物", vi: "Cho động vật ăn" }], rightAt: 0 },
  clue: "tiger_alibi", metFlag: "met:tiger",
  closing: { zh: "桌子上有一张单子,工具箱也在那儿,你可以看看。", vi: "Trên bàn có một tờ phiếu, hộp dụng cụ cũng ở đó, bạn có thể xem." },
  after: { zh: "你看到什么了?还有事吗?", vi: "Bạn thấy gì rồi? Còn việc gì không?" },
});

/** Tiệm sửa xe: Hổ khai đang sửa xe, phiếu sửa xe xác nhận; đóa hồng trong hộp dụng cụ là mồi nhử (anh mua tối qua tặng vợ). */
export const GARAGE_STORY: StorySceneDef = {
  sceneId: "garage",
  sceneNpcEntries: tiger.entries,
  spots: [
    { id: "repair_sheet", clue: "repair_sheet", label: "Phiếu sửa xe", sprite: "note", x: 14, y: 86, w: 5, when: { all: ["met:tiger"] }, stand: { x: 20, y: 92 } },
    { id: "tiger_rose", clue: "tiger_rose", label: "Hộp dụng cụ của Hổ", sprite: "toolbox", x: 68, y: 92, w: 7, when: { all: ["met:tiger"] }, stand: { x: 68, y: 95 } },
  ],
  dialogues: tiger.nodes,
};
