import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const chef = buildInterview({
  prefix: "chef", speaker: "chef",
  greeting: { zh: "你好!欢迎来到我的饭馆。", vi: "Chào bạn! Chào mừng đến quán của tôi." },
  question: { zh: "昨天下午三点你在哪儿?", vi: "Ba giờ chiều hôm qua ông ở đâu?" },
  chatter: [
    { ask: { zh: "你的饭馆有什么好吃的?", vi: "Quán ông có món gì ngon?" }, reply: { zh: "我们有米饭、面条,还有鱼。", vi: "Chúng tôi có cơm, mì và cá." } },
    { ask: { zh: "今天忙吗?", vi: "Hôm nay có bận không?" }, reply: { zh: "很忙!客人很多。", vi: "Rất bận! Khách rất đông." } },
  ],
  answer: { zh: "昨天下午三点,我在厨房做饭。", vi: "Ba giờ chiều hôm qua, tôi đang nấu cơm trong bếp." },
  check: { vi: "Bếp trưởng Gấu nói ba giờ chiều hôm qua ông ở đâu?", right: { zh: "在厨房", vi: "Trong bếp" }, wrong: [{ zh: "在商店", vi: "Ở cửa hàng" }, { zh: "在医院", vi: "Ở bệnh viện" }] },
  clue: "chef_alibi", metFlag: "met:chef",
  closing: { zh: "墙上有一张单子,你可以看看。", vi: "Trên tường có một tờ hóa đơn, bạn có thể xem." },
  after: { zh: "单子在墙上。你还有事吗?", vi: "Hóa đơn ở trên tường. Bạn còn việc gì không?" },
});

/** Quán ăn: Bếp trưởng Gấu khai đang nấu ăn; tờ hóa đơn trên tường xác nhận quán rất đông khách. */
export const QUAN_AN_STORY: StorySceneDef = {
  sceneId: "quan-an",
  sceneNpcEntries: chef.entries,
  spots: [{ id: "receipt", clue: "receipt", label: "Tờ hóa đơn trên tường", sprite: "note", x: 22, y: 29, w: 5, when: { all: ["met:chef"] }, stand: { x: 22, y: 42 } }],
  dialogues: chef.nodes,
};
