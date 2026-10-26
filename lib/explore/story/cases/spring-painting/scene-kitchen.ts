import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const chef = buildInterview({
  prefix: "chef", speaker: "chef",
  greeting: { zh: "欢迎来到厨房!", vi: "Chào mừng đến nhà bếp!" },
  question: { zh: "昨天上午九点到九点半你在哪儿?", vi: "Sáng qua từ 9 giờ đến 9 giờ rưỡi bạn ở đâu?" },
  chatter: [
    { ask: { zh: "今天做什么菜?", vi: "Hôm nay nấu món gì?" }, reply: { zh: "做鱼和汤。", vi: "Nấu cá và canh." } },
    { ask: { zh: "你的蛋糕好吃吗?", vi: "Bánh của ông ngon không?" }, reply: { zh: "我不会做蛋糕。", vi: "Tôi không biết làm bánh." } },
  ],
  answer: { zh: "昨天上午九点到九点半,我在厨房做饭。", vi: "Sáng qua từ 9 giờ đến 9 giờ rưỡi, tôi nấu ăn trong bếp." },
  check: { vi: "Bếp trưởng Gấu nói sáng qua lúc 9 giờ ông ở đâu?", right: { zh: "在厨房", vi: "Ở nhà bếp" }, wrong: [{ zh: "在博物馆", vi: "Ở bảo tàng" }, { zh: "在火车站", vi: "Ở ga tàu" }], rightAt: 0 },
  clue: "chef_alibi", metFlag: "met:chef",
  closing: { zh: "我的值班本在墙上。", vi: "Sổ trực của tôi ở trên tường." },
  after: { zh: "值班本在墙上。要尝尝汤吗?", vi: "Sổ trực ở trên tường. Bạn muốn nếm canh không?" },
});

/** Nhà bếp: sổ trực xác nhận Gấu ở trong bếp suốt buổi sáng (nên lời Thỏ đổ lỗi là sai). */
export const KITCHEN_STORY: StorySceneDef = {
  sceneId: "kitchen",
  sceneNpcEntries: chef.entries,
  spots: [
    { id: "kitchen_log", clue: "kitchen_log", label: "Sổ trực của nhà bếp", sprite: "clipboard", x: 30, y: 30, w: 5, when: { all: ["met:chef"] }, stand: { x: 30, y: 46 } },
  ],
  dialogues: chef.nodes,
};
