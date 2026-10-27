import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const rabbit = buildInterview({
  prefix: "rabbit", speaker: "rabbit",
  greeting: { zh: "你好!要看电影吗?", vi: "Chào bạn! Bạn muốn xem phim không?" },
  question: { zh: "今天下午三点到三点半你在哪儿?", vi: "Chiều nay từ 3 đến 3 rưỡi bạn ở đâu?" },
  chatter: [
    { ask: { zh: "今天放什么电影?", vi: "Hôm nay chiếu phim gì?" }, reply: { zh: "放一部很好看的动画片。", vi: "Chiếu một bộ phim hoạt hình rất hay." } },
    { ask: { zh: "电影票多少钱?", vi: "Vé phim bao nhiêu tiền?" }, reply: { zh: "四十块一张。", vi: "Bốn mươi tệ một vé." } },
  ],
  answer: { zh: "三点到三点半,我在电影院卖票。三点十分,鸭子来看电影。", vi: "Từ 3 đến 3 rưỡi, tôi bán vé ở rạp phim. Lúc 3:10 Vịt đến xem phim." },
  check: { vi: "Bé Thỏ nói lúc 3:10 ai đến rạp?", right: { zh: "鸭子", vi: "Vịt" }, wrong: [{ zh: "狐狸", vi: "Cáo" }, { zh: "小猪", vi: "Heo" }], rightAt: 0 },
  clue: "rabbit_alibi", metFlag: "met:rabbit",
  closing: { zh: "记录本在柜台上。", vi: "Sổ ghi ở trên quầy." },
  after: { zh: "还想买票吗?", vi: "Bạn còn muốn mua vé không?" },
});

/** Rạp phim: sổ cho biết suất 3:10 bị hủy; hỏi lại phải đưa đúng sổ rạp thì Thỏ mới nói thật. */
export const CINEMA_STORY: StorySceneDef = {
  sceneId: "cinema",
  sceneNpcEntries: [
    { when: { all: ["met:rabbit", "clue:cinema_log", "clue:laundry_log"], none: ["confronted:rabbit"] }, node: "rabbit_conf" },
    ...rabbit.entries,
  ],
  spots: [
    { id: "cinema_log", clue: "cinema_log", label: "Sổ của rạp phim", sprite: "clipboard", x: 14, y: 86, w: 5, when: { all: ["met:rabbit"] }, stand: { x: 20, y: 92 } },
  ],
  dialogues: {
    ...rabbit.nodes,
    rabbit_conf: {
      id: "rabbit_conf", speaker: "player", zh: "您说三点十分卖票给鸭子,可是……", vi: "Bạn nói bán vé cho Vịt lúc 3:10, nhưng…",
      choices: [
        { zh: "我给她看电影院的记录。", vi: "Tôi đưa sổ rạp phim cho bạn ấy xem.", next: "rabbit_conf_ok", when: { all: ["clue:cinema_log"] }, check: "right" },
        { zh: "我给她看银行的记录。", vi: "Tôi đưa sổ ngân hàng cho bạn ấy xem.", next: "rabbit_conf_bad", when: { all: ["clue:bank_log"] }, check: "wrong" },
        { zh: "我什么也不给他看。", vi: "Tôi không đưa gì ra cả.", next: "rabbit_conf_bad", check: "wrong" },
      ],
    },
    rabbit_conf_bad: { id: "rabbit_conf_bad", speaker: "rabbit", zh: "我是真的卖了票!", vi: "Tôi bán vé thật mà!", next: "rabbit_conf" },
    rabbit_conf_ok: { id: "rabbit_conf_ok", speaker: "rabbit", zh: "我们……我们只是想借玉瓶拍张照,马上就还。", vi: "Chúng tôi... chúng tôi chỉ định mượn bình ngọc chụp một tấm ảnh rồi trả ngay.", effects: [{ clue: "rabbit_slip" }, { flag: "confronted:rabbit" }], next: "rabbit_conf_end" },
    rabbit_conf_end: { id: "rabbit_conf_end", speaker: "rabbit", zh: "请不要再问了!", vi: "Xin đừng hỏi nữa!", next: null },
  },
};
