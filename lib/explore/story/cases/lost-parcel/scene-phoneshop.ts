import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const pig = buildInterview({
  prefix: "pig", speaker: "pig",
  greeting: { zh: "你好!欢迎光临,想买手机吗?", vi: "Chào bạn! Hoan nghênh, bạn muốn mua điện thoại à?" },
  question: { zh: "昨天下午六点你在哪儿?", vi: "Sáu giờ chiều hôm qua anh ở đâu?" },
  chatter: [
    { ask: { zh: "这个手机多少钱?", vi: "Chiếc điện thoại này bao nhiêu tiền?" }, reply: { zh: "三千块。", vi: "Ba nghìn tệ." } },
    { ask: { zh: "你喜欢你的工作吗?", vi: "Anh có thích công việc của mình không?" }, reply: { zh: "喜欢,我天天都在店里。", vi: "Thích, ngày nào tôi cũng ở trong tiệm." } },
  ],
  answer: { zh: "昨天下午六点,我在手机店工作。", vi: "Sáu giờ chiều hôm qua, tôi đang làm việc ở cửa hàng điện thoại." },
  check: { vi: "Anh Heo nói sáu giờ chiều hôm qua anh làm gì?", right: { zh: "工作", vi: "Làm việc" }, wrong: [{ zh: "睡觉", vi: "Ngủ" }, { zh: "吃火锅", vi: "Ăn lẩu" }], rightAt: 1 },
  clue: "pig_alibi", metFlag: "met:pig",
  closing: { zh: "墙上有一块牌子,桌子上还有一些东西,你可以看看。", vi: "Trên tường có một tấm biển, trên bàn còn vài thứ, bạn có thể xem." },
  after: { zh: "你看到什么了?还有事吗?", vi: "Bạn thấy gì rồi? Còn việc gì không?" },
});

/** Cửa hàng điện thoại: Anh Heo khai đang làm việc; nhưng bảng cho thấy tiệm đóng cửa từ 5 giờ rưỡi, và băng keo trong tiệm có chữ “机” giống cuộn ở bưu điện. */
export const PHONESHOP_STORY: StorySceneDef = {
  sceneId: "phoneshop",
  sceneNpcEntries: pig.entries,
  spots: [
    { id: "closing_sign", clue: "closing_sign", label: "Bảng giờ đóng cửa", sprite: "note", x: 14, y: 86, w: 5, when: { all: ["met:pig"] }, stand: { x: 20, y: 92 } },
    { id: "shop_tapes", clue: "shop_tapes", label: "Băng keo trong tiệm", sprite: "tape", x: 68, y: 92, w: 4, when: { all: ["met:pig"] }, stand: { x: 68, y: 95 } },
  ],
  dialogues: pig.nodes,
};
