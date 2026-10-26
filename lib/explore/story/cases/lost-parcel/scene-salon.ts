import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const cat = buildInterview({
  prefix: "cat", speaker: "cat",
  greeting: { zh: "你好!欢迎光临。", vi: "Chào bạn! Hoan nghênh quý khách." },
  question: { zh: "昨天下午六点你在哪儿?", vi: "Sáu giờ chiều hôm qua cô ở đâu?" },
  chatter: [
    { ask: { zh: "你的店开到几点?", vi: "Tiệm cô mở đến mấy giờ?" }, reply: { zh: "七点关门。", vi: "Bảy giờ đóng cửa." } },
    { ask: { zh: "你每天都很忙吗?", vi: "Ngày nào cô cũng bận à?" }, reply: { zh: "对,客人很多。", vi: "Đúng, khách rất đông." } },
  ],
  answer: { zh: "昨天下午六点,我在店里给客人剪头发。", vi: "Sáu giờ chiều hôm qua, tôi đang cắt tóc cho khách ở tiệm." },
  check: { vi: "Cô Mèo nói sáu giờ chiều hôm qua cô làm gì?", right: { zh: "剪头发", vi: "Cắt tóc" }, wrong: [{ zh: "卖药", vi: "Bán thuốc" }, { zh: "寄包裹", vi: "Gửi bưu kiện" }] },
  clue: "cat_alibi", metFlag: "met:cat",
  closing: { zh: "桌子上有一本预约本,你可以看看。", vi: "Trên bàn có một cuốn sổ hẹn, bạn có thể xem." },
  after: { zh: "预约本在桌子上。你还有事吗?", vi: "Sổ hẹn ở trên bàn. Bạn còn việc gì không?" },
});

/** Hiệu cắt tóc: Cô Mèo khai đang cắt tóc; sổ hẹn xác nhận tiệm đông khách suốt buổi chiều. */
export const SALON_STORY: StorySceneDef = {
  sceneId: "salon",
  sceneNpcEntries: cat.entries,
  spots: [{ id: "diary", clue: "diary", label: "Sổ hẹn trên bàn", sprite: "note", x: 14, y: 86, w: 5, when: { all: ["met:cat"] }, stand: { x: 20, y: 92 } }],
  dialogues: cat.nodes,
};
