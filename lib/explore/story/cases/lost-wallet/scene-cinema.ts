import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const rabbit = buildInterview({
  prefix: "rabbit", speaker: "rabbit",
  greeting: { zh: "你好!要看电影吗?", vi: "Chào bạn! Bạn muốn xem phim không?" },
  question: { zh: "昨天下午两点到两点二十你在哪儿?", vi: "Chiều qua từ 2 giờ đến 2 giờ 20 anh ở đâu?" },
  chatter: [
    { ask: { zh: "这部电影几点开始?", vi: "Phim này mấy giờ bắt đầu?" }, reply: { zh: "两点半。", vi: "Hai giờ rưỡi." } },
    { ask: { zh: "票多少钱?", vi: "Vé bao nhiêu tiền?" }, reply: { zh: "四十块。", vi: "Bốn mươi tệ." } },
  ],
  answer: { zh: "昨天下午两点到两点二十,我在电影院卖票。", vi: "Chiều qua từ 2 giờ đến 2 giờ 20, tôi bán vé ở rạp phim." },
  check: { vi: "Thỏ nói chiều qua lúc 2 giờ anh ở đâu?", right: { zh: "在电影院", vi: "Ở rạp phim" }, wrong: [{ zh: "在银行", vi: "Ở ngân hàng" }, { zh: "在健身房", vi: "Ở phòng gym" }], rightAt: 1 },
  clue: "rabbit_alibi", metFlag: "met:rabbit",
  closing: { zh: "我的售票本在墙上。", vi: "Sổ bán vé của tôi ở trên tường." },
  after: { zh: "你还想问什么?", vi: "Bạn còn muốn hỏi gì?" },
});

/** Rạp chiếu phim: sổ bán vé xác nhận Thỏ ở quầy; hỏi về người mua vé suất 2 giờ 30 thì biết người đó mặc đồ thể thao (chỉ khi đã có cuống vé). */
export const CINEMA_STORY: StorySceneDef = {
  sceneId: "cinema",
  sceneNpcEntries: rabbit.entries,
  spots: [
    { id: "sales_log", clue: "sales_log", label: "Sổ bán vé", sprite: "clipboard", x: 74, y: 32, w: 5, when: { all: ["met:rabbit"] }, stand: { x: 74, y: 46 } },
    { id: "buyer_note", clue: "buyer_note", label: "Ghi chú của người bán vé", sprite: "note", x: 56, y: 86, w: 4, when: { all: ["met:rabbit", "clue:stub"] } },
  ],
  dialogues: rabbit.nodes,
};
