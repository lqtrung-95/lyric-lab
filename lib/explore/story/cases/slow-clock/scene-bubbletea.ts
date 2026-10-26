import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const rabbit = buildInterview({
  prefix: "rabbit", speaker: "rabbit",
  greeting: { zh: "你好!你想喝点什么?", vi: "Chào bạn! Bạn muốn uống gì?" },
  question: { zh: "昨天下午三点你在哪儿?", vi: "Ba giờ chiều hôm qua bạn ở đâu?" },
  chatter: [
    { ask: { zh: "你们的奶茶贵吗?", vi: "Trà sữa ở đây có đắt không?" }, reply: { zh: "不贵,十五块一杯。", vi: "Không đắt, mười lăm tệ một ly." } },
    { ask: { zh: "什么味道最好喝?", vi: "Vị nào ngon nhất?" }, reply: { zh: "芒果和草莓都很好喝。", vi: "Xoài và dâu tây đều rất ngon." } },
  ],
  answer: { zh: "昨天下午三点,我在店里做奶茶。", vi: "Ba giờ chiều hôm qua, tôi đang pha trà sữa ở quán." },
  check: { vi: "Bé Thỏ nói ba giờ chiều hôm qua bạn ấy làm gì?", right: { zh: "做奶茶", vi: "Pha trà sữa" }, wrong: [{ zh: "修车", vi: "Sửa xe" }, { zh: "喂动物", vi: "Cho động vật ăn" }], rightAt: 0 },
  clue: "rabbit_alibi", metFlag: "met:rabbit",
  closing: { zh: "柜台上有一张单子,你可以看看。", vi: "Trên quầy có một tờ phiếu, bạn có thể xem." },
  after: { zh: "单子在柜台上。你还有事吗?", vi: "Tờ phiếu ở trên quầy. Bạn còn việc gì không?" },
});

/** Quán trà sữa: Thỏ khai đang pha trà sữa; phiếu gọi đồ uống xác nhận bé pha suốt buổi chiều. */
export const BUBBLETEA_STORY: StorySceneDef = {
  sceneId: "bubbletea",
  sceneNpcEntries: rabbit.entries,
  spots: [
    { id: "order_sheet", clue: "order_sheet", label: "Phiếu gọi đồ uống", sprite: "note", x: 14, y: 86, w: 5, when: { all: ["met:rabbit"] }, stand: { x: 20, y: 92 } },
  ],
  dialogues: rabbit.nodes,
};
