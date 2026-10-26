import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const fox = buildInterview({
  prefix: "fox", speaker: "fox",
  greeting: { zh: "你好!你要买什么药?", vi: "Chào bạn! Bạn cần mua thuốc gì?" },
  question: { zh: "昨天下午六点你在哪儿?", vi: "Sáu giờ chiều hôm qua cô ở đâu?" },
  chatter: [
    { ask: { zh: "你们几点开门?", vi: "Mấy giờ hiệu thuốc mở cửa?" }, reply: { zh: "早上八点开门。", vi: "Tám giờ sáng mở cửa." } },
    { ask: { zh: "感冒了吃什么药?", vi: "Bị cảm uống thuốc gì?" }, reply: { zh: "多喝水,吃这个药。", vi: "Uống nhiều nước và dùng thuốc này." } },
  ],
  answer: { zh: "昨天下午六点,我在药店卖药。", vi: "Sáu giờ chiều hôm qua, tôi đang bán thuốc ở hiệu thuốc." },
  check: { vi: "Cô Cáo nói sáu giờ chiều hôm qua cô làm gì?", right: { zh: "卖药", vi: "Bán thuốc" }, wrong: [{ zh: "剪头发", vi: "Cắt tóc" }, { zh: "看电影", vi: "Xem phim" }], rightAt: 0 },
  clue: "fox_alibi", metFlag: "met:fox",
  closing: { zh: "柜台上有一张小票,你可以看看。", vi: "Trên quầy có một tờ hóa đơn, bạn có thể xem." },
  after: { zh: "小票在柜台上。你还有事吗?", vi: "Hóa đơn ở trên quầy. Bạn còn việc gì không?" },
});

/** Hiệu thuốc: Cô Cáo khai đang bán thuốc; hóa đơn xác nhận cô ở đó suốt. */
export const PHARMACY_STORY: StorySceneDef = {
  sceneId: "pharmacy",
  sceneNpcEntries: fox.entries,
  spots: [{ id: "pharmacy_receipt", clue: "pharmacy_receipt", label: "Hóa đơn trên quầy", sprite: "note", x: 14, y: 86, w: 5, when: { all: ["met:fox"] }, stand: { x: 20, y: 92 } }],
  dialogues: fox.nodes,
};
