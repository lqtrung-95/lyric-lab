import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const rabbit = buildInterview({
  prefix: "rabbit", speaker: "rabbit",
  greeting: { zh: "你好!要看电影吗?", vi: "Chào bạn! Bạn muốn xem phim không?" },
  question: { zh: "昨天下午三点你在哪儿?", vi: "Chiều qua lúc 3 giờ anh ở đâu?" },
  chatter: [
    { ask: { zh: "你的爆米花桶是金色的?", vi: "Thùng bắp của anh màu vàng à?" }, reply: { zh: "对,是电影院的。", vi: "Ừ, của rạp phim đấy." } },
    { ask: { zh: "这部电影几点开始?", vi: "Phim này mấy giờ bắt đầu?" }, reply: { zh: "四点。", vi: "Bốn giờ." } },
  ],
  answer: { zh: "昨天下午三点,我在电影院卖票。", vi: "Chiều qua lúc 3 giờ, tôi bán vé ở rạp phim." },
  check: { vi: "Thỏ nói chiều qua lúc 3 giờ anh ở đâu?", right: { zh: "在电影院", vi: "Ở rạp phim" }, wrong: [{ zh: "在博物馆", vi: "Ở bảo tàng" }, { zh: "在银行", vi: "Ở ngân hàng" }], rightAt: 1 },
  clue: "rabbit_alibi", metFlag: "met:rabbit",
  closing: { zh: "我的售票本在墙上。", vi: "Sổ bán vé của tôi ở trên tường." },
  after: { zh: "你还想问什么?", vi: "Bạn còn muốn hỏi gì?" },
});

/** Rạp chiếu phim: sổ bán vé xác nhận Thỏ ở quầy; thùng bắp vàng chỉ là mồi nhử. */
export const CINEMA_STORY: StorySceneDef = {
  sceneId: "cinema",
  sceneNpcEntries: rabbit.entries,
  spots: [
    { id: "sales_log", clue: "sales_log", label: "Sổ bán vé", sprite: "clipboard", x: 74, y: 32, w: 5, when: { all: ["met:rabbit"] }, stand: { x: 74, y: 46 } },
  ],
  dialogues: rabbit.nodes,
};
