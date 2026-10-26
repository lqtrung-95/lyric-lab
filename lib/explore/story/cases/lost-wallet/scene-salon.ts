import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const cat = buildInterview({
  prefix: "cat", speaker: "cat",
  greeting: { zh: "你好!要剪头发吗?", vi: "Chào bạn! Bạn muốn cắt tóc không?" },
  question: { zh: "昨天下午两点到两点二十你在哪儿?", vi: "Chiều qua từ 2 giờ đến 2 giờ 20 cô ở đâu?" },
  chatter: [
    { ask: { zh: "你的发夹真漂亮。", vi: "Kẹp tóc của cô đẹp quá." }, reply: { zh: "谢谢,我有很多。", vi: "Cảm ơn, tôi có nhiều lắm." } },
    { ask: { zh: "剪头发多少钱?", vi: "Cắt tóc bao nhiêu tiền?" }, reply: { zh: "三十块。", vi: "Ba mươi tệ." } },
  ],
  answer: { zh: "昨天下午两点到两点二十,我在店里给客人剪头发。", vi: "Chiều qua từ 2 giờ đến 2 giờ 20, tôi cắt tóc cho khách trong tiệm." },
  check: { vi: "Cô Mèo nói chiều qua lúc 2 giờ cô làm gì?", right: { zh: "给客人剪头发", vi: "Cắt tóc cho khách" }, wrong: [{ zh: "在看电影", vi: "Đang xem phim" }, { zh: "在超市买东西", vi: "Đang mua đồ ở siêu thị" }], rightAt: 0 },
  clue: "cat_alibi", metFlag: "met:cat",
  closing: { zh: "我的预约本在墙上。", vi: "Sổ hẹn của tôi ở trên tường." },
  after: { zh: "还要剪头发吗?", vi: "Bạn còn muốn cắt tóc không?" },
});

/** Hiệu cắt tóc: sổ hẹn xác nhận Mèo bận cắt tóc liên tục (loại trừ); kẹp tóc hồng chỉ là mồi nhử. */
export const SALON_STORY: StorySceneDef = {
  sceneId: "salon",
  sceneNpcEntries: cat.entries,
  spots: [
    { id: "appointment", clue: "appointment", label: "Sổ hẹn", sprite: "clipboard", x: 55, y: 30, w: 5, when: { all: ["met:cat"] }, stand: { x: 55, y: 46 } },
  ],
  dialogues: cat.nodes,
};
