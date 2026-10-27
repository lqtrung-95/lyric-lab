import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const duck = buildInterview({
  prefix: "duck", speaker: "duck",
  greeting: { zh: "你好!要洗衣服吗?", vi: "Chào bạn! Bạn muốn giặt đồ à?" },
  question: { zh: "今天下午三点到三点半你在哪儿?", vi: "Chiều nay từ 3 đến 3 rưỡi anh ở đâu?" },
  chatter: [
    { ask: { zh: "洗一件衣服多少钱?", vi: "Giặt một cái áo bao nhiêu?" }, reply: { zh: "十块钱一件。", vi: "Mười tệ một cái." } },
    { ask: { zh: "你喜欢看电影吗?", vi: "Anh có thích xem phim không?" }, reply: { zh: "喜欢,我常常去。", vi: "Thích, tôi hay đi lắm." } },
  ],
  answer: { zh: "三点到三点半,我在电影院看电影。兔子卖给我一张票。", vi: "Từ 3 đến 3 rưỡi, tôi xem phim ở rạp. Thỏ bán cho tôi một vé." },
  check: { vi: "Chú Vịt nói lúc 3 giờ anh ở đâu?", right: { zh: "在电影院", vi: "Ở rạp phim" }, wrong: [{ zh: "在银行", vi: "Ở ngân hàng" }, { zh: "在机场", vi: "Ở sân bay" }], rightAt: 0 },
  clue: "duck_alibi", metFlag: "met:duck",
  closing: { zh: "门上有一块牌子。", vi: "Trên cửa có một tấm biển." },
  after: { zh: "衣服洗好了吗?", vi: "Đồ giặt xong chưa?" },
});

/** Tiệm giặt: bảng cho biết tiệm đóng cửa từ 3 đến 3 rưỡi, trái lời khai đang xem phim. */
export const LAUNDRY_STORY: StorySceneDef = {
  sceneId: "laundry",
  sceneNpcEntries: [
    ...duck.entries,
  ],
  spots: [
    { id: "laundry_log", clue: "laundry_log", label: "Bảng trên cửa tiệm", sprite: "note", x: 14, y: 86, w: 5, when: { all: ["met:duck"] }, stand: { x: 20, y: 92 } },
  ],
  dialogues: {
    ...duck.nodes,
  },
};
