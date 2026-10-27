import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const cat = buildInterview({
  prefix: "cat", speaker: "cat",
  greeting: { zh: "你好!要剪头发吗?", vi: "Chào bạn! Bạn muốn cắt tóc à?" },
  question: { zh: "昨天下午六点你在哪儿?", vi: "Sáu giờ chiều hôm qua cô ở đâu?" },
  chatter: [
    { ask: { zh: "你的店几点开门?", vi: "Tiệm cô mấy giờ mở cửa?" }, reply: { zh: "早上九点开门。", vi: "Chín giờ sáng mở cửa." } },
    { ask: { zh: "剪头发多少钱?", vi: "Cắt tóc bao nhiêu tiền?" }, reply: { zh: "三十块。", vi: "Ba mươi tệ." } },
  ],
  answer: { zh: "昨天下午六点,我在店里给客人剪头发。", vi: "Sáu giờ chiều hôm qua, tôi đang cắt tóc cho khách ở tiệm." },
  check: { vi: "Cô Mèo nói sáu giờ chiều hôm qua cô đang làm gì?", right: { zh: "给客人剪头发", vi: "Cắt tóc cho khách" }, wrong: [{ zh: "卖药", vi: "Bán thuốc" }, { zh: "看电视", vi: "Xem ti vi" }], rightAt: 0 },
  clue: "cat_alibi", metFlag: "met:cat",
  closing: { zh: "预约本在桌子上。", vi: "Sổ hẹn ở trên bàn." },
  after: { zh: "还想剪头发吗?", vi: "Bạn còn muốn cắt tóc không?" },
});

/** Hiệu cắt tóc: Mèo khai đang cắt tóc nhưng sổ hẹn cho thấy khách cuối rời lúc 5 giờ 40; món quà sinh nhật cho Bác Thỏ giải thích vì sao cô đã đóng cửa đi mua quà. */
export const SALON_STORY: StorySceneDef = {
  sceneId: "salon",
  sceneNpcEntries: cat.entries,
  spots: [
    { id: "salon_book", clue: "salon_book", label: "Sổ hẹn của tiệm", sprite: "clipboard", x: 14, y: 86, w: 5, when: { all: ["met:cat"] }, stand: { x: 20, y: 92 } },
    { id: "cat_gift", clue: "cat_gift", label: "Món quà trên bàn", sprite: "parcel", x: 68, y: 92, w: 4, when: { all: ["met:cat"] }, stand: { x: 68, y: 95 } },
  ],
  dialogues: cat.nodes,
};
