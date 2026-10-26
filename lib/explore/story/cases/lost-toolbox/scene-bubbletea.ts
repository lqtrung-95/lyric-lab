import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const rabbit = buildInterview({
  prefix: "rabbit", speaker: "rabbit",
  greeting: { zh: "你好!你想喝点什么?", vi: "Chào bạn! Bạn muốn uống gì?" },
  question: { zh: "昨天下午四点你在哪儿?", vi: "Bốn giờ chiều hôm qua bạn ở đâu?" },
  chatter: [
    { ask: { zh: "你们的奶茶贵吗?", vi: "Trà sữa ở đây có đắt không?" }, reply: { zh: "不贵,十五块一杯。", vi: "Không đắt, mười lăm tệ một ly." } },
    { ask: { zh: "什么味道最好喝?", vi: "Vị nào ngon nhất?" }, reply: { zh: "芒果和草莓都很好喝。", vi: "Xoài và dâu tây đều rất ngon." } },
  ],
  answer: { zh: "昨天下午四点,我在店里做奶茶。", vi: "Bốn giờ chiều hôm qua, tôi đang pha trà sữa ở quán." },
  check: { vi: "Bé Thỏ nói bốn giờ chiều hôm qua bạn ấy làm gì?", right: { zh: "做奶茶", vi: "Pha trà sữa" }, wrong: [{ zh: "喂动物", vi: "Cho động vật ăn" }, { zh: "包花", vi: "Gói hoa" }], rightAt: 0 },
  clue: "rabbit_alibi", metFlag: "met:rabbit",
  closing: { zh: "墙上有一块牌子,柜台那边还有东西,你可以看看。", vi: "Trên tường có một tấm biển, bên quầy còn có đồ, bạn có thể xem." },
  after: { zh: "你看到什么了?还有事吗?", vi: "Bạn thấy gì rồi? Còn việc gì không?" },
});

/** Cảnh bubbletea của vụ án lost-toolbox (xem chú thích ở index.ts của vụ án). */
export const BUBBLETEA_STORY: StorySceneDef = {
  sceneId: "bubbletea",
  sceneNpcEntries: rabbit.entries,
  spots: [
    { id: "closed_sign", clue: "closed_sign", label: "Bảng giờ của quán", sprite: "note", x: 14, y: 86, w: 5, when: { all: ["met:rabbit"] }, stand: { x: 20, y: 92 } },
    { id: "red_box", clue: "red_box", label: "Hộp đỏ sau quầy", sprite: "toolbox", x: 68, y: 92, w: 7, when: { all: ["met:rabbit"] }, stand: { x: 68, y: 95 } },
  ],
  dialogues: rabbit.nodes,
};
