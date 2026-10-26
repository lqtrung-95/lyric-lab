import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const fox = buildInterview({
  prefix: "fox", speaker: "fox",
  greeting: { zh: "你好!你来买药吗?", vi: "Chào bạn! Bạn đến mua thuốc à?" },
  question: { zh: "昨天晚上七点你在哪儿?", vi: "Bảy giờ tối hôm qua cô ở đâu?" },
  chatter: [
    { ask: { zh: "你们几点关门?", vi: "Mấy giờ hiệu thuốc đóng cửa?" }, reply: { zh: "九点关门。", vi: "Chín giờ đóng cửa." } },
    { ask: { zh: "你们的标签是谁做的?", vi: "Nhãn của hiệu thuốc là ai làm?" }, reply: { zh: "是我们自己做的。", vi: "Là chúng tôi tự làm." } },
  ],
  answer: { zh: "昨天晚上七点,我在药店卖药。", vi: "Bảy giờ tối hôm qua, tôi đang bán thuốc ở hiệu thuốc." },
  check: { vi: "Cô Cáo nói bảy giờ tối hôm qua cô làm gì?", right: { zh: "卖药", vi: "Bán thuốc" }, wrong: [{ zh: "看电视", vi: "Xem ti vi" }, { zh: "送包裹", vi: "Gửi bưu kiện" }], rightAt: 0 },
  clue: "fox_alibi", metFlag: "met:fox",
  closing: { zh: "柜台上有一张小票,门口还有一个盒子,你可以看看。", vi: "Trên quầy có một tờ hóa đơn, trước cửa còn có một cái hộp, bạn có thể xem." },
  after: { zh: "你看到什么了?还有事吗?", vi: "Bạn thấy gì rồi? Còn việc gì không?" },
});

/** Hiệu thuốc: Cô Cáo khai đang bán thuốc, hóa đơn xác nhận nên cô vô can; nhãn là đồ ai cũng lấy được từ hộp ngoài cửa, và Thỏ đã đến đó lúc sáu giờ. */
export const PHARMACY_STORY: StorySceneDef = {
  sceneId: "pharmacy",
  sceneNpcEntries: fox.entries,
  spots: [
    { id: "pharmacy_log", clue: "pharmacy_log", label: "Hóa đơn trên quầy", sprite: "note", x: 14, y: 86, w: 5, when: { all: ["met:fox"] }, stand: { x: 20, y: 92 } },
    { id: "label_box", clue: "label_box", label: "Hộp nhãn trước cửa", sprite: "parcel", x: 68, y: 92, w: 5, when: { all: ["met:fox", "clue:pharmacy_log"] }, stand: { x: 68, y: 95 } },
  ],
  dialogues: fox.nodes,
};
