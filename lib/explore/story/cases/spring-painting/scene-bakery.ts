import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const cat = buildInterview({
  prefix: "cat", speaker: "cat",
  greeting: { zh: "欢迎光临!想吃点什么?", vi: "Chào mừng quý khách! Bạn muốn ăn gì?" },
  question: { zh: "昨天上午九点到九点半你在哪儿?", vi: "Sáng qua từ 9 giờ đến 9 giờ rưỡi bạn ở đâu?" },
  chatter: [
    { ask: { zh: "蛋糕多少钱?", vi: "Bánh bao nhiêu tiền?" }, reply: { zh: "三十块。", vi: "Ba mươi tệ." } },
    { ask: { zh: "你喜欢什么颜色?", vi: "Cô thích màu gì?" }, reply: { zh: "我喜欢粉红色。", vi: "Tôi thích màu hồng." } },
  ],
  answer: { zh: "昨天上午九点到九点半,我在店里做蛋糕。", vi: "Sáng qua từ 9 giờ đến 9 giờ rưỡi, tôi làm bánh trong tiệm." },
  check: { vi: "Cô Mèo nói sáng qua lúc 9 giờ cô ở đâu?", right: { zh: "在店里", vi: "Ở trong tiệm" }, wrong: [{ zh: "在球场", vi: "Ở sân tập" }, { zh: "在医院", vi: "Ở bệnh viện" }], rightAt: 2 },
  clue: "cat_alibi", metFlag: "met:cat",
  closing: { zh: "我的牌子和围裙都在这里。", vi: "Biển và tạp dề của tôi đều ở đây." },
  after: { zh: "牌子在墙上。要买蛋糕吗?", vi: "Biển ở trên tường. Bạn muốn mua bánh không?" },
});

/** Tiệm bánh: biển cho thấy tiệm đóng cửa lúc Mèo nói đang làm bánh; tạp dề của Mèo màu hồng, của Gấu màu trắng. */
export const BAKERY_STORY: StorySceneDef = {
  sceneId: "bakery",
  sceneNpcEntries: cat.entries,
  spots: [
    { id: "bakery_sign", clue: "bakery_sign", label: "Biển đóng cửa", sprite: "clipboard", x: 66, y: 30, w: 5, when: { all: ["met:cat"] }, stand: { x: 66, y: 46 } },
    { id: "apron_rack", clue: "apron_color", label: "Giá treo tạp dề", sprite: "note", x: 48, y: 78, w: 4.5, when: { all: ["met:cat"] } },
  ],
  dialogues: cat.nodes,
};
