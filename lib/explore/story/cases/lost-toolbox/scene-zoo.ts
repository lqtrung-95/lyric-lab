import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const fox = buildInterview({
  prefix: "fox", speaker: "fox",
  greeting: { zh: "你好!欢迎来动物园。", vi: "Chào bạn! Chào mừng đến sở thú." },
  question: { zh: "昨天下午三点到四点你在哪儿?", vi: "Chiều qua từ 3 đến 4 giờ cô ở đâu?" },
  chatter: [
    { ask: { zh: "海豹喜欢吃什么?", vi: "Hải cẩu thích ăn gì?" }, reply: { zh: "它们最爱吃鱼。", vi: "Chúng thích ăn cá nhất." } },
    { ask: { zh: "动物园几点关门?", vi: "Sở thú mấy giờ đóng cửa?" }, reply: { zh: "下午五点关门。", vi: "Năm giờ chiều đóng cửa." } },
  ],
  answer: { zh: "昨天下午三点到四点,我一直在动物园工作。", vi: "Chiều qua từ 3 đến 4 giờ, tôi làm việc ở sở thú suốt." },
  check: { vi: "Cô Cáo nói chiều qua từ 3 đến 4 giờ cô ở đâu?", right: { zh: "在动物园", vi: "Ở sở thú" }, wrong: [{ zh: "在花店里", vi: "Trong tiệm hoa" }, { zh: "在奶茶店", vi: "Ở quán trà sữa" }], rightAt: 0 },
  clue: "fox_alibi", metFlag: "met:fox",
  closing: { zh: "记录本在栏杆上。", vi: "Sổ ghi chép ở trên lan can." },
  after: { zh: "还想看动物吗?", vi: "Bạn còn muốn xem thú không?" },
});

/** Sở thú: hai mốc cho ăn cách nhau 40 phút, ít hơn 50 phút khứ hồi nên Cáo không kịp. */
export const ZOO_STORY: StorySceneDef = {
  sceneId: "zoo",
  sceneNpcEntries: fox.entries,
  spots: [
    { id: "zoo_log", clue: "zoo_log", label: "Sổ cho ăn", sprite: "clipboard", x: 14, y: 86, w: 5, when: { all: ["met:fox"] }, stand: { x: 20, y: 92 } },
  ],
  dialogues: fox.nodes,
};
