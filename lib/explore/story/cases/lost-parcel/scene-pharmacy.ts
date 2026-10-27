import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const fox = buildInterview({
  prefix: "fox", speaker: "fox",
  greeting: { zh: "你好!你哪里不舒服?", vi: "Chào bạn! Bạn khó chịu ở đâu?" },
  question: { zh: "昨天下午六点你在哪儿?", vi: "Sáu giờ chiều hôm qua cô ở đâu?" },
  chatter: [
    { ask: { zh: "你们几点关门?", vi: "Hiệu thuốc mấy giờ đóng cửa?" }, reply: { zh: "晚上八点关门。", vi: "Tám giờ tối đóng cửa." } },
    { ask: { zh: "感冒了吃什么药?", vi: "Cảm cúm uống thuốc gì?" }, reply: { zh: "多喝水,早点休息。", vi: "Uống nhiều nước, nghỉ sớm." } },
  ],
  answer: { zh: "昨天下午六点,我在药店卖药。", vi: "Sáu giờ chiều hôm qua, tôi đang bán thuốc ở hiệu thuốc." },
  check: { vi: "Cô Cáo nói sáu giờ chiều hôm qua cô đang làm gì?", right: { zh: "卖药", vi: "Bán thuốc" }, wrong: [{ zh: "剪头发", vi: "Cắt tóc" }, { zh: "吃火锅", vi: "Ăn lẩu" }], rightAt: 0 },
  clue: "fox_alibi", metFlag: "met:fox",
  closing: { zh: "收据在柜台上。", vi: "Hóa đơn ở trên quầy." },
  after: { zh: "还需要什么药吗?", vi: "Bạn còn cần thuốc gì không?" },
});

/** Hiệu thuốc: hóa đơn cho thấy Cáo bán thuốc suốt lúc sáu giờ nên có chứng cứ ngoại phạm thật. */
export const PHARMACY_STORY: StorySceneDef = {
  sceneId: "pharmacy",
  sceneNpcEntries: fox.entries,
  spots: [
    { id: "pharmacy_receipt", clue: "pharmacy_receipt", label: "Hóa đơn hiệu thuốc", sprite: "note", x: 14, y: 86, w: 5, when: { all: ["met:fox"] }, stand: { x: 20, y: 92 } },
  ],
  dialogues: fox.nodes,
};
